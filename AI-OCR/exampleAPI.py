import os
import sys
from anthropic import Anthropic
from dotenv import load_dotenv

# Load environment variables from .env file (if it exists)
load_dotenv()

def generate_poem(topic):
    """Generate a poem about the given topic using Anthropic's API."""
    
    # Get API key from environment variable or user input
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        api_key = input("Please enter your Anthropic API key: ")
    
    # Initialize the Anthropic client
    client = Anthropic(api_key=api_key)
    
    # Craft prompt to generate a poem
    prompt = f"Please write a beautiful, creative poem about {topic}. The poem should be around 10-15 lines long."
    
    try:
        # Make the API call using the SDK
        message = client.messages.create(
            model="claude-3-7-sonnet-20250219",  # Using the latest model as of April 2025
            max_tokens=500,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        # Extract and return the generated poem
        return message.content[0].text
    
    except Exception as e:
        print(f"Error making API request: {e}")
        return None

def main():
    """Main function to interact with the user and generate poems."""
    print("🌟 Anthropic Claude Poem Generator 🌟")
    print("---------------------------------")
    
    while True:
        # Get topic from user
        topic = input("\nEnter a topic for your poem (or 'quit' to exit): ")
        
        if topic.lower() in ['quit', 'exit', 'q']:
            print("Thank you for using the Poem Generator. Goodbye!")
            sys.exit(0)
        
        print(f"\nGenerating a poem about '{topic}'...\n")
        poem = generate_poem(topic)
        
        if poem:
            print("---------------------------------")
            print(poem)
            print("---------------------------------")

if __name__ == "__main__":
    main()