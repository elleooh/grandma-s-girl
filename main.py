import os
import threading
import time
import fal_client
from elevenlabs.client import ElevenLabs
from elevenlabs.conversational_ai.conversation import Conversation
from elevenlabs.conversational_ai.default_audio_interface import DefaultAudioInterface
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# --- Set up credentials from environment variables ---
agent_id = os.getenv("AGENT_ID")
api_key = os.getenv("ELEVEN_API_KEY")
FAL_KEY = os.getenv("FAL_KEY")

if not all([agent_id, api_key, FAL_KEY]):
    raise ValueError(
        "Missing required environment variables. Please check your .env file."
    )

os.environ["FAL_KEY"] = FAL_KEY  # Set FAL_KEY in environment

# --- Initialize the ElevenLabs client ---
client = ElevenLabs(api_key=api_key)

# This list will store all transcript fragments.
transcript_log = []
transcript_lock = threading.Lock()


# --- Define a condition to trigger image generation ---
def should_generate_image(transcript):
    return True
    # For demonstration, trigger if transcript has at least 20 words and contains any trigger keyword.
    # trigger_keywords = [
    #     "scene",
    #     "scenario",
    #     "view",
    #     "landscape",
    #     "image",
    #     "picture",
    #     "show",
    # ]
    # words = transcript.split()
    # if len(words) >= 20 and any(
    #     keyword in transcript.lower() for keyword in trigger_keywords
    # ):
    #     return True
    # return False


def on_queue_update(update):
    if isinstance(update, fal_client.InProgress):
        for log in update.logs:
            print(log["message"])


# --- Dummy function to simulate FAL AI image generation ---
def generate_image_fal(prompt):
    # In your production code, replace this with:
    result = fal_client.subscribe(
        "fal-ai/flux-pro/v1.1-ultra-finetuned",
        arguments={"prompt": prompt, "finetune_id": "", "finetune_strength": 0.5},
        with_logs=True,
        on_queue_update=on_queue_update,
    )
    return result
    # time.sleep(2)  # Simulate network delay
    # return {"data": [{"url": "https://example.com/generated_image.png"}]}


# --- Function to call FAL AI API and display the image ---
def generate_image_from_transcript(prompt):
    print("\n[Image Generation] Triggering image generation for prompt:")
    print(prompt)
    try:
        print("Generating image...PLEASE WAIT")
        result = generate_image_fal(prompt)
        image_url = result  # ["data"][0]["url"]
        print("[Image Generation] Generated Image URL:", image_url)
    except Exception as e:
        print("[Image Generation] Error generating image:", e)


# --- Callback functions for the conversational agent ---
def handle_user_transcript(transcript):
    with transcript_lock:
        transcript_log.append(transcript)
    print("User Transcript:", transcript)
    # Check if this new transcript segment should trigger image generation
    if should_generate_image(transcript):
        # For prompt, you can use just the current transcript or combine with earlier parts.
        prompt = transcript  # or " ".join(transcript_log)
        # Run image generation in a separate thread so the conversation continues
        threading.Thread(target=generate_image_from_transcript, args=(prompt,)).start()


def handle_agent_response(response):
    print("Agent Response:", response)


# --- Initialize the conversation instance ---
conversation = Conversation(
    client=client,
    agent_id=agent_id,
    requires_auth=bool(api_key),
    audio_interface=DefaultAudioInterface(),
    callback_user_transcript=handle_user_transcript,
    callback_agent_response=handle_agent_response,
)

print("Starting conversation session...")
conversation.start_session()

# This call will block until the conversation ends (e.g. with Ctrl+C)
conversation_id = conversation.wait_for_session_end()
print("Conversation Ended. Conversation ID:", conversation_id)
print("Full Transcript Log:", transcript_log)
