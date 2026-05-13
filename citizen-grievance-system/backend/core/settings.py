"""
Django settings for core project.
"""

import os
from pathlib import Path

from dotenv import load_dotenv

# =========================================
# BASE DIRECTORY
# =========================================

BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(BASE_DIR / ".env")


# =========================================
# SECURITY
# =========================================

SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "django-insecure-change-this-key")

DEBUG = os.getenv("DJANGO_DEBUG", "True").lower() == "true"

ALLOWED_HOSTS = [
    host.strip()
    for host in os.getenv("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")
    if host.strip()
]


# =========================================
# INSTALLED APPS
# =========================================

INSTALLED_APPS = [
    # Django Default Apps
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third Party Apps
    'rest_framework',
    'corsheaders',

    # Local Apps
    'grievances',
]


# =========================================
# MIDDLEWARE
# =========================================

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',

    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


# =========================================
# URL CONFIGURATION
# =========================================

ROOT_URLCONF = 'core.urls'


# =========================================
# TEMPLATES
# =========================================

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]


# =========================================
# WSGI
# =========================================

WSGI_APPLICATION = 'core.wsgi.application'


# =========================================
# DATABASE
# Django keeps a tiny SQLite database for framework internals only.
# Application data is stored in MongoDB through MongoEngine.
# =========================================

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


# =========================================
# PASSWORD VALIDATION
# =========================================

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# =========================================
# INTERNATIONALIZATION
# =========================================

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'Asia/Kolkata'

USE_I18N = True

USE_TZ = True


# =========================================
# STATIC FILES
# =========================================

STATIC_URL = 'static/'


# =========================================
# MEDIA FILES
# =========================================

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'


# =========================================
# DEFAULT PRIMARY KEY
# =========================================

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# =========================================
# CORS SETTINGS
# =========================================

CORS_ALLOW_ALL_ORIGINS = True


# =========================================
# APPLICATION SERVICE SETTINGS
# =========================================

MONGODB_URI = os.getenv(
    "MONGODB_URI",
    "mongodb://localhost:27017/sahayak_ai",
)

MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "sahayak_ai")

AI_ENGINE_URL = os.getenv("AI_ENGINE_URL", "http://127.0.0.1:8001")

GEOAPIFY_API_KEY = os.getenv("GEOAPIFY_API_KEY", "")

OTP_EXPIRY_MINUTES = int(os.getenv("OTP_EXPIRY_MINUTES", "10"))

OTP_DEV_MODE = os.getenv("OTP_DEV_MODE", "True").lower() == "true"

FALSE_COMPLAINT_BLOCK_THRESHOLD = int(
    os.getenv("FALSE_COMPLAINT_BLOCK_THRESHOLD", "6")
)

CLASSIFICATION_CONFIDENCE_THRESHOLD = float(
    os.getenv("CLASSIFICATION_CONFIDENCE_THRESHOLD", "0.65")
)

ACTIVE_WORK_MATCH_RADIUS_KM = float(
    os.getenv("ACTIVE_WORK_MATCH_RADIUS_KM", "1.5")
)

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", REDIS_URL)
CELERY_RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND", REDIS_URL)
CELERY_TASK_ALWAYS_EAGER = os.getenv("CELERY_TASK_ALWAYS_EAGER", "False").lower() == "true"
CELERY_TASK_EAGER_PROPAGATES = True

ASYNC_COMPLAINT_PROCESSING = os.getenv("ASYNC_COMPLAINT_PROCESSING", "True").lower() == "true"

VOICE_TRANSCRIPTION_ENABLED = os.getenv("VOICE_TRANSCRIPTION_ENABLED", "True").lower() == "true"


# =========================================
# REST FRAMEWORK SETTINGS
# =========================================

REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [],
    'DEFAULT_PERMISSION_CLASSES': [],
}
