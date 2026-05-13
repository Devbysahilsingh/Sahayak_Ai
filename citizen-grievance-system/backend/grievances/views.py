from datetime import datetime, timezone

from bson import ObjectId
from django.conf import settings
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .documents import (
    ActiveWork,
    Complaint,
    Department,
    Feedback,
    Notification,
    Officer,
    User,
)
from .services import (
    active_work_to_dict,
    admin_approve_false_report,
    admin_approve_resolution,
    assign_complaint,
    complaint_to_dict,
    create_audit,
    create_complaint,
    create_otp_for_mobile,
    department_to_dict,
    ensure_default_departments,
    escalate_complaint,
    geoapify_reverse,
    geoapify_route,
    geoapify_search,
    generate_work_id,
    get_officer_for_user,
    haversine_km,
    mark_false_complaint,
    notification_to_dict,
    normalize_category,
    officer_to_dict,
    require_user,
    send_admin_response,
    send_reminder,
    transcribe_audio_file,
    update_complaint_status,
    user_to_dict,
    verify_mobile_otp,
    worker_report_false_complaint,
    worker_request_more_time,
    worker_resolve_complaint,
    worker_start_complaint,
    worker_update_location,
)

WORKER_RADIUS_KM = 4


def ok(data=None, status=200):
    return Response(data or {}, status=status)


def error(message, status=400, **extra):
    payload = {"error": message}
    payload.update(extra)
    return Response(payload, status=status)


def parse_datetime(value):
    if isinstance(value, datetime):
        return value
    if not value:
        return None
    parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    if parsed.tzinfo:
        parsed = parsed.astimezone(timezone.utc).replace(tzinfo=None)
    return parsed


def get_document_or_404(model, document_id):
    if not ObjectId.is_valid(str(document_id)):
        return None
    return model.objects(id=document_id).first()


ADMIN_ROLES = {"admin", "super_admin"}
STAFF_ROLES = {"admin", "super_admin", "officer"}


def is_staff(user):
    return user and user.role in STAFF_ROLES


def is_admin(user):
    return user and user.role in ADMIN_ROLES


def can_view_complaint(user, complaint):
    if is_admin(user):
        return True
    if user and user.role == "officer":
        officer = get_officer_for_user(user)
        assigned_to_worker = bool(
            officer and complaint.assigned_officer and str(complaint.assigned_officer.id) == str(officer.id)
        )
        return assigned_to_worker or complaint_near_officer(complaint, officer)
    return complaint.citizen and str(complaint.citizen.id) == str(user.id)


def require_worker(request):
    user, response, status = require_user(request)
    if response:
        return None, None, response, status
    if user.role in ADMIN_ROLES:
        return user, None, None, None
    if user.role != "officer":
        return None, None, {"error": "Worker access required."}, 403
    officer = get_officer_for_user(user)
    if not officer:
        return None, None, {"error": "No active officer profile is linked to this login."}, 403
    return user, officer, None, None


def complaint_near_officer(complaint, officer, radius_km=WORKER_RADIUS_KM):
    if not officer:
        return True
    if not complaint.assigned_department or not officer.department:
        return False
    if str(complaint.assigned_department.id) != str(officer.department.id):
        return False
    if officer.latitude is None or officer.longitude is None:
        return False
    if complaint.latitude is None or complaint.longitude is None:
        return False
    return haversine_km(officer.latitude, officer.longitude, complaint.latitude, complaint.longitude) <= radius_km


def require_admin(request):
    user, response, status = require_user(request)
    if response:
        return None, response, status
    if not is_admin(user):
        return None, {"error": "Admin access required."}, 403
    return user, None, None


def find_complaint(complaint_id):
    return get_document_or_404(Complaint, complaint_id) or Complaint.objects(tracking_id=complaint_id).first()


