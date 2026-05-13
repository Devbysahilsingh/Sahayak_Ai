from django.urls import path

from . import views


urlpatterns = [
    path("health/", views.HealthView.as_view(), name="health"),
    path("auth/send-otp/", views.SendOtpView.as_view(), name="send-otp"),
    path("auth/verify-otp/", views.VerifyOtpView.as_view(), name="verify-otp"),
    path("auth/worker-signup/", views.WorkerSignupView.as_view(), name="worker-signup"),
    path("auth/me/", views.MeView.as_view(), name="me"),
    path("voice/transcribe/", views.VoiceTranscriptionView.as_view(), name="voice-transcribe"),
    path("complaints/", views.ComplaintListCreateView.as_view(), name="complaints"),
    path(
        "complaints/process-overdue/",
        views.ProcessOverdueComplaintsView.as_view(),
        name="process-overdue-complaints",
    ),
    path("complaints/<str:complaint_id>/", views.ComplaintDetailView.as_view(), name="complaint-detail"),
    path("complaints/<str:complaint_id>/status/", views.ComplaintStatusView.as_view(), name="complaint-status"),
    path(
        "complaints/<str:complaint_id>/admin-response/",
        views.ComplaintAdminResponseView.as_view(),
        name="complaint-admin-response",
    ),
    path(
        "complaints/<str:complaint_id>/assignment/",
        views.ComplaintAssignmentView.as_view(),
        name="complaint-assignment",
    ),
    path(
        "complaints/<str:complaint_id>/reminder/",
        views.ComplaintReminderView.as_view(),
        name="complaint-reminder",
    ),
    path(
        "complaints/<str:complaint_id>/escalate/",
        views.ComplaintEscalationView.as_view(),
        name="complaint-escalation",
    ),
    path(
        "complaints/<str:complaint_id>/feedback/",
        views.ComplaintFeedbackView.as_view(),
        name="complaint-feedback",
    ),
    path("worker/complaints/", views.WorkerComplaintsView.as_view(), name="worker-complaints"),
    path("worker/location/", views.WorkerLocationView.as_view(), name="worker-location"),
    path(
        "worker/complaints/<str:complaint_id>/<str:action>/",
        views.WorkerComplaintActionView.as_view(),
        name="worker-complaint-action",
    ),
    path(
        "admin/complaints/<str:complaint_id>/<str:action>/",
        views.AdminComplaintApprovalView.as_view(),
        name="admin-complaint-approval",
    ),
    path("active-work/", views.ActiveWorkListCreateView.as_view(), name="active-work"),
    path("active-work/<str:work_id>/", views.ActiveWorkDetailView.as_view(), name="active-work-detail"),
    path("departments/", views.DepartmentListCreateView.as_view(), name="departments"),
    path("officers/", views.OfficerListCreateView.as_view(), name="officers"),
    path("dashboard/stats/", views.DashboardStatsView.as_view(), name="dashboard-stats"),
    path("dashboard/analytics/", views.AnalyticsView.as_view(), name="dashboard-analytics"),
    path("users/", views.UserListView.as_view(), name="users"),
    path("admin/users/<str:user_id>/block/", views.UserBlockView.as_view(), name="user-block"),
    path("notifications/", views.NotificationsView.as_view(), name="notifications"),
    path(
        "feedback/classification/",
        views.ClassificationFeedbackView.as_view(),
        name="classification-feedback",
    ),
    path("geo/route/", views.GeoRouteView.as_view(), name="geo-route"),
    path("geo/reverse/", views.GeoReverseView.as_view(), name="geo-reverse"),
    path("geo/search/", views.GeoSearchView.as_view(), name="geo-search"),
]



