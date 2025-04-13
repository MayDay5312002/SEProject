from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes #funciton based view used this with all views
from rest_framework.permissions import IsAuthenticated 
# from base.models import Categories ,Transactions  # <-- import table from base(database information)
from django.contrib.auth.models import User  # <-- default table in the database
from django.contrib.auth.hashers import make_password , check_password
import json
import requests
from django.http import JsonResponse
from .serializers import UserSerializer
from django.shortcuts import get_object_or_404 , redirect
from datetime import timedelta
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework.views import APIView


from rest_framework.status import HTTP_201_CREATED, HTTP_400_BAD_REQUEST


@api_view(['POST'])
def loginAccount(request):
    # grab the body details
    data = json.loads(request.body)
    username = data.get('username')
    password = data.get('password')
    
    #Check if the account exist in the first place
    if not User.objects.filter(username=username).exists():
        return Response({"error": "Account does not exist"}, status=404)
    
    # attempt to grab user records
    userData = get_object_or_404(User, username=username)
    serializer = UserSerializer(userData,many=False)

    if not check_password(password, serializer.data['password']):
        return Response({'error': 'invalid password'}, status = 401)

    #Account exist and correct password so overall valid credentials
   
    #set the account ID as http only cookie
    
    # Call another api request to receive refresh and access token 
    external_api_url = "http://127.0.0.1:8000/api/token/"
    payload = {
        'username': username,
        'password': password,
    }
    headers = {'Content-Type': 'application/json'}

    try:
        response = requests.post(external_api_url, json=payload, headers=headers)
        
        if response.status_code == 200:
            tokens = response.json()  # Assuming the API returns the tokens in JSON format

            #make sure to create the response

            response = Response({
                'message' : 'Login sucessful',
            }, status=200)

        
            #set refresh token as HTTP-only cookie

            #set refresh token
            response.set_cookie(
                'refresh_token',
                tokens.get('refresh'),
                httponly=True,
                secure=True,
                max_age=timedelta(days=15),
                samesite='Strict'
            )
            response.set_cookie(
                'access_token',
                tokens.get('access'),
                httponly=True,
                secure=True,
                max_age=timedelta(days=15),
                samesite='Strict'
            )

            # Return the response with the tokens
            return response
          
        else:
            return Response({"error": "Failed to retrieve tokens from external API"}, status=500)
    
    except requests.exceptions.RequestException as e:
        return Response({"error": f"Error connecting to external API: {str(e)}"}, status=500)

#end of login account API request

    
@api_view(['POST'])
def registerAccount(request):
    try:
        data = request.data
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return Response({'error': 'Username and password are required'}, status=HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists'}, status=HTTP_400_BAD_REQUEST)

        hashedPassword = make_password(password)
        User.objects.create(username=username, password=hashedPassword)
        return Response({'success': 'User created'}, status=HTTP_201_CREATED)

    except Exception as e:
        print(e)
        return Response({'error': 'Something went wrong'}, status=HTTP_400_BAD_REQUEST)

#END OF REGISTER ACCOUNT

@api_view(['POST'])
def logoutAccount(request):
    #remove refresh token
    response = Response({'success': 'Log out successful'}, status=200)
    response.delete_cookie('refresh_token')
    response.delete_cookie('account_id')
    return response

class AuthenticateView(APIView):
    def get(self, request):
        access_token = request.COOKIES.get("access_token")
        refresh_token = request.COOKIES.get("refresh_token")
        print("access token", access_token)
        print("refresh token", refresh_token)
        if access_token and refresh_token:
            try:
                # Validate the access token
                AccessToken(access_token)
                print("Authenticated successfully.")
                return Response({"message": "Authenticated successfully."})
            except Exception:
                if refresh_token:
                    try:
                        # Validate the refresh token
                        response = Response({"message": "Authenticated successfully."})
                        refresh = RefreshToken(refresh_token)
                        response.set_cookie(
                            key="access_token",
                            value=str(refresh.access_token),
                            httponly=True,
                            secure=True,
                            samesite="Lax",
                            path="/",
                            max_age=timedelta(days=15)
                        )
                        return response
                    except Exception as e:
                        print("refresh token error", e)
                        return Response({"error": str(e)}, status=401)
                print("No refresh token found.")
                return Response({"error": str(Exception)}, status=401)

        return Response({"error": "Access token and refresh token not found."}, status=401)

def authenticate_user(request):
    access_token = request.COOKIES.get("access_token")
    refresh_token = request.COOKIES.get("refresh_token")

    if access_token and refresh_token:
        # Validate the access token
        try:
            AccessToken(access_token)
            RefreshToken(refresh_token)
            return None
        except Exception:
            # Validate the refresh token
            try:
                refresh_token=RefreshToken(refresh_token)
                return str(refresh_token.access_token)
            except Exception as e:
                print("refresh token error", e)
                raise Exception(str(e))






# "requires a bearer token that authetnicates this "
# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def addTransaction(request):
#    # Get account ID from HTTP-only cookie
#     accountID = request.COOKIES.get('account_id')

#     if not accountID:
#         return Response({'error': 'Account ID not found in cookies'}, status=400)

#     # Make a copy of request.data because it's immutable
#     dataCopy = request.data.copy()

#     # Add the account ID to the data payload
#     dataCopy['accountID'] = accountID  # <-- fixed typo here (was amountID)

#     # Serialize and save the data
#     serializer = TransactionsSerializer(data=dataCopy)

#     if serializer.is_valid():
#         serializer.save()
#         return Response(serializer.data, status=200)
#     return Response(serializer.errors, status=400)






"API to get specific user "
"purpose used to set the http cookie to put the transaciton and budge "
@api_view(['POST'])
def getAccountID(request):
    username = request.data.get('username')
    user = User.objects.filter(username=username).first()

    response = Response({
        'set_cookie' : "success",
        'account_id': user.id

    }, status=200)

    response.set_cookie(
        'account_id',
        user.id,
        httponly=True,
        secure=True,
        max_age=timedelta(days=15),
        samesite='Strict'
    )

    return response


@api_view(['POST'])
def verifyRefreshToken(request):

    refreshToken = request.COOKIES.get('refresh_token')

    if(not refreshToken):
        return Response({"message":"refreshToken does not exist"}, status=404)
    try:
        token = RefreshToken(refreshToken)
        return Response({"message":"refresh token does exist assuming always true "}, status=200)
    except Exception as e:
        return Response({"message":"refresh token invalid"}, status=404)


#This is for case where in memory access token is null or empty
@api_view(['POST'])
def resetAccessToken(request):

    #valid token as it pass the first case
    refreshToken = request.COOKIES.get('refresh_token')

    url = 'http://127.0.0.1:8000/api/token/refresh/'
    payload = {
        'refresh': refreshToken,
    }
    headers = {'Content-Type': 'application/json'}

    try:
        response = requests.post(url, json=payload, headers=headers)
        
        if response.status_code == 200:
            result = response.json()  
            
            response = Response({
                'message' : 'Login sucessful',
                'access_token': result.get('access')
            }, status=200)

            return response
          
        else:
            return Response({"error": "refresh token is invalid"}, status=500)
    
    except requests.exceptions.RequestException as e:
        return Response({"error": f"Error connecting to external API: {str(e)}"}, status=500)