class HealthView(APIView):
    def get(self, request):
        return ok(
            {
                "status": "ok",
                "service": "Django Grievance Backend",
                "database": "MongoDB via MongoEngine",
                "ai_engine_url": settings.AI_ENGINE_URL,
                "geoapify_configured": bool(settings.GEOAPIFY_API_KEY)
                and settings.GEOAPIFY_API_KEY != "your_geoapify_api_key_here",
            }
        )


class VoiceTranscriptionView(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request):
        user, response, status = require_user(request)
        if response:
            return ok(response, status)
        audio = request.FILES.get("audio")
        if not audio:
            return error("audio file is required.")
        try:
            result = transcribe_audio_file(audio)
        except ValueError as exc:
            return error(str(exc), status=502)
        return ok(
            {
                "text": result.get("text", ""),
                "detected_language": result.get("language", ""),
                "language_probability": result.get("language_probability", 0.0),
                "model": result.get("model", ""),
            }
        )


class SendOtpView(APIView):
    def post(self, request):
        mobile_number = str(request.data.get("mobile_number", "")).strip()
        if not mobile_number:
            return error("mobile_number is required.")
        user, otp = create_otp_for_mobile(mobile_number)
        response = {
            "message": "OTP generated successfully.",
            "mobile_number": user.mobile_number,
            "otp_expires_minutes": settings.OTP_EXPIRY_MINUTES,
        }
        if settings.OTP_DEV_MODE:
            response["dev_otp"] = otp
            response["note"] = "Prototype mode: OTP is returned in response. No SMS API is used."
        return ok(response, status=201)


class VerifyOtpView(APIView):
    def post(self, request):
        mobile_number = str(request.data.get("mobile_number", "")).strip()
        otp = str(request.data.get("otp", "")).strip()
        if not mobile_number or not otp:
            return error("mobile_number and otp are required.")
        user, message = verify_mobile_otp(mobile_number, otp)
        if not user:
            return error(message, status=400)
        return ok(
            {
                "message": "OTP verified successfully.",
                "token": user.auth_token,
                "user": user_to_dict(user),
            }
        )


class WorkerSignupView(APIView):
    def post(self, request):
        mobile_number = str(request.data.get("mobile_number", "")).strip()
        name = str(request.data.get("name", "")).strip()
        department_id = request.data.get("department_id")
        if not mobile_number or not name or not department_id:
            return error("name, mobile_number and department_id are required.")
        if not ObjectId.is_valid(str(department_id)):
            return error("Invalid department_id.")
        department = Department.objects(id=department_id, is_active=True).first()
        if not department:
            return error("Department not found.", status=404)

        user = User.objects(mobile_number=mobile_number).modify(
            upsert=True,
            new=True,
            set__mobile_number=mobile_number,
            set__name=name,
            set__role="officer",
            set__is_blocked=False,
            set__blocked_reason="",
        )
        officer_updates = {
            "set__name": name,
            "set__mobile_number": mobile_number,
            "set__department": department,
            "set__zones": request.data.get("zones", []),
            "set__is_active": True,
        }
        email = str(request.data.get("email") or "").strip()
        if email:
            officer_updates["set__email"] = email
        officer = Officer.objects(mobile_number=mobile_number).modify(
            upsert=True,
            new=True,
            **officer_updates,
        )
        user, otp = create_otp_for_mobile(mobile_number)
        response = {
            "message": "Worker profile created. Verify OTP to login.",
            "user": user_to_dict(user),
            "officer": officer_to_dict(officer),
            "otp_expires_minutes": settings.OTP_EXPIRY_MINUTES,
        }
        if settings.OTP_DEV_MODE:
            response["dev_otp"] = otp
            response["note"] = "Prototype mode: OTP is returned in response. No SMS API is used."
        return ok(response, status=201)


class MeView(APIView):
    def get(self, request):
        user, response, status = require_user(request)
        if response:
            return ok(response, status=status)
        return ok({"user": user_to_dict(user)})


