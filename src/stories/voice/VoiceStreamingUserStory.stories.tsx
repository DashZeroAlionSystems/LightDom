import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'User Stories/Voice Streaming Service',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# Voice Streaming Service - User Story

## Overview

The Voice Streaming Service enables natural voice interactions with DeepSeek AI, providing a hands-free, conversational interface for the LightDom platform.

---

## Epic: Voice-to-Voice DeepSeek Communication

### User Story 1: Wake Word Activation

**As a** user  
**I want to** say "Hey DeepSeek" or "Hello DeepSeek" to activate voice input  
**So that** I can interact hands-free without clicking buttons

#### Acceptance Criteria
- ✅ System listens for wake word in privacy-conscious mode
- ✅ Visual feedback when wake word is detected (button animation)
- ✅ Recording starts automatically after wake word
- ✅ Only DeepSeek wake words trigger recording (ethical listening)

---

### User Story 2: Push-to-Talk Voice Input

**As a** user  
**I want to** click a microphone button to record my voice  
**So that** I can provide voice input without using wake words

#### Acceptance Criteria
- ✅ Animated microphone button in prompt input
- ✅ Visual state changes (idle → recording → processing)
- ✅ Transcript appears in real-time
- ✅ Recording stops on silence or button click

---

### User Story 3: Voice Response (Text-to-Speech)

**As a** user  
**I want** DeepSeek to speak its responses aloud  
**So that** I can have a natural conversation without reading

#### Acceptance Criteria
- ✅ AI responses are automatically spoken
- ✅ Voice settings are configurable (speed, pitch, volume)
- ✅ Multiple voice options available
- ✅ Can be toggled on/off

---

### User Story 4: Report Reader

**As a** user  
**I want to** say "read the report" to have DeepSeek read content aloud  
**So that** I can consume content hands-free while multitasking

#### Acceptance Criteria
- ✅ Voice command recognition for "read report"
- ✅ DeepSeek reads document content
- ✅ Pause/resume controls available
- ✅ Speed adjustment during playback

---

### User Story 5: Voice Configuration

**As an** administrator  
**I want to** configure voice service settings  
**So that** I can customize the voice experience for different use cases

#### Acceptance Criteria
- ✅ Wake word customization
- ✅ Language selection
- ✅ TTS voice selection
- ✅ Privacy mode configuration
- ✅ Settings persist in database

---

## Technical Architecture

### Components

