from datetime import datetime

from mongoengine import (
    BooleanField,
    DateTimeField,
    DictField,
    Document,
    EmailField,
    FloatField,
    IntField,
    ListField,
    ReferenceField,
    StringField,
)


def now_utc():
    return datetime.utcnow()


class TimestampedDocument(Document):
    meta = {"abstract": True}

    created_at = DateTimeField(default=now_utc)
    updated_at = DateTimeField(default=now_utc)

    def save(self, *args, **kwargs):
        self.updated_at = now_utc()
        return super().save(*args, **kwargs)


class User(TimestampedDocument):
    meta = {
        "collection": "users",
        "indexes": [
            {"fields": ["mobile_number"], "unique": True},
            "auth_token",
            "is_blocked",
        ],
    }

    mobile_number = StringField(required=True)
    role = StringField(
        choices=("citizen", "officer", "admin", "super_admin"),
        default="citizen",
    )
    name = StringField(default="")
    email = EmailField()
    is_verified = BooleanField(default=False)
    otp_code = StringField()
    otp_expires_at = DateTimeField()
    auth_token = StringField()
    total_complaints = IntField(default=0)
    false_complaint_count = IntField(default=0)
    warnings = IntField(default=0)
    is_restricted = BooleanField(default=False)
    is_blocked = BooleanField(default=False)
    blocked_reason = StringField(default="")
    last_login_at = DateTimeField()


class Department(TimestampedDocument):
    meta = {
        "collection": "departments",
        "indexes": [
            {"fields": ["name"], "unique": True},
            "category_key",
        ],
    }

    name = StringField(required=True)
    category_key = StringField(required=True)
    description = StringField(default="")
    default_eta_hours = IntField(default=24)
    is_active = BooleanField(default=True)


class Officer(TimestampedDocument):
    meta = {
        "collection": "officers",
        "indexes": ["mobile_number", "department", "zones"],
    }

    name = StringField(required=True)
    mobile_number = StringField(required=True)
    email = EmailField()
    department = ReferenceField(Department)
    zones = ListField(StringField())
    latitude = FloatField()
    longitude = FloatField()
    last_location_at = DateTimeField()
    senior_officer_id = StringField(default="")
    is_active = BooleanField(default=True)


class Complaint(TimestampedDocument):
    meta = {
        "collection": "complaints",
        "indexes": [
            "tracking_id",
            "citizen",
            "status",
            "category",
            "priority",
            "assigned_department",
            "assigned_officer",
            "sla_deadline",
            "is_escalated",
        ],
    }

    tracking_id = StringField(required=True, unique=True)
    citizen = ReferenceField(User, required=True)
    raw_text = StringField(required=True)
    redacted_text = StringField(default="")
    processed_text = StringField(default="")
    language = StringField(default="English")
    translated_text = StringField(default="")
    summary = StringField(default="")
    sentiment = StringField(default="Neutral")
    is_valid_grievance = BooleanField(default=True)
    validity_confidence = FloatField(default=0.0)
    ai_departments = ListField(StringField())
    primary_department_label = StringField(default="")
    secondary_department_labels = ListField(StringField())
    ai_rejection_reason = StringField(default="")
    translation_source = StringField(default="")
    category = StringField(default="manual_review")
    confidence_score = FloatField(default=0.0)
    classification_source = StringField(default="backend_fallback")
    manual_review_required = BooleanField(default=False)
    priority = StringField(default="Medium")
    complaint_for = StringField(default="self")
    affected_person_name = StringField(default="")
    affected_person_mobile = StringField(default="")
    affected_person_relationship = StringField(default="")
    location = DictField(default=dict)
    latitude = FloatField()
    longitude = FloatField()
    address = StringField(default="")
    landmark = StringField(default="")
    ward = StringField(default="")
    zone = StringField(default="")
    assigned_department = ReferenceField(Department)
    assigned_officer = ReferenceField(Officer)
    assignment_note = StringField(default="")
    active_work = StringField(default="")
    active_work_message = StringField(default="")
    status = StringField(default="submitted")
    estimated_resolution_hours = IntField(default=0)
    estimated_resolution_at = DateTimeField()
    sla_deadline = DateTimeField()
    admin_response = StringField(default="")
    eta_approved = BooleanField(default=False)
    eta_approved_by = StringField(default="")
    eta_approved_at = DateTimeField()
    resolution_note = StringField(default="")
    reminder_count = IntField(default=0)
    last_reminder_at = DateTimeField()
    is_escalated = BooleanField(default=False)
    escalated_to = StringField(default="")
    escalated_at = DateTimeField()
    is_false = BooleanField(default=False)
    false_reason = StringField(default="")
    attachments = ListField(DictField())
    timeline = ListField(DictField())


class ActiveWork(TimestampedDocument):
    meta = {
        "collection": "active_work",
        "indexes": ["department", "status", "ward", "zone", "expected_end_time"],
    }

    work_id = StringField(required=True, unique=True)
    department = ReferenceField(Department)
    category = StringField(required=True)
    work_type = StringField(required=True)
    title = StringField(required=True)
    public_message = StringField(required=True)
    latitude = FloatField(required=True)
    longitude = FloatField(required=True)
    radius_km = FloatField(default=1.5)
    address = StringField(default="")
    ward = StringField(default="")
    zone = StringField(default="")
    start_time = DateTimeField(required=True)
    expected_end_time = DateTimeField(required=True)
    status = StringField(
        choices=("active", "paused", "completed"),
        default="active",
    )
    linked_complaint_count = IntField(default=0)


class Notification(TimestampedDocument):
    meta = {"collection": "notifications", "indexes": ["recipient", "complaint", "is_read"]}

    recipient = ReferenceField(User)
    complaint = ReferenceField(Complaint)
    title = StringField(required=True)
    message = StringField(required=True)
    channel = StringField(default="in_app")
    status = StringField(default="created")
    is_read = BooleanField(default=False)


class Feedback(TimestampedDocument):
    meta = {"collection": "feedback", "indexes": ["complaint", "user", "type"]}

    complaint = ReferenceField(Complaint)
    user = ReferenceField(User)
    type = StringField(required=True)
    comment = StringField(default="")
    corrected_category = StringField(default="")
    corrected_priority = StringField(default="")
    is_false_complaint = BooleanField(default=False)
    verification_note = StringField(default="")


class AuditLog(TimestampedDocument):
    meta = {"collection": "audit_logs", "indexes": ["actor", "action", "target_id"]}

    actor = ReferenceField(User)
    action = StringField(required=True)
    target_type = StringField(default="")
    target_id = StringField(default="")
    metadata = DictField(default=dict)
