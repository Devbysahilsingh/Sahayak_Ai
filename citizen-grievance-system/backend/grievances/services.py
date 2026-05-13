import math
import os
import random
import uuid
from datetime import datetime, timedelta
from pathlib import Path

import requests
from django.conf import settings

from .documents import (
    ActiveWork,
    AuditLog,
    Complaint,
    Department,
    Feedback,
    Notification,
    Officer,
    User,
)


CATEGORY_LABELS = {
    "water_supply": "Water Supply",
    "drainage_sewer": "Drainage & Flood Control",
    "electricity": "Electricity",
    "roads": "Roads & Traffic",
    "streetlight": "Street Lighting",
    "garbage_cleaning": "Sanitation & Waste",
    "traffic_safety": "Roads & Traffic",
    "police_safety": "Public Safety & Police",
    "women_safety": "Women & Child Safety",
    "cyber_crime": "Cyber & Digital Services",
    "pollution_control": "Pollution Control",
    "animal_control": "Animal Control",
    "health_hospital": "Health & Public Hygiene",
    "fire_emergency": "Fire Department",
    "urban_housing_encroachment": "Urban Housing & Encroachment",
    "public_transport": "Public Transport",
    "disaster_management": "Disaster Management",
    "park_garden": "Public Parks & Infrastructure",
    "emergency_medical_response": "Emergency Medical Response",
    "not_applicable": "Not Applicable",
    "manual_review": "Manual Review",
}

DEFAULT_DEPARTMENTS = [
    ("Water Supply", "water_supply", 24),
    ("Drainage & Flood Control", "drainage_sewer", 24),
    ("Electricity", "electricity", 12),
    ("Roads & Traffic", "roads", 120),
    ("Street Lighting", "streetlight", 24),
    ("Sanitation & Waste", "garbage_cleaning", 36),
    ("Public Safety & Police", "police_safety", 12),
    ("Women & Child Safety", "women_safety", 12),
    ("Cyber & Digital Services", "cyber_crime", 48),
    ("Pollution Control", "pollution_control", 48),
    ("Animal Control", "animal_control", 24),
    ("Health & Public Hygiene", "health_hospital", 12),
    ("Fire Department", "fire_emergency", 6),
    ("Urban Housing & Encroachment", "urban_housing_encroachment", 72),
    ("Public Transport", "public_transport", 48),
    ("Disaster Management", "disaster_management", 6),
    ("Public Parks & Infrastructure", "park_garden", 72),
    ("Emergency Medical Response", "emergency_medical_response", 4),
    ("Not Applicable", "not_applicable", 0),
    ("Manual Review", "manual_review", 24),
]

ETA_RULES = {
    "Critical": {
        "electricity": 4,
        "water_supply": 8,
        "sanitation": 12,
        "roads": 24,
        "public_services": 24,
        "health": 4,
        "transport": 12,
        "education": 24,
        "manual_review": 12,
    },
    "High": {
        "electricity": 12,
        "water_supply": 24,
        "sanitation": 48,
        "roads": 72,
        "public_services": 72,
        "health": 12,
        "transport": 48,
        "education": 72,
        "manual_review": 24,
    },
    "Medium": {
        "electricity": 24,
        "water_supply": 48,
        "sanitation": 72,
        "roads": 120,
        "public_services": 120,
        "health": 48,
        "transport": 72,
        "education": 120,
        "manual_review": 48,
    },
    "Low": {
        "electricity": 48,
        "water_supply": 72,
        "sanitation": 120,
        "roads": 168,
        "public_services": 168,
        "health": 72,
        "transport": 120,
        "education": 168,
        "manual_review": 72,
    },
}

KEYWORD_CATEGORIES = {
    "electricity": [
        "electricity",
        "power",
        "light",
        "current",
        "wire",
        "transformer",
        "bijli",
        "spark",
        "pole",
        "voltage",
    ],
    "water_supply": [
        "water",
        "paani",
        "pipeline",
        "tap",
        "supply",
        "contaminated",
        "leakage",
        "drinking",
    ],
    "garbage_cleaning": [
        "garbage",
        "waste",
        "toilet",
        "sanitation",
        "kachra",
    ],
    "drainage_sewer": [
        "sewer",
        "drain",
        "nala",
        "overflow",
        "manhole",
    ],
    "roads": [
        "road",
        "pothole",
        "gaddha",
        "traffic",
        "street",
        "footpath",
        "accident",
        "signal",
    ],
    "health_hospital": ["hospital", "doctor", "medicine", "health", "clinic", "ambulance"],
    "public_transport": ["bus", "transport", "metro", "vehicle", "auto"],
    "traffic_safety": ["parking", "traffic", "signal", "jam"],
}

CRITICAL_WORDS = [
    "fire",
    "blast",
    "spark",
    "electrocution",
    "current leak",
    "accident",
    "dead",
    "injured",
    "contaminated",
    "poison",
    "emergency",
    "danger",
    "hospital",
]

