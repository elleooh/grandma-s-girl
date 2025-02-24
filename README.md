# Grandma's Girl - AI Memory Companion for Alzheimer's Patients

## About
Grandma's Girl is an AI companion that helps Alzheimer’s patients retain memories through conversation and visual aids. We equip the agent with grandma’s basic info and interactive tools. We only display images for conversations that have clear visual elements.

Note: Naturally, image generation takes a bit longer—rest assured, the program is not broken.

## How It Works
The application combines several AI technologies to create an interactive and supportive experience:

1. **Conversational AI**: Using `ElevenLabs`' Conversational AI agents for natural `speech-to-text` and `text-to-speech` interaction, enabling fluid, patient conversations with users.

2. **Visual Memory Generation**: The system obtains the conversation text and uses it to generate relevant images through `Flux Pro` (developed by `Black Forest Labs`), accessed via the `Fal.ai` API. This creates visual representations of memories and stories being discussed. The image generation runs asynchronously alongside the conversation to ensure a smooth, uninterrupted experience.

## Important Note
⚠️ Please ensure you select different input and output audio devices before starting. If the same device is used for both, the agent will pick up its own voice as input, resulting in an infinite conversation loop with itself (it would be fun if it wasn't burning all my credits!).

## Setup and Installation

### Prerequisites
- Python 3.8+
- Node.js and npm
- Required API keys:
  - ElevenLabs API key
  - ElevenLabs Agent ID
  - Fal.ai API key

### Environment Setup
1. Create a `.env` file in the root directory with your API keys.

2. Install backend dependencies:
```bash
pip install -r requirements.txt
```

3. Install frontend dependencies:
```bash
cd chat-app
npm install
```

4. Run the server:
```bash
python main.py
```

5. In a new terminal, start the React app:
```bash
cd chat-app
npm start
```