\`\`\`
┌─────────────────────────────────────────────────────────────────┐
│                     Voice Streaming Service                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────────────┐ │
│  │  VoiceButton │   │ PromptInput  │   │  Voice Settings      │ │
│  │  Component   │◄─►│  (Enhanced)  │◄─►│  Dashboard           │ │
│  └──────────────┘   └──────────────┘   └──────────────────────┘ │
│         │                  │                      │              │
│         ▼                  ▼                      ▼              │
│  ┌──────────────────────────────────────────────────────────────┤
│  │                    React Hooks Layer                         │ │
│  │  ┌──────────────────┐  ┌──────────────────┐                 │ │
│  │  │ useVoiceRecording│  │ useTextToSpeech  │                 │ │
│  │  └──────────────────┘  └──────────────────┘                 │ │
│  └──────────────────────────────────────────────────────────────┤
│         │                  │                                     │
│         ▼                  ▼                                     │
│  ┌──────────────────────────────────────────────────────────────┤
│  │                  Web Speech API                              │ │
│  │  ┌──────────────────┐  ┌──────────────────┐                 │ │
│  │  │ SpeechRecognition│  │ SpeechSynthesis  │                 │ │
│  │  └──────────────────┘  └──────────────────┘                 │ │
│  └──────────────────────────────────────────────────────────────┤
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────────┤
│  │                  Backend Services                            │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │              Voice Streaming Service                    │ │ │
│  │  │  • Session Management                                   │ │ │
│  │  │  • Command Detection                                    │ │ │
│  │  │  • Workflow Execution                                   │ │ │
│  │  │  • DeepSeek Integration                                 │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  └──────────────────────────────────────────────────────────────┤
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────────┤
│  │                  Database (PostgreSQL)                       │ │
│  │  • voice_service_configs                                     │ │
│  │  • voice_sessions                                            │ │
│  │  • voice_messages                                            │ │
│  │  • voice_commands                                            │ │
│  │  • tts_voices                                                │ │
│  │  • voice_workflows                                           │ │
│  │  • bidi_stream_connections                                   │ │
│  └──────────────────────────────────────────────────────────────┤
└─────────────────────────────────────────────────────────────────┘
\`\`\`

### Voice Workflow

\`\`\`mermaid
sequenceDiagram
    participant U as User
    participant VB as VoiceButton
    participant VR as useVoiceRecording
    participant WS as Voice Service
    participant DS as DeepSeek
    participant TTS as useTextToSpeech

    U->>VB: Click mic / Say "Hey DeepSeek"
    VB->>VR: Start recording
    VR->>VR: Capture audio
    U->>VR: Speak message
    VR->>WS: Send transcript
    WS->>DS: Process with DeepSeek
    DS->>WS: Return response
    WS->>TTS: Speak response
    TTS->>U: Audio output
\`\`\`

---

## Privacy & Ethics

### Ethical Voice Listening

The voice service is designed with privacy as a core principle:

1. **Wake Word Only Mode** (Default)
   - Only processes audio after detecting the wake word
   - No background listening or recording
   - Audio is processed locally in the browser

2. **Push-to-Talk Mode**
   - Requires explicit button press to record
   - Clear visual feedback when recording

3. **Data Handling**
   - Recordings auto-deleted after processing
   - Transcripts stored only if user opts in
   - No third-party voice data sharing

### Voice Commands

Only configured wake words trigger recording:
- "Hello DeepSeek"
- "Hey DeepSeek"
- "Hi DeepSeek"

---

## Configuration Options

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| \`enabled\` | boolean | true | Enable voice features |
| \`wakeWord\` | string | "hello deepseek" | Wake word phrase |
| \`wakeWordEnabled\` | boolean | true | Enable wake word detection |
| \`ttsEnabled\` | boolean | true | Enable text-to-speech |
| \`ttsVoiceId\` | string | "deepseek-natural" | TTS voice ID |
| \`ttsRate\` | number | 1.0 | Speech rate (0.1-10) |
| \`ttsPitch\` | number | 1.0 | Speech pitch (0-2) |
| \`language\` | string | "en-US" | Language code |
| \`silenceTimeout\` | number | 3 | Stop recording after N seconds of silence |
| \`privacyMode\` | string | "wake_word_only" | Privacy mode setting |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/api/voice/health\` | Service health check |
| GET | \`/api/voice/config\` | Get voice configuration |
| PUT | \`/api/voice/config\` | Update configuration |
| GET | \`/api/voice/voices\` | List TTS voices |
| GET | \`/api/voice/commands\` | List voice commands |
| POST | \`/api/voice/commands/detect\` | Detect wake word/command |
| POST | \`/api/voice/sessions\` | Start voice session |
| POST | \`/api/voice/sessions/:id/end\` | End voice session |
| POST | \`/api/voice/sessions/:id/messages\` | Record voice message |
| GET | \`/api/voice/workflows\` | List voice workflows |
| POST | \`/api/voice/workflows/:id/execute\` | Execute workflow |
| POST | \`/api/voice/speak\` | Text-to-speech request |
| GET | \`/api/voice/stats\` | Service statistics |

---

## Files Created

### Frontend
- \`src/components/ui/VoiceButton.tsx\` - Animated voice button
- \`src/hooks/useVoiceRecording.ts\` - Voice recording hook
- \`src/hooks/useTextToSpeech.ts\` - TTS hook
- \`src/components/ui/PromptInput.tsx\` - Enhanced with voice

### Backend
- \`services/voice-streaming-service.js\` - Voice service
- \`api/voice-routes.js\` - REST API routes

### Database
- \`migrations/20251129_voice_streaming_service.sql\`

### Storybook
- \`src/stories/voice/VoiceButton.stories.tsx\`
- \`src/stories/voice/PromptInputWithVoice.stories.tsx\`
- \`src/stories/voice/VoiceStreamingUserStory.stories.tsx\`

        `,
      },
    },
  },
};

export default meta;

type Story = StoryObj;

// Placeholder story for documentation
export const Documentation: Story = {
  render: () => (
    <div className="prose max-w-none">
      <h1>Voice Streaming Service</h1>
      <p className="text-lg text-on-surface-variant">
        This user story documents the complete voice streaming service implementation
        for DeepSeek integration.
      </p>
      <p>
        See the <strong>Docs</strong> tab above for the complete documentation.
      </p>
    </div>
  ),
};
