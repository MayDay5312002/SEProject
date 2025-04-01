from django.urls import path, include
from .views import chatAssistantView  # Ensure this is the correct import for your view class

urlpatterns = [
    path("chat/", chatAssistantView.as_view(), name="chat_with_fa_assistant")
]
