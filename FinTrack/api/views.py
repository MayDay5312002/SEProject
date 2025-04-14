from django.shortcuts import render
import openai
import datetime
import os, requests, json
from rest_framework.response import Response
from rest_framework.views import APIView
from unidecode import unidecode
from .assistant_tools import get_news_today, get_userData_analysis

from rest_framework.decorators import api_view, permission_classes #funciton based view used this with all views
from rest_framework.permissions import IsAuthenticated 
# from base.models import Categories ,Transactions  # <-- import table from base(database information)
from django.contrib.auth.models import User  # <-- default table in the database
from django.contrib.auth.hashers import make_password , check_password
from django.http import JsonResponse
from .serializers import UserSerializer
from django.shortcuts import get_object_or_404 , redirect
from datetime import timedelta
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework.status import HTTP_201_CREATED, HTTP_400_BAD_REQUEST
from django.db import connection
# from pprint import pprint




# Load API Key
openai.api_key = os.getenv("OPENAI_API_KEY")
client = openai.OpenAI()

assistant = os.getenv("AI_ASSISTANT_KEY")

class chatAssistantView(APIView):
    def post(self, request):
        authenticate_user(request)
        user_message = request.data.get("message", "")
        thread = request.COOKIES.get("thread_id", None)
        if thread is None:
            thread = client.beta.threads.create().id
        thread = client.beta.threads.retrieve(thread_id=thread)
        # url1 = f"https://api.openai.com/v1/threads/{thread.id}/messages"
        # url2 = f"https://api.openai.com/v1/threads/{thread.id}/runs"

        # headersNew = {
        #         "Content-Type": "application/json",
        #         "Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}",
        #         "OpenAI-Beta": "assistants=v2"
        #     }
        # bodyNew1 = {
        #             "role": "user",
        #             "content": user_message
        #         }
        # bodyNew2 = {
        #             "assistant_id" : f"{assistant}",
        #             "stream" : True
        #         }
        # run = client.beta.runs.create()
        # response1 = requests.post(url1, headers=headersNew, json=bodyNew1)#create a new message
        # #print(response1.content)
        # response2 = requests.post(url2, headers=headersNew, json=bodyNew2)#create a new run
        # #print(response2.content)
        # response3 = requests.get(url1, headers=headersNew)#Looks at message

        message = client.beta.threads.messages.create(thread_id=thread.id, role="user", content=user_message)
        run = client.beta.threads.runs.create_and_poll(thread_id=thread.id, assistant_id=assistant)
        messages = client.beta.threads.messages.list(thread_id = thread.id)
        # print(response3.content)
        print(messages.data[0].content[0].text.value)
        if run.status == "completed":
            response = Response({"response": unidecode(messages.data[0].content[0].text.value)}, status=200)
            response.set_cookie(
                key="thread_id",
                value=thread.id,
                httponly=True,
                secure=True,
                samesite="Lax",
                path="/",
                expires=datetime.datetime.now(datetime.UTC) + datetime.timedelta(days=7)
            )
            # print(response["response"])
            return response
            #return jsonify({"message": response3.json()})
        elif run.status == "requires_action":
            print("Requires action")
            tool_outputs = []
            for tool in run.required_action.submit_tool_outputs.tool_calls:
                if tool.function.name == "get_news_today":
                    tool_response = get_news_today()
                    tool_outputs.append(
                        {
                        "tool_call_id": tool.id,
                        "output": tool_response
                        }
                    )
                    try:
                        run = client.beta.threads.runs.submit_tool_outputs_and_poll(
                            thread_id=thread.id,
                            run_id=run.id,
                            tool_outputs=tool_outputs
                        )
                    except Exception as e:
                        print(e)
                        print("Error - in exception")
                        return Response({"error": "Error"}, status=500)
                if tool.function.name == "get_userData_analysis":
                    print("get_userData_analysis")
                    sample_purchases = [
                        {"date": "2025-04-01", "amount": 120.50, "category": "Groceries", "vendor": "Whole Foods"},
                        {"date": "2025-04-02", "amount": 45.00, "category": "Dining", "vendor": "Local Restaurant"},
                        {"date": "2025-04-03", "amount": 65.99, "category": "Entertainment", "vendor": "Movie Theater"},
                        {"date": "2025-04-05", "amount": 200.00, "category": "Utilities", "vendor": "Electric Company"},
                        {"date": "2025-04-07", "amount": 35.45, "category": "Groceries", "vendor": "Trader Joe's"},
                        {"date": "2025-04-10", "amount": 89.99, "category": "Shopping", "vendor": "Target"},
                        {"date": "2025-04-12", "amount": 55.00, "category": "Transportation", "vendor": "Gas Station"},
                        {"date": "2025-04-15", "amount": 12.99, "category": "Subscriptions", "vendor": "Streaming Service"},
                        {"date": "2025-04-18", "amount": 78.50, "category": "Dining", "vendor": "Fancy Restaurant"},
                        {"date": "2025-04-20", "amount": 120.00, "category": "Shopping", "vendor": "Department Store"},
                    ]
    
                    tool_response = get_userData_analysis(sample_purchases=sample_purchases)
                    tool_outputs.append(
                        {
                        "tool_call_id": tool.id,
                        "output": tool_response
                        }
                    )
                    try:
                        run = client.beta.threads.runs.submit_tool_outputs_and_poll(
                            thread_id=thread.id,
                            run_id=run.id,
                            tool_outputs=tool_outputs
                        )
                    except Exception as e:
                        print(e)
                        print("Error - in exception")
                        return Response({"error": "Error"}, status=500)
            # while(run.status == "queued" or run.status == "in_progress" or run.status == "requires_action"):
            #     pass
            if run.status == "completed":
                messages = client.beta.threads.messages.list(thread_id = thread.id)
                print(messages.data[0].content[0].text.value)
                response = Response({"response": unidecode(messages.data[0].content[0].text.value)}, status=200)
                response.set_cookie(
                    key="thread_id",
                    value=thread.id,
                    httponly=True,
                    secure=True,
                    samesite="Lax",
                    path="/",
                    expires=datetime.datetime.now(datetime.UTC) + datetime.timedelta(days=7)
                )
                # print(response["response"])
                return response
            else:
                print(run.status)
                print("Failed")
                return Response({"error": "Error"}, status=500)
        else:
            print(run.status)
            return Response({"error": "Error"}, status=500)
        
