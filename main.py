import os
import threading
from datetime import datetime
import fal_client
import spacy
from elevenlabs.client import ElevenLabs
from elevenlabs.conversational_ai.conversation import Conversation, ClientTools
from elevenlabs.conversational_ai.default_audio_interface import DefaultAudioInterface
from dotenv import load_dotenv
from flask import Flask
from flask_socketio import SocketIO

# Load environment variables
load_dotenv()

# --- Set up credentials from environment variables ---
AGENT_ID = os.getenv("AGENT_ID")
ELEVEN_API_KEY = os.getenv("ELEVEN_API_KEY")
FAL_KEY = os.getenv("FAL_KEY")

if not all([AGENT_ID, ELEVEN_API_KEY, FAL_KEY]):
    raise ValueError(
        "Missing required environment variables. Please check your .env file."
    )

os.environ["FAL_KEY"] = FAL_KEY  # Set FAL_KEY in environment

# --- Initialize the spacy model ---
nlp = spacy.load("en_core_web_sm")

# --- Initialize the ElevenLabs client ---
client = ElevenLabs(api_key=ELEVEN_API_KEY)


# This list will store all transcript fragments.
transcript_log = []
transcript_lock = threading.Lock()

# Add after other initializations
app = Flask(__name__)
socketio = SocketIO(
    app,
    cors_allowed_origins=["http://localhost:3000"],
    logger=True,
    engineio_logger=True,
    async_mode="threading",
    ping_timeout=60,
    ping_interval=25,
)


def get_current_datetime(parameters):
    print("get_current_datetime called")
    current_time = datetime.now()
    return current_time.strftime("%Y-%m-%d %H:%M:%S")


client_tools = ClientTools()
client_tools.register("get_current_datetime", get_current_datetime)


def on_queue_update(update):
    if isinstance(update, fal_client.InProgress):
        for log in update.logs:
            print(log["message"])


# --- Define a condition to trigger image generation ---
def should_generate_image(transcript):
    def _extract_pos(text):
        # Extract nouns from the text, not just named entities
        doc = nlp(text)
        nouns = [token.text for token in doc if token.pos_ == "NOUN"]
        return nouns

    nouns = _extract_pos(transcript)
    print("NOUNS: ", nouns)
    # If there are more than half of the words in the transcript that are nouns, generate an image
    return len(nouns) > 0


# --- Dummy function to simulate FAL AI image generation ---
def generate_image_fal(prompt):
    # In your production code, replace this with:
    # return {
    #     "images": [
    #         {
    #             "url": "https://v3.fal.media/files/zebra/3fVrwhS6WKCiqqX2WmxHh.png",
    #             "text": prompt,
    #         }
    #     ]
    # }
    result = fal_client.subscribe(
        "fal-ai/flux-pro/v1.1-ultra-finetuned",
        arguments={"prompt": prompt, "finetune_id": "", "finetune_strength": 0.5},
        with_logs=True,
        on_queue_update=on_queue_update,
    )
    return result


# --- Function to call FAL AI API and display the image ---
def generate_image_from_transcript(prompt):
    print("\n[Image Generation] Triggering image generation for prompt:")
    print(prompt)
    try:
        print("Generating image...PLEASE WAIT")
        result = generate_image_fal(prompt)
        images = result.get("images", [])
        if images:
            image_url = images[0].get("url")
            print("[Image Generation] Generated Image URL:", image_url)
            # Add more detailed logging
            print("[WebSocket] Attempting to emit image event")
            socketio.emit(
                "image",
                {"type": "image", "text": prompt, "image_url": image_url},
                namespace="/",  # Explicitly specify namespace
            )
            print("[WebSocket] Image event emitted successfully")
        else:
            print("[Image Generation] No images returned from FAL")
    except Exception as e:
        print("[Image Generation] Error generating image:", str(e))
        print("Full error:", e)


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
    agent_id=AGENT_ID,
    requires_auth=bool(ELEVEN_API_KEY),
    client_tools=client_tools,
    audio_interface=DefaultAudioInterface(),
    callback_user_transcript=handle_user_transcript,
    callback_agent_response=handle_agent_response,
)


# Add this after your other socket event handlers
# @socketio.on("connect")
# def handle_connect():
#     print("[WebSocket] Client connected")
#     # Send a test image immediately on connection
#     test_image = {
#         "type": "image",
#         "text": "Test connection image",
#         "image_url": "https://picsum.photos/800/800",
#     }
#     print("[WebSocket] Sending test image on connection")
#     socketio.emit("image", test_image)


# Modify the main block to properly handle both the conversation and web server
if __name__ == "__main__":
    print("Starting server on port 3001...")

    def run_conversation():
        print("Starting conversation session...")
        conversation.start_session()
        conversation_id = conversation.wait_for_session_end()
        print("Conversation Ended. Conversation ID:", conversation_id)
        print("Full Transcript Log:", transcript_log)

    # Start conversation in a separate thread
    conversation_thread = threading.Thread(target=run_conversation)
    conversation_thread.daemon = True
    conversation_thread.start()

    # Run the SocketIO server in the main thread
    socketio.run(
        app,
        host="0.0.0.0",
        port=3001,
        debug=True,
        use_reloader=False,  # Disable reloader when using threads
        allow_unsafe_werkzeug=True,
    )
