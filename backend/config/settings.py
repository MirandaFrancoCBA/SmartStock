"""
Django settings for SmartStock.

Environment-sensitive values are configured through environment variables so
local development and production can share the same codebase safely.
"""

from pathlib import Path
from datetime import timedelta
import os

BASE_DIR = Path(__file__).resolve().parent.parent


def env_bool(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def env_list(name: str, default: str = "") -> list[str]:
    value = os.getenv(name, default)
    return [item.strip() for item in value.split(",") if item.strip()]


def db_env(local_name: str, standard_name: str, default: str) -> str:
    """Prefer SmartStock POSTGRES_* vars, then standard libpq PG* vars."""
    return os.getenv(local_name) or os.getenv(standard_name) or default


SECRET_KEY = os.getenv("DJANGO_SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError(
        "DJANGO_SECRET_KEY is required. Copy .env.example to .env and set a local secret."
    )

DEBUG = env_bool("DJANGO_DEBUG", default=False)
ALLOWED_HOSTS = env_list("DJANGO_ALLOWED_HOSTS", default="localhost,127.0.0.1,0.0.0.0,backend")
CSRF_TRUSTED_ORIGINS = env_list("DJANGO_CSRF_TRUSTED_ORIGINS")

INSTALLED_APPS = [
    "django.contrib.admin", "django.contrib.auth", "django.contrib.contenttypes",
    "django.contrib.sessions", "django.contrib.messages", "django.contrib.staticfiles",
    "rest_framework", "django_filters", "drf_spectacular", "products", "inventory", "corsheaders",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"
TEMPLATES = [{
    "BACKEND": "django.template.backends.django.DjangoTemplates",
    "DIRS": [], "APP_DIRS": True,
    "OPTIONS": {"context_processors": [
        "django.template.context_processors.request",
        "django.contrib.auth.context_processors.auth",
        "django.contrib.messages.context_processors.messages",
    ]},
}]
WSGI_APPLICATION = "config.wsgi.application"

DATABASES = {"default": {
    "ENGINE": "django.db.backends.postgresql",
    "NAME": db_env("POSTGRES_DB", "PGDATABASE", "smartstock"),
    "USER": db_env("POSTGRES_USER", "PGUSER", "smartstock_user"),
    "PASSWORD": db_env("POSTGRES_PASSWORD", "PGPASSWORD", "smartstock_pass"),
    "HOST": db_env("POSTGRES_HOST", "PGHOST", "db"),
    "PORT": db_env("POSTGRES_PORT", "PGPORT", "5432"),
}}

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"},
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "AUTH_HEADER_TYPES": ("Bearer",),
}

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": ("rest_framework_simplejwt.authentication.JWTAuthentication",),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 10,
}

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {"standard": {"format": "[{asctime}] {levelname} {name} {message}", "style": "{"}},
    "handlers": {"console": {"class": "logging.StreamHandler", "formatter": "standard"}},
    "loggers": {
        "django": {"handlers": ["console"], "level": "INFO"},
        "smartstock": {"handlers": ["console"], "level": "INFO", "propagate": False},
    },
}

CORS_ALLOWED_ORIGINS = env_list(
    "DJANGO_CORS_ALLOWED_ORIGINS",
    default="http://localhost:4200,http://127.0.0.1:4200",
)
CORS_ALLOWED_ORIGIN_REGEXES = env_list("DJANGO_CORS_ALLOWED_ORIGIN_REGEXES")

if DEBUG and not CORS_ALLOWED_ORIGIN_REGEXES:
    CORS_ALLOWED_ORIGIN_REGEXES = [r"^http://localhost:\d+$", r"^http://127\.0\.0\.1:\d+$"]

CORS_ALLOW_CREDENTIALS = env_bool("DJANGO_CORS_ALLOW_CREDENTIALS", default=True)

if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
