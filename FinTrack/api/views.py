from django.shortcuts import render
import openai
import datetime
import os, requests
from rest_framework.response import Response
from rest_framework.views import APIView
from unidecode import unidecode
from .assistant_tools import *
# from pprint import pprint




# Load API Key
openai.api_key = os.getenv("OPENAI_API_KEY")
client = openai.OpenAI()

assistant = os.getenv("AI_ASSISTANT_KEY")

class chatAssistantView(APIView):
    def post(self, request):
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
                expires=datetime.datetime.now(datetime.UTC) + datetime.timedelta(days=7)
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
            expires=datetime.datetime.now(datetime.UTC) + datetime.timedelta(days=7)
        )
        return newResponse