class ComplaintListCreateView(APIView):
    parser_classes = [JSONParser, FormParser, MultiPartParser]

    def get(self, request):
        user, response, status = require_user(request)
        if response:
            return ok(response, status=status)
        query = Complaint.objects
        status_value = request.query_params.get("status")
        category = request.query_params.get("category")
        priority = request.query_params.get("priority")
        ward = request.query_params.get("ward")
        assigned_department = request.query_params.get("department_id")
        citizen_id = request.query_params.get("citizen_id")
        search = request.query_params.get("search")

        if status_value:
            query = query.filter(status=status_value)
        if category:
            query = query.filter(category=category)
        if priority:
            query = query.filter(priority=priority)
        if ward:
            query = query.filter(ward=ward)
        if assigned_department and ObjectId.is_valid(assigned_department):
            query = query.filter(assigned_department=assigned_department)
        if user.role == "citizen":
            query = query.filter(citizen=user)
        elif user.role == "officer":
            officer = get_officer_for_user(user)
            query = query.filter(assigned_officer=officer) if officer else Complaint.objects(id__exists=False)
        elif citizen_id and ObjectId.is_valid(citizen_id):
            query = query.filter(citizen=citizen_id)
        if search:
            query = query.filter(
                __raw__={
                    "$or": [
                        {"tracking_id": {"$regex": search, "$options": "i"}},
                        {"raw_text": {"$regex": search, "$options": "i"}},
                        {"address": {"$regex": search, "$options": "i"}},
                        {"ward": {"$regex": search, "$options": "i"}},
                        {"zone": {"$regex": search, "$options": "i"}},
                    ]
                }
            )

        limit = min(int(request.query_params.get("limit", 50)), 100)
        complaints = query.order_by("-created_at")[:limit]
        return ok({"results": [complaint_to_dict(item) for item in complaints]})

    def post(self, request):
        user, response, status = require_user(request)
        if response:
            return ok(response, status=status)
        if not user.is_verified:
            return error("Mobile number must be OTP verified.", status=403)
        try:
            complaint = create_complaint(user, request.data, uploaded_files=request.FILES.getlist("attachments"))
            create_audit(user, "complaint_created", "complaint", str(complaint.id))
            return ok({"complaint": complaint_to_dict(complaint)}, status=201)
        except ValueError as exc:
            return error(str(exc), status=400)
        except Exception as exc:
            return error(f"Complaint submission failed: {exc}", status=500)


class ComplaintDetailView(APIView):
    def get(self, request, complaint_id):
        user, response, status = require_user(request)
        if response:
            return ok(response, status=status)
        complaint = find_complaint(complaint_id)
        if not complaint:
            return error("Complaint not found.", status=404)
        if not can_view_complaint(user, complaint):
            return error("You can only view your own complaints.", status=403)
        return ok({"complaint": complaint_to_dict(complaint)})


class ComplaintStatusView(APIView):
    def patch(self, request, complaint_id):
        user, response, status = require_admin(request)
        if response:
            return ok(response, status=status)
        complaint = find_complaint(complaint_id)
        if not complaint:
            return error("Complaint not found.", status=404)
        status_value = request.data.get("status")
        if not status_value:
            return error("status is required.")
        note = request.data.get("note", "")
        update_complaint_status(
            complaint,
            status_value,
            note=note,
            actor=user.mobile_number if user else "system",
        )
        return ok({"complaint": complaint_to_dict(complaint)})


class ComplaintAssignmentView(APIView):
    def patch(self, request, complaint_id):
        user, response, status = require_admin(request)
        if response:
            return ok(response, status=status)
        complaint = find_complaint(complaint_id)
        if not complaint:
            return error("Complaint not found.", status=404)
        assign_complaint(
            complaint,
            department_id=request.data.get("department_id"),
            officer_id=request.data.get("officer_id"),
            note=request.data.get("note", ""),
            actor=user.mobile_number if user else "admin",
        )
        return ok({"complaint": complaint_to_dict(complaint)})