HIGH_WORDS = [
    "urgent",
    "overflow",
    "blocked",
    "leak",
    "no water",
    "no electricity",
    "school",
    "children",
    "hospital",
]

MANUAL_REVIEW_TEXT_TERMS = [
    "aadhaar",
    "aadhar",
    "आधार",
    "আধার",
    "ஆதார்",
    "ration card",
    "राशन",
    "রেশন",
    "ரேஷன்",
    "certificate",
    "प्रमाणपत्र",
    "सर्टिफिकेट",
    "সার্টিফিকেট",
    "சான்றிதழ்",
    "pension",
    "पेंशन",
    "পেনশন",
    "ஓய்வூதியம்",
    "welfare scheme",
    "stale food",
    "unsafe food",
    "food stall",
    "बासी",
    "ठेला",
    "বাসি খাবার",
    "பழைய உணவு",
]

PRIVATE_ISSUE_TEXT_TERMS = [
    "my fan",
    "fan is not working",
    "bedroom fan",
    "home fan",
    "घर का पंखा",
    "मेरा पंखा",
    "private wifi",
    "wifi slow",
    "router",
    "ac not cooling",
    "ac is broken",
    "air conditioner",
    "एसी",
    "inverter backup",
    "my inverter",
    "ghar ka inverter",
    "refrigerator",
    "fridge",
    "compressor",
    "private appliance",
    "tv remote",
    "mobile charger",
]


def utc_now():
    return datetime.utcnow()


def normalize_category(value):
    if not value:
        return "manual_review"
    normalized = str(value).strip().lower().replace("&", "and")
    normalized = normalized.replace("/", " ").replace("-", " ")
    if "not applicable" in normalized or "non government" in normalized:
        return "not_applicable"
    if "electric" in normalized or "bijli" in normalized:
        return "electricity"
    if "water" in normalized or "paani" in normalized:
        return "water_supply"
    if "drainage" in normalized or "drain" in normalized or "sewer" in normalized or "manhole" in normalized:
        return "drainage_sewer"
    if "flood" in normalized or "storm" in normalized or "disaster" in normalized:
        return "disaster_management"
    if "sanitation" in normalized or "waste" in normalized or "sewer" in normalized:
        return "garbage_cleaning"
    if "garbage" in normalized or "clean" in normalized or "dirty area" in normalized:
        return "garbage_cleaning"
    if "pothole" in normalized or "footpath" in normalized or "broken road" in normalized or "public works" in normalized:
        return "roads"
    if "traffic" in normalized or "parking" in normalized or "signal" in normalized or "jam" in normalized:
        return "traffic_safety"
    if "road" in normalized:
        return "roads"
    if "health" in normalized or "hospital" in normalized or "hygiene" in normalized:
        return "health_hospital"
    if "fire" in normalized or "rescue" in normalized:
        return "fire_emergency"
    if "animal" in normalized or "dog" in normalized:
        return "animal_control"
    if "police" in normalized or "public safety" in normalized or "crime" in normalized or "theft" in normalized or "harassment" in normalized:
        return "police_safety"
    if "street lighting" in normalized or "street light" in normalized:
        return "streetlight"
    if "women" in normalized or "girl" in normalized or "child safety" in normalized:
        return "women_safety"
    if "pollution" in normalized or "smoke" in normalized:
        return "pollution_control"
    if "housing" in normalized or "encroachment" in normalized or "illegal construction" in normalized or "property" in normalized:
        return "urban_housing_encroachment"
    if "unsafe building" in normalized or "building safety" in normalized or "collapse" in normalized:
        return "urban_housing_encroachment"
    if "park" in normalized or "garden" in normalized or "tree" in normalized:
        return "park_garden"
    if "cyber" in normalized or "digital" in normalized or "online fraud" in normalized or "hacking" in normalized:
        return "cyber_crime"
    if "transport" in normalized or "bus" in normalized or "metro" in normalized or "auto" in normalized:
        return "public_transport"
    if "aadhaar" in normalized or "ration" in normalized or "certificate" in normalized or "document" in normalized:
        return "manual_review"
    if "pension" in normalized or "welfare" in normalized or "scheme" in normalized:
        return "manual_review"
    if "food" in normalized or "unsafe food" in normalized:
        return "manual_review"
    return normalized if normalized in CATEGORY_LABELS else "manual_review"


def display_department(value):
    category = normalize_category(value)
    return CATEGORY_LABELS.get(category, value or "Manual Review")


def ensure_default_departments():
    active_keys = {category_key for _, category_key, _ in DEFAULT_DEPARTMENTS}
    for name, category_key, eta in DEFAULT_DEPARTMENTS:
        department = Department.objects(category_key=category_key).first() or Department.objects(name=name).first()
        if department:
            department.name = name
            department.category_key = category_key
            department.default_eta_hours = eta
            department.is_active = True
            department.save()
        else:
            Department(
                name=name,
                category_key=category_key,
                default_eta_hours=eta,
                is_active=True,
            ).save()
    Department.objects(category_key__nin=list(active_keys)).update(set__is_active=False)