class getThreadMessageView(APIView):
    def get(self, request):
        authenticate_user(request)
        print(os.getenv("buss_news_api"))
        thread_id = request.COOKIES.get("thread_id", None)
        if thread_id is None:
            thread_id = client.beta.threads.create().id
            newResponse = Response({"response": "No thread ID found"}, status=200)
            newResponse.set_cookie(
                key="thread_id",
                value=thread_id,
                httponly=True,
                secure=True,
                samesite="Lax",
                path="/",
                expires=datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=7)
            )
            return newResponse
        url1 = f"https://api.openai.com/v1/threads/{thread_id}/messages"
        headersNew = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}",
                "OpenAI-Beta": "assistants=v2"
            }
        response1 = requests.get(url1, headers=headersNew)
        if response1.status_code == 200:
            dictionary = [ele["content"][0]["text"]["value"] for ele in response1.json()["data"]]
            dictionary = [unidecode(ele) for ele in dictionary[-1::-1]]
            # for ele in dictionary:
            #     print(ele)
            #     print()
            # pprint(dictionary)
            response = Response({"response": dictionary}, status=200)
            return response
        else:
            return Response({"error": "Error"}, status=500)

class deleteThreadView(APIView):
    def post(self, request):
        authenticate_user(request)
        thread_id = request.COOKIES.get("thread_id", None)
        thread_id = client.beta.threads.create().id
        newResponse = Response({"response": "Thread deleted"}, status=200)
        newResponse.set_cookie(
            key="thread_id",
            value=thread_id,
            httponly=True,
            secure=True,
            samesite="Lax",
            path="/",
            expires=datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=7)
        )
        return newResponse






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
            response.set_cookie(
                'account_id',
                serializer.data['id'],
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
    response.delete_cookie('access_token')
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
@api_view(['POST'])
def addTransaction(request):
    authenticate_user(request)
    accountID = request.COOKIES.get("account_id")
    # Make a copy of request.data because it's immutable
    category = request.data.get('category')
    amount = float(request.data.get('amount'))
    date = request.data.get('date')
    vendor_name = request.data.get('name')


    print(category, amount, date, vendor_name, accountID)

    with connection.cursor() as cursor:
        cursor.callproc("createTransaction", [date, vendor_name, amount, category, accountID])
        cursor.fetchall()

    return Response({"message": "Transaction added successfully"}, status=200)






"API to get specific user "
"purpose used to set the http cookie to put the transaciton and budge "
@api_view(['POST'])
def getAccountID(request):
    authenticate_user(request)
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
    authenticate_user(request)
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
    authenticate_user(request)
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
    
@api_view(['GET'])
def getCategories(request):
    authenticate_user(request)
    with connection.cursor() as cursor:
        cursor.callproc("getAllCategories", [])
        headers = [col[0] for col in cursor.description]
        results = cursor.fetchall()
        results = [{headers[0]: row[0], headers[1]: row[1]} for row in results]
        print("Results:", results)
    return Response({"categories": results}, status=200)


@api_view(['GET'])
def getUserTransactions(request):
    #going have to require a access token and bearer token

    # below was just for testing by query paramter 
    # accountID = request.GET.get("accountID")


    # this would jsut be call with curernt account id in token
    # account ID woould be in the http only cookie
    authenticate_user(request)
    accountID = request.COOKIES.get("account_id") #account id cookie

    with connection.cursor() as cursor:
        cursor.callproc("getAllTransaction", [accountID])
        headers = [col[0] for col in cursor.description]
        results = cursor.fetchall()
        results = [{headers[0]: row[0], headers[1]: row[1], headers[2]: row[2], headers[3]: row[3], headers[4]: row[4], headers[5]: row[5]} for row in results]
        print("Results:", results)
    return Response({"transactions": results}, status=200)

