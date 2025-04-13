from django.urls import path, include
from . import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView
)

"""
Default:
access token : 5 minutes
refresh token : 1 day / 24 hours 

"""
urlpatterns = [

    path('registerAccount/',views.registerAccount),
    path('loginAccount/',views.loginAccount),
    path('logoffAccount/',views.logoutAccount),
    # path('getCategories',views.getCategories),
    # path('addTransaction',views.addTransaction),
    # path('getAccountID',views.getAccountID),
    # path('getUserTransactions',views.getUserTransactions),
    path('resetAccessToken/', views.resetAccessToken),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('authenticate/', views.AuthenticateView.as_view(), name='authenticate'),
]




"""

1. first api request is to generate the access and refresh token
2. second api request is going to generate a new access token
    - access token is short term and renew it within the http cookie only 
    - question of like what about the refresh token . means user is going to be log off and have to 
        regenerate both tokens again


notes for the token it is linked to the auth user table 

"""