def serialize_id(value):
    return str(value.id) if value else None


def serialize_datetime(value):
    return value.isoformat() if value else None


def user_to_dict(user):
    return {
        "id": str(user.id),
        "mobile_number": user.mobile_number,
        "role": user.role,
        "name": user.name,
        "email": user.email,
        "is_verified": user.is_verified,
        "total_complaints": user.total_complaints,
        "false_complaint_count": user.false_complaint_count,
        "warnings": user.warnings,
        "is_restricted": user.is_restricted,
        "is_blocked": user.is_blocked,
        "blocked_reason": user.blocked_reason,
        "created_at": serialize_datetime(user.created_at),
    }


def department_to_dict(department):
    if not department:
        return None
    return {
        "id": str(department.id),
        "name": department.name,
        "category_key": department.category_key,
        "description": department.description,
        "default_eta_hours": department.default_eta_hours,
        "is_active": department.is_active,
    }


def officer_to_dict(officer):
    if not officer:
        return None
    return {
        "id": str(officer.id),
        "name": officer.name,
        "mobile_number": officer.mobile_number,
        "email": officer.email,
        "department": department_to_dict(officer.department),
        "zones": officer.zones,
        "senior_officer_id": officer.senior_officer_id,
        "is_active": officer.is_active,
    }


def notification_to_dict(notification):
    return {
        "id": str(notification.id),
        "title": notification.title,
        "message": notification.message,
        "channel": notification.channel,
        "status": notification.status,
        "is_read": notification.is_read,
        "complaint_id": notification.complaint.tracking_id if notification.complaint else None,
        "created_at": serialize_datetime(notification.created_at),
    }


def complaint_to_dict(complaint):
    citizen_proof_count = len(
        [item for item in complaint.attachments if item.get("purpose") == "citizen_proof"]
    )
    false_evidence_count = len(
        [item for item in complaint.attachments if item.get("purpose") == "false_validation_evidence"]
    )
    return {
        "id": str(complaint.id),
        "tracking_id": complaint.tracking_id,
        "citizen": user_to_dict(complaint.citizen) if complaint.citizen else None,
        "raw_text": complaint.raw_text,
        "redacted_text": complaint.redacted_text,
        "language": complaint.language,
        "summary": complaint.summary,
        "sentiment": complaint.sentiment,
        "is_valid_grievance": complaint.is_valid_grievance,
        "validity_confidence": complaint.validity_confidence,
        "ai_departments": complaint.ai_departments,
        "primary_department_label": complaint.primary_department_label,
        "secondary_department_labels": complaint.secondary_department_labels,
        "ai_rejection_reason": complaint.ai_rejection_reason,
        "translation_source": complaint.translation_source,
        "category": complaint.category,
        "category_label": CATEGORY_LABELS.get(complaint.category, complaint.category),
        "confidence_score": complaint.confidence_score,
        "classification_source": complaint.classification_source,
        "manual_review_required": complaint.manual_review_required,
        "priority": complaint.priority,
        "location": complaint.location,
        "latitude": complaint.latitude,
        "longitude": complaint.longitude,
        "address": complaint.address,
        "landmark": complaint.landmark,
        "ward": complaint.ward,
        "zone": complaint.zone,
        "assigned_department": department_to_dict(complaint.assigned_department),
        "assigned_officer": officer_to_dict(complaint.assigned_officer),
        "assignment_note": complaint.assignment_note,
        "active_work": complaint.active_work,
        "active_work_message": complaint.active_work_message,
        "status": complaint.status,
        "estimated_resolution_hours": complaint.estimated_resolution_hours,
        "estimated_resolution_at": serialize_datetime(complaint.estimated_resolution_at),
        "sla_deadline": serialize_datetime(complaint.sla_deadline),
        "admin_response": complaint.admin_response,
        "eta_approved": complaint.eta_approved,
        "eta_approved_by": complaint.eta_approved_by,
        "eta_approved_at": serialize_datetime(complaint.eta_approved_at),
        "resolution_note": complaint.resolution_note,
        "reminder_count": complaint.reminder_count,
        "last_reminder_at": serialize_datetime(complaint.last_reminder_at),
        "is_escalated": complaint.is_escalated,
        "escalated_to": complaint.escalated_to,
        "escalated_at": serialize_datetime(complaint.escalated_at),
        "is_false": complaint.is_false,
        "false_reason": complaint.false_reason,
        "attachments": complaint.attachments,
        "has_citizen_proof": citizen_proof_count > 0,
        "citizen_proof_count": citizen_proof_count,
        "false_validation_evidence_count": false_evidence_count,
        "timeline": complaint.timeline,
        "created_at": serialize_datetime(complaint.created_at),
        "updated_at": serialize_datetime(complaint.updated_at),
    }


