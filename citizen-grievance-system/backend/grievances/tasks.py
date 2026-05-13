from celery import shared_task

from .services import process_complaint_ai


@shared_task(name="grievances.process_complaint_ai")
def process_complaint_ai_task(complaint_id):
    complaint = process_complaint_ai(complaint_id)
    return str(complaint.id) if complaint else None
