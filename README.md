# Grandma's Girl - AI Memory Companion for Alzheimer's Patients
> Built for the [ElevenLabs x a16z Worldwide Hackathon 2025](https://hackathon.elevenlabs.io/)

## About
Grandma's Girl is an AI companion that helps Alzheimer's patients retain memories through conversation and visual aids. We equip the agent with grandma's basic info and interactive tools. We only display images for conversations that have clear visual elements.


## What It Does
Grandma's Girl is an AI companion that helps Alzheimer's patients retain memories through conversation and visual aids. Inspired by caring for my grandma, it engages through speech and real-time image generation, creating a bridge between past memories and present moments.

## Key Features
- **Real-time voice conversations** with an AI agent that speaks in a cloned voice of a familiar person
- **Intelligent image generation** using text-to-image models and NLP techniques to create visuals based on conversation context
- **Dynamic image gallery** that visually maps stories, sparking memory recall
- **Visual history tracker** that helps caregivers monitor which images resonate most
- **Conversation analysis** to identify patterns in the patient's recall, aiding caregivers in tracking cognitive decline over time

## How We Built It
This system is designed with a deep understanding of Alzheimer's care, ensuring warmth, familiarity, and engagement at every step.

### Conversational AI & Voice Cloning
- **Conversational AI**: Uses ElevenLabs' AI agents for natural speech-to-text and text-to-speech interaction
- **Voice Cloning**: Familiar voices are essential as Alzheimer's patients can feel anxious with unfamiliar ones, so we cloned a familiar voice to provide comfort

### Carefully Designed System Prompts
- **Basic Information Recall**: Regularly prompts the patient about their name, hometown, and surroundings
- **Interactive Conversations with Visual Cues**: The agent detects relevant images and asks if they match the patient's memories
- **Contextual Follow-Ups**: Encourages the patient to recall what they just said, strengthening conversational continuity
- **Storytelling Focus**: Prioritizes questions about childhood and past events, as Alzheimer's patients often recall these more vividly
- **Emotional Intelligence**: Maintains a warm, patient, and positive tone

### Tool Use
Given time constraints, we focused on essential tools:
- **Date & Time Awareness**: The agent provides real-time information to help patients stay oriented
- **Knowledge Base**: A structured text file with basic personal and contextual information

### Automatic Image Generation Based on Conversation
- Real-time visual aid generation to bring memories to life
- **Model Choice**: Flux Pro via Fal.ai API for personalized visuals
- **NLP-Driven Triggers**: Uses spaCy to detect strong visual elements and trigger image creation

### Minimalist, Intuitive UI
- **Designed for Simplicity**: No distractions—just the conversation and its associated images
- **Gallery View**: Past images are accessible on the side for recall
- **Caregiver Insights**: Helps caregivers track which images spark the strongest responses

## Tech Stack & Architecture
- **Backend**: Flask-SocketIO for real-time WebSocket communication
- **NLP Processing**: spaCy for noun extraction and image trigger detection
- **Event-Driven Architecture**: Ensures smooth interaction between conversation and image generation
- **Multi-threading**: Prevents blocking operations during image generation
- **Frontend**: React + Chakra UI for a modern, responsive experience
- **APIs**:
  - ElevenLabs Conversational AI for speech-to-text and text-to-speech
  - Fal.ai with Flux Pro for image generation

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
1. Create a `.env` file in the root directory with your API keys:
```
AGENT_ID=your_elevenlabs_agent_id
ELEVEN_API_KEY=your_elevenlabs_api_key
FAL_KEY=your_fal_ai_key
```

2. Install backend dependencies:
```bash
pip install -r requirements.txt
```

3. Install frontend dependencies:
```bash
cd chat-app
npm install
```

### Running the Application
1. Start the backend server:
```bash
python main.py
```

2. In a new terminal, start the frontend:
```bash
cd chat-app
npm start
```

3. Open your browser and navigate to:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001

The image generation happens asynchronously in the background while the conversation continues, ensuring a smooth experience without interruptions.