def active_work_to_dict(work):
    return {
        "id": str(work.id),
        "work_id": work.work_id,
        "department": department_to_dict(work.department),
        "category": work.category,
        "work_type": work.work_type,
        "title": work.title,
        "public_message": work.public_message,
        "latitude": work.latitude,
        "longitude": work.longitude,
        "radius_km": work.radius_km,
        "address": work.address,
        "ward": work.ward,
        "zone": work.zone,
        "start_time": serialize_datetime(work.start_time),
        "expected_end_time": serialize_datetime(work.expected_end_time),
        "status": work.status,
        "linked_complaint_count": work.linked_complaint_count,
        "created_at": serialize_datetime(work.created_at),
        "updated_at": serialize_datetime(work.updated_at),
    }


def generate_tracking_id():
    return f"SGR-{utc_now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"


def generate_work_id():
    return f"WORK-{utc_now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"


def generate_otp():
    return f"{random.randint(100000, 999999)}"


def create_otp_for_mobile(mobile_number):
    otp = generate_otp()
    user = User.objects(mobile_number=mobile_number).modify(
        upsert=True,
        new=True,
        set__mobile_number=mobile_number,
        set__otp_code=otp,
        set__otp_expires_at=utc_now() + timedelta(minutes=settings.OTP_EXPIRY_MINUTES),
    )
    return user, otp


def verify_mobile_otp(mobile_number, otp):
    user = User.objects(mobile_number=mobile_number).first()
    if not user:
        return None, "User not found. Generate OTP first."
    if user.is_blocked:
        return None, "This user is blocked from submitting complaints."
    if not user.otp_code or user.otp_code != otp:
        return None, "Invalid OTP."
    if user.otp_expires_at and user.otp_expires_at < utc_now():
        return None, "OTP has expired."

    user.is_verified = True
    user.auth_token = uuid.uuid4().hex
    user.last_login_at = utc_now()
    user.otp_code = ""
    user.otp_expires_at = None
    user.save()
    return user, ""


def get_user_from_token(request):
    auth_header = request.headers.get("Authorization", "")
    token = ""
    if auth_header.lower().startswith("bearer "):
        token = auth_header.split(" ", 1)[1].strip()
    token = token or request.headers.get("X-Auth-Token", "").strip()
    if not token:
        return None
    return User.objects(auth_token=token).first()


def require_user(request):
    user = get_user_from_token(request)
    if not user:
        return None, {"error": "Authentication required. Send Bearer token."}, 401
    if user.is_blocked:
        return None, {"error": "User is blocked."}, 403
    return user, None, None


def call_ai_engine(text):
    try:
        print(f"[AI] Sending complaint to AI engine: {text[:80]}", flush=True)
        response = requests.post(
            f"{settings.AI_ENGINE_URL.rstrip('/')}/predict",
            json={"text": text},
            timeout=180,
        )
        response.raise_for_status()
        print("[AI] AI engine response received.", flush=True)
        data = response.json()
        prediction = data.get("prediction", data)
        departments = prediction.get("departments") or [prediction.get("department")]
        departments = [department for department in departments if department]
        category = normalize_category(prediction.get("primary_department") or prediction.get("department"))
        display_departments = [display_department(department) for department in departments]
        return {
            "category": category,
            "confidence_score": float(prediction.get("confidence", 0.0)),
            "priority": prediction.get("priority") or detect_priority(text),
            "sentiment": prediction.get("sentiment", "Neutral"),
            "summary": prediction.get("summary", ""),
            "redacted_text": data.get("redacted_complaint") or data.get("redacted_text") or "",
            "language": prediction.get("language", "Auto detected"),
            "translated_text": prediction.get("translated_text", ""),
            "translation_source": prediction.get("translation_source", ""),
            "is_valid_grievance": bool(prediction.get("is_valid_grievance", True)),
            "validity_confidence": float(prediction.get("validity_confidence", 0.0)),
            "ai_departments": display_departments,
            "primary_department_label": display_department(prediction.get("primary_department") or prediction.get("department")),
            "secondary_department_labels": [display_department(department) for department in prediction.get("secondary_departments", [])],
            "ai_rejection_reason": prediction.get("message", ""),
            "classification_source": "ai_engine",
        }
    except requests.RequestException as exc:
        print(f"[AI] AI engine unavailable or timed out, using backend fallback: {exc}", flush=True)
        return classify_with_backend_fallback(text)


def transcribe_audio_file(uploaded_file):
    if not settings.VOICE_TRANSCRIPTION_ENABLED:
        raise ValueError("Voice transcription is disabled.")
    try:
        response = requests.post(
            f"{settings.AI_ENGINE_URL.rstrip('/')}/transcribe",
            files={
                "audio": (
                    uploaded_file.name or "voice.webm",
                    uploaded_file.file,
                    getattr(uploaded_file, "content_type", "application/octet-stream"),
                )
            },
            timeout=180,
        )
        response.raise_for_status()
        return response.json()
    except requests.RequestException as exc:
        raise ValueError(f"Voice transcription failed: {exc}") from exc