class ComplaintReminderView(APIView):
    def post(self, request, complaint_id):
        user, response, status = require_admin(request)
        if response:
            return ok(response, status=status)
        complaint = find_complaint(complaint_id)
        if not complaint:
            return error("Complaint not found.", status=404)
        send_reminder(complaint, actor=user.mobile_number if user else "admin")
        return ok({"complaint": complaint_to_dict(complaint)})


class ComplaintEscalationView(APIView):
    def post(self, request, complaint_id):
        user, response, status = require_admin(request)
        if response:
            return ok(response, status=status)
        complaint = find_complaint(complaint_id)
        if not complaint:
            return error("Complaint not found.", status=404)
        escalate_complaint(
            complaint,
            escalated_to=request.data.get("escalated_to", ""),
            actor=user.mobile_number if user else "admin",
        )
        return ok({"complaint": complaint_to_dict(complaint)})


class ComplaintAdminResponseView(APIView):
    def patch(self, request, complaint_id):
        user, response, status = require_admin(request)
        if response:
            return ok(response, status=status)
        complaint = find_complaint(complaint_id)
        if not complaint:
            return error("Complaint not found.", status=404)
        try:
            send_admin_response(
                complaint,
                user,
                message=request.data.get("response_message", ""),
                eta_hours=request.data.get("estimated_resolution_hours"),
                status=request.data.get("status", ""),
            )
        except ValueError as exc:
            return error(str(exc), status=400)
        return ok({"complaint": complaint_to_dict(complaint)})


class ProcessOverdueComplaintsView(APIView):
    def post(self, request):
        now = datetime.utcnow()
        overdue = Complaint.objects(
            sla_deadline__lt=now,
            status__nin=["resolved", "closed", "escalated"],
        )
        reminded = 0
        escalated = 0
        for complaint in overdue:
            if complaint.reminder_count == 0:
                send_reminder(complaint, actor="system")
                reminded += 1
            else:
                escalate_complaint(
                    complaint,
                    escalated_to="higher_authority",
                    actor="system",
                )
                escalated += 1
        return ok(
            {
                "message": "Overdue complaint processing completed.",
                "reminded": reminded,
                "escalated": escalated,
            }
        )


class ComplaintFeedbackView(APIView):
    parser_classes = [JSONParser, FormParser, MultiPartParser]

    def post(self, request, complaint_id):
        user, response, status = require_user(request)
        if response:
            return ok(response, status=status)
        complaint = find_complaint(complaint_id)
        if not complaint:
            return error("Complaint not found.", status=404)
        if not can_view_complaint(user, complaint):
            return error("You can only give feedback on your own complaints.", status=403)

        feedback_type = request.data.get("type", "citizen_feedback")
        note = request.data.get("comment", "")
        if request.data.get("is_false_complaint"):
            if not is_admin(user):
                return error("Admin access required to mark a complaint false.", status=403)
            if not note:
                return error("verification note is required to mark a complaint false.")
            evidence_files = request.FILES.getlist("evidence")
            try:
                mark_false_complaint(complaint, user, note, evidence_files=evidence_files)
            except ValueError as exc:
                return error(str(exc), status=400)
        else:
            Feedback(
                complaint=complaint,
                user=user,
                type=feedback_type,
                comment=note,
                corrected_category=request.data.get("corrected_category", ""),
                corrected_priority=request.data.get("corrected_priority", ""),
            ).save()
            if feedback_type == "resolution_confirmed":
                update_complaint_status(
                    complaint,
                    "closed",
                    note=note or "Citizen confirmed the complaint is resolved.",
                    actor=user.mobile_number,
                )
            elif feedback_type == "resolution_rejected" and complaint.status in ["resolved", "closed"]:
                update_complaint_status(
                    complaint,
                    "in_progress",
                    note=note or "Citizen reported the issue is not resolved yet.",
                    actor=user.mobile_number,
                )
        return ok({"complaint": complaint_to_dict(complaint)})


