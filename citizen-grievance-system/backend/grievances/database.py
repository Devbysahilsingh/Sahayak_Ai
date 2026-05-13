from mongoengine import connect
from mongoengine.connection import get_connection
from mongoengine.connection import ConnectionFailure

from django.conf import settings


def connect_mongo():
    try:
        get_connection()
        return
    except ConnectionFailure:
        pass

    connect(
        db=settings.MONGODB_DB_NAME,
        host=settings.MONGODB_URI,
        alias="default",
        uuidRepresentation="standard",
    )