def classify_with_backend_fallback(text):
    lower_text = text.lower()
    if any(term in lower_text for term in PRIVATE_ISSUE_TEXT_TERMS):
        return {
            "category": "not_applicable",
            "confidence_score": 0.0,
            "priority": "Low",
            "sentiment": detect_sentiment(text),
            "summary": generate_basic_summary(text, "not_applicable"),
            "redacted_text": "",
            "language": "Backend fallback",
            "translated_text": "",
            "translation_source": "backend_fallback_rule",
            "is_valid_grievance": False,
            "validity_confidence": 0.95,
            "ai_departments": ["Not Applicable"],
            "primary_department_label": "Not Applicable",
            "secondary_department_labels": [],
            "ai_rejection_reason": "This appears to be a private household or personal service issue, not a government grievance.",
            "classification_source": "backend_fallback",
        }
    if any(term in lower_text for term in MANUAL_REVIEW_TEXT_TERMS):
        return {
            "category": "manual_review",
            "confidence_score": 0.88,
            "priority": detect_priority(text),
            "sentiment": detect_sentiment(text),
            "summary": generate_basic_summary(text, "manual_review"),
            "redacted_text": "",
            "language": "Backend fallback",
            "translated_text": "",
            "translation_source": "backend_fallback_rule",
            "is_valid_grievance": True,
            "validity_confidence": 0.88,
            "ai_departments": ["Manual Review"],
            "primary_department_label": "Manual Review",
            "secondary_department_labels": [],
            "ai_rejection_reason": "This complaint needs manual review because its exact department is outside the trained department set.",
            "classification_source": "backend_fallback",
        }
    scores = {
        category: sum(1 for word in words if word in lower_text)
        for category, words in KEYWORD_CATEGORIES.items()
    }
    category, score = max(scores.items(), key=lambda item: item[1])
    if score == 0:
        category = "manual_review"
    confidence = min(0.9, 0.45 + (score * 0.15)) if score else 0.35
    return {
        "category": category,
        "confidence_score": round(confidence, 4),
        "priority": detect_priority(text),
        "sentiment": detect_sentiment(text),
        "summary": generate_basic_summary(text, category),
        "redacted_text": "",
        "language": "Backend fallback",
        "translated_text": "",
        "translation_source": "backend_fallback",
        "is_valid_grievance": True,
        "validity_confidence": 0.0,
        "ai_departments": [CATEGORY_LABELS.get(category, category)],
        "primary_department_label": CATEGORY_LABELS.get(category, category),
        "secondary_department_labels": [],
        "ai_rejection_reason": "",
        "classification_source": "backend_fallback",
    }


def detect_priority(text):
    lower_text = text.lower()
    if any(word in lower_text for word in CRITICAL_WORDS):
        return "Critical"
    if any(word in lower_text for word in HIGH_WORDS):
        return "High"
    if len(text) > 180:
        return "Medium"
    return "Low"


def detect_sentiment(text):
    lower_text = text.lower()
    if "help" in lower_text or "emergency" in lower_text or "danger" in lower_text:
        return "Panic"
    if "angry" in lower_text or "worst" in lower_text or "no action" in lower_text:
        return "Angry"
    if "please" in lower_text or "kindly" in lower_text:
        return "Pleading"
    return "Neutral"


def generate_basic_summary(text, category):
    label = CATEGORY_LABELS.get(category, "civic")
    clean = " ".join(text.split())
    if len(clean) > 120:
        clean = f"{clean[:117]}..."
    return f"{label} issue reported: {clean}"


def estimate_resolution_hours(category, priority):
    return ETA_RULES.get(priority, ETA_RULES["Medium"]).get(category, 48)


def haversine_km(lat1, lon1, lat2, lon2):
    radius = 6371
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(d_lon / 2) ** 2
    )
    return 2 * radius * math.asin(math.sqrt(a))


def find_matching_active_work(category, latitude, longitude, ward="", zone=""):
    if latitude is None or longitude is None:
        return None
    active_works = ActiveWork.objects(category=category, status="active")
    now = utc_now()
    for work in active_works:
        if work.expected_end_time and work.expected_end_time < now:
            continue
        same_area = (ward and work.ward and ward.lower() == work.ward.lower()) or (
            zone and work.zone and zone.lower() == work.zone.lower()
        )
        distance = haversine_km(latitude, longitude, work.latitude, work.longitude)
        if same_area or distance <= work.radius_km:
            return work
    return None


def select_department(category):
    ensure_default_departments()
    return Department.objects(category_key=category, is_active=True).first() or Department.objects(
        category_key="manual_review"
    ).first()


def select_officer(department, ward="", zone=""):
    if not department:
        return None
    query = Officer.objects(department=department, is_active=True)
    if ward:
        officer = query.filter(zones__iexact=ward).first()
        if officer:
            return officer
    if zone:
        officer = query.filter(zones__iexact=zone).first()
        if officer:
            return officer
    return query.first()


