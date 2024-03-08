from .common import *

DEBUG = True
# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = "django-insecure-4hb4%_i_mvh&6**&e7$3cc$kefmtppm(!sy*$164h@hygr=vb&"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql", #sqlite3
        #"NAME": BASE_DIR / "db.sqlite3",
        "NAME": 'storefront',
        'HOST': '127.0.0.1', # 'mysql' when use docker from localhost
        'USER': 'root',
        'PASSWORD': '12345678',
    }
}


CELERY_BROKER_URL = 'redis://localhost:6379/1' #'redis://localhost:6379/1' 

CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://localhost:6379/2',
        'TIMEOUT': 10 * 60,
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

EMAIL_HOST = 'smtp4dev'
EMAIL_HOST_USER = ''
EMAIL_HOST_PASSWORD = ''
EMAIL_PORT = 2525

DEBUG_TOOLBAR_CONFIG = {
    'SHOW_TOOLBAR_CALLBACK': lambda request: True
}
