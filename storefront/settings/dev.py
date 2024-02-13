from .common import *

DEBUG = True
# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = "django-insecure-4hb4%_i_mvh&6**&e7$3cc$kefmtppm(!sy*$164h@hygr=vb&"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql", #sqlite3
        #"NAME": BASE_DIR / "db.sqlite3",
        "NAME": 'storefront',
        'HOST': 'localhost',
        'USER': 'root',
        'PASSWORD': '12345678',
    }
}