def add_timeline(complaint, event, message, actor=None):
    complaint.timeline.append(
        {
            "event": event,
            "message": message,
            "actor": actor or "system",
            "timestamp": serialize_datetime(utc_now()),
        }
    )


def create_notification(user, complaint, title, message, status="created"):
    return Notification(
        recipient=user,
        complaint=complaint,
        title=title,
        message=message,
        status=status,
    ).save()


ALLOWED_ATTACHMENT_TYPES = (
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "video/mp4",
    "video/webm",
    "video/quicktime",
)


def save_uploaded_files(files, purpose, uploaded_by=None):
    saved = []
    media_root = Path(settings.MEDIA_ROOT)
    target_dir = media_root / "complaint_attachments" / purpose
    target_dir.mkdir(parents=True, exist_ok=True)
    for uploaded_file in files:
        content_type = getattr(uploaded_file, "content_type", "") or "application/octet-stream"
        if content_type not in ALLOWED_ATTACHMENT_TYPES:
            raise ValueError("Only image or video evidence files are allowed.")
        original_name = os.path.basename(uploaded_file.name or "attachment")
        suffix = Path(original_name).suffix.lower() or ".bin"
        filename = f"{uuid.uuid4().hex}{suffix}"
        file_path = target_dir / filename
        with file_path.open("wb") as destination:
            for chunk in uploaded_file.chunks():
                destination.write(chunk)
        relative_path = f"complaint_attachments/{purpose}/{filename}"
        saved.append(
            {
                "name": original_name,
                "url": f"{settings.MEDIA_URL}{relative_path}".replace("\\", "/"),
                "path": relative_path.replace("\\", "/"),
                "content_type": content_type,
                "size": getattr(uploaded_file, "size", 0),
                "purpose": purpose,
                "uploaded_by": uploaded_by.mobile_number if uploaded_by else "system",
                "uploaded_at": serialize_datetime(utc_now()),
            }
        )
    return saved


def process_complaint_ai(complaint_id):
    complaint = Complaint.objects(id=complaint_id).first()
    if not complaint:
        return None

    prediction = call_ai_engine(complaint.raw_text)
    category = prediction["category"]
    confidence = prediction["confidence_score"]
    is_valid_grievance = prediction.get("is_valid_grievance", True)
    rejected = not is_valid_grievance or category == "not_applicable"
    manual_review = (
        not rejected
        and (confidence < settings.CLASSIFICATION_CONFIDENCE_THRESHOLD or category == "manual_review")
    )
    department = None if rejected else select_department(category)
    officer = None if manual_review or rejected else select_officer(
        department,
        ward=complaint.ward,
        zone=complaint.zone,
    )
    priority = prediction["priority"]
    eta_hours = 0
    expected_at = None
    active_work = find_matching_active_work(
        category,
        complaint.latitude,
        complaint.longitude,
        ward=complaint.ward,
        zone=complaint.zone,
    )

    status = "rejected" if rejected else "manual_review" if manual_review else "assigned"
    active_work_message = ""
    eta_approved = False
    admin_response = ""
    if active_work:
        status = "auto_responded"
        active_work_message = active_work.public_message
        admin_response = active_work.public_message
        eta_approved = True
        if active_work.expected_end_time:
            expected_at = active_work.expected_end_time
            eta_hours = max(1, math.ceil((expected_at - utc_now()).total_seconds() / 3600))
        active_work.linked_complaint_count += 1
        active_work.save()

    complaint.redacted_text = prediction.get("redacted_text", "")
    complaint.processed_text = complaint.raw_text.lower()
    complaint.language = prediction.get("language") or complaint.language or "Auto detected"
    complaint.summary = prediction.get("summary", "")
    complaint.translated_text = prediction.get("translated_text", "")
    complaint.sentiment = prediction.get("sentiment", "Neutral")
    complaint.is_valid_grievance = is_valid_grievance
    complaint.validity_confidence = prediction.get("validity_confidence", 0.0)
    complaint.ai_departments = prediction.get("ai_departments", [])
    complaint.primary_department_label = prediction.get("primary_department_label", "")
    complaint.secondary_department_labels = prediction.get("secondary_department_labels", [])
    complaint.ai_rejection_reason = prediction.get("ai_rejection_reason", "")
    complaint.translation_source = prediction.get("translation_source", "")
    complaint.category = category
    complaint.confidence_score = confidence
    complaint.classification_source = prediction["classification_source"]
    complaint.manual_review_required = manual_review
    complaint.priority = priority
    complaint.assigned_department = department
    complaint.assigned_officer = officer
    complaint.active_work = str(active_work.id) if active_work else ""
    complaint.active_work_message = active_work_message
    complaint.status = status
    complaint.estimated_resolution_hours = eta_hours
    complaint.estimated_resolution_at = expected_at
    complaint.sla_deadline = expected_at
    complaint.admin_response = admin_response
    complaint.eta_approved = eta_approved
    complaint.eta_approved_by = "active_work" if active_work else ""
    complaint.eta_approved_at = utc_now() if active_work else None

    add_timeline(
        complaint,
        "ai_classified",
        f"Classified as {CATEGORY_LABELS.get(category, category)} with confidence {confidence}.",
    )
    if rejected:
        add_timeline(
            complaint,
            "ai_rejected",
            prediction.get("ai_rejection_reason") or "AI identified this as not a valid government grievance.",
        )
    elif active_work:
        add_timeline(complaint, "auto_response", "Matched with active government work.")
    elif manual_review:
        add_timeline(complaint, "manual_review", "Sent to manual review due to low confidence.")
    else:
        add_timeline(complaint, "assigned", "Complaint assigned to department/officer.")
    complaint.save()

    if rejected:
        create_notification(
            complaint.citizen,
            complaint,
            "Complaint not routed",
            (
                prediction.get("ai_rejection_reason")
                or "This complaint appears to be private, fake, spam, or outside government scope."
            ),
            status="rejected",
        )
    elif active_work:
        create_notification(
            complaint.citizen,
            complaint,
            "Known work already active",
            active_work.public_message,
            status="auto_responded",
        )
    else:
        create_notification(
            complaint.citizen,
            complaint,
            "Complaint processed",
            (
                f"Your complaint {complaint.tracking_id} has been processed. "
                "The department will send a response and approved ETA soon."
            ),
        )

    return complaint


