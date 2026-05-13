from django.apps import AppConfig


class GrievancesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'grievances'

    def ready(self):
        from .database import connect_mongo

        connect_mongo()