class WorkerComplaintsView(APIView):
    def get(self, request):
        user, officer, response, status = require_worker(request)
        if response:
            return ok(response, status=status)

        query = Complaint.objects(is_valid_grievance=True).filter(status__nin=["rejected", "closed", "false_review", "resolution_review"])
        if officer:
            query = query.filter(assigned_department=officer.department)

        view = request.query_params.get("view", "")
        now = datetime.utcnow()
        if view == "high-priority":
            query = query.filter(priority__in=["Critical", "High"])
        elif view == "overdue":
            query = query.filter(sla_deadline__lt=now, status__nin=["resolved", "closed", "escalated"])
        elif view == "resolved":
            query = query.filter(status="resolved")
        elif view == "assigned":
            query = query.filter(status__in=["assigned", "in_progress"])

        limit = min(int(request.query_params.get("limit", 100)), 150)
        complaints = [
            item for item in query.order_by("-created_at")[:300]
            if not officer or complaint_near_officer(item, officer)
        ][:limit]
        return ok(
            {
                "worker": officer_to_dict(officer),
                "radius_km": WORKER_RADIUS_KM,
                "results": [complaint_to_dict(item) for item in complaints],
            }
        )


class WorkerLocationView(APIView):
    def patch(self, request):
        user, officer, response, status = require_worker(request)
        if response:
            return ok(response, status=status)
        if not officer:
            return error("Admin users do not have a worker location profile.", status=400)
        if request.data.get("latitude") in (None, "") or request.data.get("longitude") in (None, ""):
            return ok(
                {
                    "worker": officer_to_dict(officer),
                    "message": "Worker location not updated because coordinates were not provided.",
                }
            )
        try:
            worker_update_location(officer, request.data.get("latitude"), request.data.get("longitude"))
        except ValueError as exc:
            return error(str(exc), status=400)
        return ok({"worker": officer_to_dict(officer)})


class WorkerComplaintActionView(APIView):
    parser_classes = [JSONParser, FormParser, MultiPartParser]

    def post(self, request, complaint_id, action):
        user, officer, response, status = require_worker(request)
        if response:
            return ok(response, status=status)
        complaint = find_complaint(complaint_id)
        if not complaint:
            return error("Complaint not found.", status=404)
        if officer and not complaint_near_officer(complaint, officer):
            return error("This complaint is outside your department or 4 km field radius.", status=403)
        if officer and action != "start":
            assigned_to_this_worker = bool(
                complaint.assigned_officer and str(complaint.assigned_officer.id) == str(officer.id)
            )
            if not assigned_to_this_worker:
                return error("Start this field job before submitting worker actions.", status=403)
        if officer and action == "start":
            complaint.assigned_officer = officer

        try:
            if action == "start":
                worker_start_complaint(complaint, user)
            elif action == "false-report":
                worker_report_false_complaint(
                    complaint,
                    user,
                    request.data.get("note", ""),
                    evidence_files=request.FILES.getlist("evidence"),
                )
            elif action == "resolve":
                worker_resolve_complaint(
                    complaint,
                    user,
                    request.data.get("note", ""),
                    evidence_files=request.FILES.getlist("evidence"),
                )
            elif action == "more-time":
                worker_request_more_time(complaint, user, request.data.get("note", ""))
            else:
                return error("Unknown worker action.", status=404)
        except ValueError as exc:
            return error(str(exc), status=400)

        return ok({"complaint": complaint_to_dict(complaint)})

class AdminComplaintApprovalView(APIView):
    def post(self, request, complaint_id, action):
        user, response, status = require_admin(request)
        if response:
            return ok(response, status=status)
        complaint = find_complaint(complaint_id)
        if not complaint:
            return error("Complaint not found.", status=404)
        note = request.data.get("note", "")
        if action == "approve-false":
            if complaint.status != "false_review":
                return error("Only worker false-report review complaints can be approved as false.", status=400)
            result = admin_approve_false_report(complaint, user, note)
            return ok(result)
        if action == "approve-resolution":
            if complaint.status != "resolution_review":
                return error("Only worker resolution review complaints can be approved as resolved.", status=400)
            admin_approve_resolution(complaint, user, note)
            return ok({"complaint": complaint_to_dict(complaint)})
        return error("Unknown admin approval action.", status=404)