def enqueue_complaint_processing(complaint):
    if not settings.ASYNC_COMPLAINT_PROCESSING:
        return process_complaint_ai(str(complaint.id))
    try:
        from .tasks import process_complaint_ai_task

        process_complaint_ai_task.delay(str(complaint.id))
        add_timeline(complaint, "queued", "Complaint sent to AI processing queue.")
        complaint.save()
        return complaint
    except Exception as exc:
        add_timeline(
            complaint,
            "queue_fallback",
            f"Queue unavailable, processing complaint immediately: {exc}",
        )
        complaint.save()
        return process_complaint_ai(str(complaint.id))


def create_complaint(citizen, payload, uploaded_files=None):
    if citizen.is_blocked:
        raise ValueError("Blocked users cannot submit complaints.")

    text = (payload.get("text") or payload.get("raw_text") or "").strip()
    if not text:
        raise ValueError("Complaint text is required.")

    location = payload.get("location") or {}
    latitude = payload.get("latitude", location.get("latitude"))
    longitude = payload.get("longitude", location.get("longitude"))
    latitude = float(latitude) if latitude not in (None, "") else None
    longitude = float(longitude) if longitude not in (None, "") else None
    ward = payload.get("ward") or location.get("ward", "")
    zone = payload.get("zone") or location.get("zone", "")
    address = payload.get("address") or location.get("address", "")
    landmark = payload.get("landmark") or location.get("landmark", "")

    citizen_attachments = save_uploaded_files(
        uploaded_files or [],
        purpose="citizen_proof",
        uploaded_by=citizen,
    )
    existing_attachments = payload.get("attachments", [])
    if not isinstance(existing_attachments, list):
        existing_attachments = []

    complaint = Complaint(
        tracking_id=generate_tracking_id(),
        citizen=citizen,
        raw_text=text,
        processed_text=text.lower(),
        language=payload.get("language", "Auto detected"),
        summary="AI processing is in progress.",
        category="manual_review",
        confidence_score=0.0,
        classification_source="queued",
        manual_review_required=False,
        priority="Medium",
        location=location,
        latitude=latitude,
        longitude=longitude,
        address=address,
        landmark=landmark,
        ward=ward,
        zone=zone,
        status="processing",
        attachments=existing_attachments + citizen_attachments,
    )
    add_timeline(complaint, "submitted", "Complaint submitted by citizen.")
    add_timeline(complaint, "processing", "Waiting for AI classification and routing.")
    complaint.save()

    citizen.total_complaints += 1
    citizen.save()

    create_notification(
        citizen,
        complaint,
        "Complaint received",
        f"Your complaint {complaint.tracking_id} has been received and is being processed.",
        status="processing",
    )

    enqueue_complaint_processing(complaint)
    return complaint


def send_admin_response(complaint, user, message, eta_hours=None, status=""):
    clean_message = (message or "").strip()
    if not clean_message:
        raise ValueError("response_message is required.")

    complaint.admin_response = clean_message
    if eta_hours not in (None, ""):
        eta_value = int(eta_hours)
        if eta_value <= 0:
            raise ValueError("estimated_resolution_hours must be greater than zero.")
        expected_at = utc_now() + timedelta(hours=eta_value)
        complaint.estimated_resolution_hours = eta_value
        complaint.estimated_resolution_at = expected_at
        complaint.sla_deadline = expected_at
        complaint.eta_approved = True
        complaint.eta_approved_by = user.mobile_number if user else "admin"
        complaint.eta_approved_at = utc_now()

    if status:
        complaint.status = status
        if status in ["resolved", "closed"]:
            complaint.resolution_note = clean_message

    add_timeline(
        complaint,
        "admin_response",
        clean_message,
        actor=user.mobile_number if user else "admin",
    )
    complaint.save()

    eta_text = (
        f" Approved ETA: {complaint.estimated_resolution_hours} hours."
        if complaint.eta_approved and complaint.estimated_resolution_hours
        else ""
    )
    create_notification(
        complaint.citizen,
        complaint,
        "Department response received",
        f"{clean_message}{eta_text}",
        status="admin_response",
    )
    return complaint


