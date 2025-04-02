from django.urls import path, include
from .views import chatAssistantView, getThreadMessageView, deleteThreadView  # Ensure this is the correct import for your view class

urlpatterns = [
    path("chat/", chatAssistantView.as_view(), name="chat_with_fa_assistant"),
    path("getMessages/", getThreadMessageView.as_view(), name="chat_get_messages"),
    path("deleteThread/", deleteThreadView.as_view(), name="chat_delete_thread")
]