class ActiveWorkListCreateView(APIView):
    def get(self, request):
        query = ActiveWork.objects
        status_value = request.query_params.get("status")
        category = request.query_params.get("category")
        if status_value:
            query = query.filter(status=status_value)
        if category:
            query = query.filter(category=category)
        return ok({"results": [active_work_to_dict(item) for item in query.order_by("-created_at")[:100]]})

    def post(self, request):
        category = normalize_category(request.data.get("category"))
        department = Department.objects(category_key=category).first() if category else None
        if not category or not request.data.get("title") or not request.data.get("public_message"):
            return error("category, title, and public_message are required.")
        try:
            work = ActiveWork(
                work_id=generate_work_id(),
                department=department,
                category=category,
                work_type=request.data.get("work_type", category),
                title=request.data.get("title"),
                public_message=request.data.get("public_message"),
                latitude=float(request.data.get("latitude")),
                longitude=float(request.data.get("longitude")),
                radius_km=float(request.data.get("radius_km", settings.ACTIVE_WORK_MATCH_RADIUS_KM)),
                address=request.data.get("address", ""),
                ward=request.data.get("ward", ""),
                zone=request.data.get("zone", ""),
                start_time=parse_datetime(request.data.get("start_time")) or datetime.utcnow(),
                expected_end_time=parse_datetime(request.data.get("expected_end_time")),
                status=request.data.get("status", "active"),
            ).save()
        except (TypeError, ValueError) as exc:
            return error(f"Invalid active work payload: {exc}")
        return ok({"active_work": active_work_to_dict(work)}, status=201)


class ActiveWorkDetailView(APIView):
    def get(self, request, work_id):
        work = get_document_or_404(ActiveWork, work_id) or ActiveWork.objects(work_id=work_id).first()
        if not work:
            return error("Active work not found.", status=404)
        return ok({"active_work": active_work_to_dict(work)})

    def patch(self, request, work_id):
        work = get_document_or_404(ActiveWork, work_id) or ActiveWork.objects(work_id=work_id).first()
        if not work:
            return error("Active work not found.", status=404)
        for field in [
            "category",
            "work_type",
            "title",
            "public_message",
            "address",
            "ward",
            "zone",
            "status",
        ]:
            if field in request.data:
                setattr(work, field, request.data[field])
        for field in ["latitude", "longitude", "radius_km"]:
            if field in request.data:
                setattr(work, field, float(request.data[field]))
        for field in ["start_time", "expected_end_time"]:
            if field in request.data:
                setattr(work, field, parse_datetime(request.data[field]))
        work.save()
        return ok({"active_work": active_work_to_dict(work)})


class DepartmentListCreateView(APIView):
    def get(self, request):
        ensure_default_departments()
        return ok({"results": [department_to_dict(item) for item in Department.objects(is_active=True).order_by("name")]})

    def post(self, request):
        name = request.data.get("name")
        category_key = request.data.get("category_key")
        if not name or not category_key:
            return error("name and category_key are required.")
        department = Department(
            name=name,
            category_key=category_key,
            description=request.data.get("description", ""),
            default_eta_hours=int(request.data.get("default_eta_hours", 24)),
            is_active=bool(request.data.get("is_active", True)),
        ).save()
        return ok({"department": department_to_dict(department)}, status=201)


class OfficerListCreateView(APIView):
    def get(self, request):
        return ok({"results": [officer_to_dict(item) for item in Officer.objects.order_by("name")]})

    def post(self, request):
        department = None
        department_id = request.data.get("department_id")
        if department_id and ObjectId.is_valid(str(department_id)):
            department = Department.objects(id=department_id).first()
        if not request.data.get("name") or not request.data.get("mobile_number"):
            return error("name and mobile_number are required.")
        officer = Officer(
            name=request.data.get("name"),
            mobile_number=request.data.get("mobile_number"),
            email=request.data.get("email", ""),
            department=department,
            zones=request.data.get("zones", []),
            senior_officer_id=request.data.get("senior_officer_id", ""),
            is_active=bool(request.data.get("is_active", True)),
        ).save()
        return ok({"officer": officer_to_dict(officer)}, status=201)