def update_complaint_status(complaint, status, note="", actor=None):
    complaint.status = status
    add_timeline(complaint, status, note or f"Status changed to {status}.", actor=actor)
    complaint.save()
    create_notification(
        complaint.citizen,
        complaint,
        "Complaint status updated",
        note or f"Your complaint status is now {status}.",
    )
    return complaint


def assign_complaint(complaint, department_id=None, officer_id=None, note="", actor=None):
    if department_id:
        complaint.assigned_department = Department.objects(id=department_id).first()
    if officer_id:
        complaint.assigned_officer = Officer.objects(id=officer_id).first()
    complaint.status = "assigned"
    complaint.manual_review_required = False
    complaint.assignment_note = note
    add_timeline(complaint, "assigned", note or "Complaint assigned.", actor=actor)
    complaint.save()
    create_notification(
        complaint.citizen,
        complaint,
        "Complaint assigned",
        f"Your complaint has been assigned to {complaint.assigned_department.name if complaint.assigned_department else 'the department'}.",
    )
    return complaint


def send_reminder(complaint, actor=None):
    complaint.reminder_count += 1
    complaint.last_reminder_at = utc_now()
    add_timeline(complaint, "reminder_sent", "Reminder sent to assigned officer.", actor=actor)
    complaint.save()
    return create_notification(
        complaint.citizen,
        complaint,
        "Reminder sent",
        "A reminder has been sent to the assigned officer for your complaint.",
    )


def escalate_complaint(complaint, escalated_to="", actor=None):
    complaint.is_escalated = True
    complaint.escalated_to = escalated_to or (
        complaint.assigned_officer.senior_officer_id if complaint.assigned_officer else "higher_authority"
    )
    complaint.escalated_at = utc_now()
    complaint.status = "escalated"
    add_timeline(
        complaint,
        "escalated",
        f"Complaint escalated to {complaint.escalated_to}.",
        actor=actor,
    )
    complaint.save()
    create_notification(
        complaint.citizen,
        complaint,
        "Complaint escalated",
        "Your complaint was not resolved in time and has been escalated to a higher authority.",
        status="escalated",
    )
    return complaint


def mark_false_complaint(complaint, user, note, evidence_files=None):
    evidence = save_uploaded_files(
        evidence_files or [],
        purpose="false_validation_evidence",
        uploaded_by=user,
    )
    if not evidence:
        raise ValueError("Photo or video evidence is required before marking a complaint false.")
    complaint.is_false = True
    complaint.false_reason = note
    complaint.attachments.extend(evidence)
    add_timeline(complaint, "marked_false", note, actor=user.mobile_number if user else "admin")
    complaint.save()

    citizen = complaint.citizen
    citizen.false_complaint_count += 1
    if citizen.false_complaint_count >= settings.FALSE_COMPLAINT_BLOCK_THRESHOLD:
        citizen.is_blocked = True
        citizen.blocked_reason = "Repeated verified false complaints."
    citizen.save()

    Feedback(
        complaint=complaint,
        user=user,
        type="false_complaint",
        comment=note,
        is_false_complaint=True,
        verification_note=note,
    ).save()
    return complaint


def create_audit(actor, action, target_type="", target_id="", metadata=None):
    AuditLog(
        actor=actor,
        action=action,
        target_type=target_type,
        target_id=target_id,
        metadata=metadata or {},
    ).save()


def geoapify_reverse(lat, lon):
    if not settings.GEOAPIFY_API_KEY or settings.GEOAPIFY_API_KEY == "your_geoapify_api_key_here":
        raise ValueError("Geoapify API key is not configured.")
    response = requests.get(
        "https://api.geoapify.com/v1/geocode/reverse",
        params={"lat": lat, "lon": lon, "apiKey": settings.GEOAPIFY_API_KEY},
        timeout=10,
    )
    response.raise_for_status()
    return response.json()


def geoapify_search(query):
    if not settings.GEOAPIFY_API_KEY or settings.GEOAPIFY_API_KEY == "your_geoapify_api_key_here":
        raise ValueError("Geoapify API key is not configured.")
    response = requests.get(
        "https://api.geoapify.com/v1/geocode/search",
        params={"text": query, "apiKey": settings.GEOAPIFY_API_KEY, "limit": 5},
        timeout=10,
    )
    response.raise_for_status()
    return response.json()
