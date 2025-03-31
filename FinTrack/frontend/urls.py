from .views import index
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
import os


urlpatterns = [
    path('', index),
    path("dashboard/", index),
    path("images/", index)

]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=os.path.join(settings.BASE_DIR, 'frontend', 'static'))