class DashboardStatsView(APIView):
    def get(self, request):
        now = datetime.utcnow()
        complaints = Complaint.objects
        by_status = {}
        by_category = {}
        by_priority = {}
        unresolved_statuses = ["submitted", "assigned", "in_progress", "manual_review", "escalated"]
        unresolved_complaints = Complaint.objects(status__nin=["resolved", "closed", "auto_responded"])
        for item in complaints.only("status", "category", "priority"):
            by_status[item.status] = by_status.get(item.status, 0) + 1
            by_category[item.category] = by_category.get(item.category, 0) + 1
            if item.status not in ["resolved", "closed", "auto_responded"]:
                by_priority[item.priority] = by_priority.get(item.priority, 0) + 1
        overdue = Complaint.objects(sla_deadline__lt=now, status__nin=["resolved", "closed"]).count()
        return ok(
            {
                "total_complaints": complaints.count(),
                "pending_complaints": Complaint.objects(status__in=unresolved_statuses).count(),
                "manual_review": Complaint.objects(manual_review_required=True).count(),
                "high_priority": unresolved_complaints.filter(priority__in=["High", "Critical"]).count(),
                "overdue": overdue,
                "escalated": Complaint.objects(is_escalated=True).count(),
                "auto_responded": Complaint.objects(status="auto_responded").count(),
                "rejected": Complaint.objects(status="rejected").count(),
                "multi_department": Complaint.objects(__raw__={"ai_departments.1": {"$exists": True}}).count(),
                "false_complaint_reviews": Complaint.objects(is_false=True).count(),
                "active_work": ActiveWork.objects(status="active").count(),
                "blocked_users": User.objects(is_blocked=True).count(),
                "by_status": by_status,
                "by_category": by_category,
                "by_priority": by_priority,
            }
        )


class AnalyticsView(APIView):
    def get(self, request):
        state = (request.query_params.get("state") or "").strip()
        query = Complaint.objects
        if state:
            query = query.filter(
                __raw__={
                    "$or": [
                        {"address": {"$regex": state, "$options": "i"}},
                        {"ward": {"$regex": state, "$options": "i"}},
                        {"zone": {"$regex": state, "$options": "i"}},
                    ]
                }
            )
        complaints = list(query)
        total = len(complaints)
        manual_review = sum(1 for item in complaints if item.manual_review_required)
        low_confidence = sum(1 for item in complaints if item.confidence_score < settings.CLASSIFICATION_CONFIDENCE_THRESHOLD)
        classified = sum(1 for item in complaints if item.category and item.category != "manual_review")
        confidence_values = [item.confidence_score for item in complaints if item.confidence_score]
        average_confidence = round((sum(confidence_values) / len(confidence_values)) * 100, 2) if confidence_values else 0

        department_volume = {}
        status_volume = {}
        priority_volume = {}
        heatmap_points = []
        for item in complaints:
            department_volume[item.category] = department_volume.get(item.category, 0) + 1
            status_volume[item.status] = status_volume.get(item.status, 0) + 1
            priority_volume[item.priority] = priority_volume.get(item.priority, 0) + 1
            if item.latitude is not None and item.longitude is not None:
                heatmap_points.append(
                    {
                        "id": item.tracking_id,
                        "latitude": item.latitude,
                        "longitude": item.longitude,
                        "category": item.category,
                        "priority": item.priority,
                        "status": item.status,
                        "address": item.address,
                        "ward": item.ward,
                    }
                )

        return ok(
            {
                "total_classified": classified,
                "total_complaints": total,
                "manual_review": manual_review,
                "low_confidence": low_confidence,
                "average_confidence": average_confidence,
                "estimated_accuracy": max(0, round(100 - ((manual_review / total) * 100), 2)) if total else 0,
                "department_volume": department_volume,
                "status_volume": status_volume,
                "priority_volume": priority_volume,
                "heatmap_points": heatmap_points,
                "state_filter": state,
            }
        )


