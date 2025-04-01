from django.shortcuts import render
import openai
import datetime
import os, requests
from rest_framework.response import Response
from rest_framework.views import APIView
from unidecode import unidecode


# Load API Key
openai.api_key = os.getenv("OPENAI_API_KEY")
client = openai.OpenAI()

assistant = os.getenv("AI_ASSISTANT_KEY")

class chatAssistantView(APIView):
    def post(self, request):
        user_message = request.data.get("message", "")
        thread_id = request.COOKIES.get("thread_id", None)
        if thread_id is None:
            thread_id = client.beta.threads.create().id

        url1 = f"https://api.openai.com/v1/threads/{thread_id}/messages"
        url2 = f"https://api.openai.com/v1/threads/{thread_id}/runs"

        headersNew = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}",
                "OpenAI-Beta": "assistants=v2"
            }
        bodyNew1 = {
                    "role": "user",
                    "content": f"In 2 to 4 sentences, {user_message}"
                }
        bodyNew2 = {
                    "assistant_id" : f"{assistant}",
                    "stream" : True
                }
        response1 = requests.post(url1, headers=headersNew, json=bodyNew1)#create a new message
        #print(response1.content)
        response2 = requests.post(url2, headers=headersNew, json=bodyNew2)#create a new run
        #print(response2.content)
        response3 = requests.get(url1, headers=headersNew)#Looks at message
        # print(response3.content)
        if response3.status_code == 200:
            response = Response({"response": unidecode(response3.json()['data'][0]['content'][0]['text']['value'])}, status=200)
            response.set_cookie(
                key="thread_id",
                value=thread_id,
                httponly=True,
                secure=True,
                samesite="Lax",
                path="/",
                expires=datetime.datetime.now(datetime.UTC) + datetime.timedelta(days=7)
            )
            # print(response["response"])
            return response
            #return jsonify({"message": response3.json()})
        else:
            return Response({"error": "Error"}, status=500)