class UserListView(APIView):
    def get(self, request):
        query = User.objects
        status_value = request.query_params.get("status")
        if status_value == "blocked":
            query = query.filter(is_blocked=True)
        elif status_value == "restricted":
            query = query.filter(is_restricted=True)
        return ok({"results": [user_to_dict(user) for user in query.order_by("-created_at")[:100]]})


class UserBlockView(APIView):
    def post(self, request, user_id):
        user = get_document_or_404(User, user_id)
        if not user:
            return error("User not found.", status=404)
        action = request.data.get("action", "block")
        if action == "unblock":
            user.is_blocked = False
            user.blocked_reason = ""
        elif action == "restrict":
            user.is_restricted = True
        elif action == "warn":
            user.warnings += 1
        else:
            user.is_blocked = True
            user.blocked_reason = request.data.get("reason", "Blocked by admin.")
        user.save()
        return ok({"user": user_to_dict(user)})


class NotificationsView(APIView):
    def get(self, request):
        user, response, status = require_user(request)
        if response:
            return ok(response, status=status)
        query = Notification.objects(recipient=user)
        return ok({"results": [notification_to_dict(item) for item in query.order_by("-created_at")[:100]]})


class ClassificationFeedbackView(APIView):
    def post(self, request):
        complaint = None
        complaint_id = request.data.get("complaint_id")
        if complaint_id:
            complaint = get_document_or_404(Complaint, complaint_id) or Complaint.objects(
                tracking_id=complaint_id
            ).first()
        Feedback(
            complaint=complaint,
            type="classification_correction",
            corrected_category=request.data.get("corrected_category", ""),
            corrected_priority=request.data.get("corrected_priority", ""),
            comment=request.data.get("comment", ""),
        ).save()
        if complaint and request.data.get("corrected_category"):
            complaint.category = request.data["corrected_category"]
            complaint.manual_review_required = False
            if request.data.get("corrected_priority"):
                complaint.priority = request.data["corrected_priority"]
            complaint.save()
        return ok({"message": "Classification feedback saved."}, status=201)



class GeoRouteView(APIView):
    def get(self, request):
        user, officer, response, status = require_worker(request)
        if response:
            return ok(response, status)
        try:
            from_lat = float(request.query_params.get("from_lat"))
            from_lon = float(request.query_params.get("from_lon"))
            to_lat = float(request.query_params.get("to_lat"))
            to_lon = float(request.query_params.get("to_lon"))
        except (TypeError, ValueError):
            return error("from_lat, from_lon, to_lat, and to_lon are required.")

        if officer:
            worker_update_location(officer, from_lat, from_lon)

        mode = request.query_params.get("mode") or "drive"
        try:
            return ok(geoapify_route(from_lat, from_lon, to_lat, to_lon, mode=mode))
        except ValueError as exc:
            return error(str(exc), status=400)
        except Exception as exc:
            return error(f"Could not generate route: {exc}", status=502)

class GeoReverseView(APIView):
    def get(self, request):
        try:
            return ok(geoapify_reverse(request.query_params.get("lat"), request.query_params.get("lon")))
        except ValueError as exc:
            return error(str(exc), status=503)
        except Exception as exc:
            return error(f"Geoapify reverse geocoding failed: {exc}", status=502)


class GeoSearchView(APIView):
    def get(self, request):
        query = request.query_params.get("q")
        if not query:
            return error("q query parameter is required.")
        try:
            return ok(geoapify_search(query))
        except ValueError as exc:
            return error(str(exc), status=503)
        except Exception as exc:
            return error(f"Geoapify search failed: {exc}", status=502)






