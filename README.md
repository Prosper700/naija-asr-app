# Naija Translator — Mobile App

A React Native mobile app for translating between English and three Nigerian languages — **Hausa, Yoruba, and Igbo** — using both your **voice** and **typed text**. Built with Expo, with a clean single-screen interface inspired by Google Translate.

> **Backend:** This app is powered by the [Naija ASR & Translation API](https://github.com/Prosper700/naija-asr-backend). See that repo for the FastAPI backend and model details.

## Screenshots

<!-- Add your screenshots here. Suggested: home (dark), home (light), recording, translation result -->

| Home (Dark)      | Recording        | Translation      | Home (Light)     |
| ---------------- | ---------------- | ---------------- | ---------------- |
| _add screenshot_ | _add screenshot_ | _add screenshot_ | _add screenshot_ |

> To add screenshots: take them on your phone, drop the images in an `assets/screenshots/` folder, and replace the placeholders above with `![Home](assets/screenshots/home-dark.png)`.

## Features

- **Voice translation** — speak in any supported language and get an instant translation
- **Text translation** — type and translate between any language pair
- **Four languages** — English, Hausa, Yoruba, Igbo (in any direction)
- **Live recording waveform** — animated bars react to your voice in real time
- **Language swap** — flip source and target with one tap
- **Dark & light themes** — toggle between a true-black dark mode and a clean light mode
- **Loading & error states** — clear feedback while transcribing/translating, with friendly messages when the server is waking up

## Tech Stack

| Layer           | Technology                                                                     |
| --------------- | ------------------------------------------------------------------------------ |
| Framework       | React Native (Expo SDK 54)                                                     |
| Language        | TypeScript                                                                     |
| Audio           | expo-av (recording + metering)                                                 |
| Vector graphics | react-native-svg                                                               |
| HTTP client     | axios                                                                          |
| Backend         | [Naija ASR & Translation API](https://github.com/Prosper700/naija-asr-backend) |

## How It Works

```
   ┌─────────────┐     voice / text      ┌──────────────────┐
   │  Mobile App │ ────────────────────▶ │   Backend API    │
   │  (Expo RN)  │ ◀──────────────────── │ (Hugging Face)   │
   └─────────────┘   transcription +     └──────────────────┘
                       translation
```

The app records audio (or takes typed text), sends it to the hosted backend, and displays the transcription and/or translation that comes back.

## Project Structure

```
src/
├── screens/
│   └── HomeScreen.tsx       # Main unified translate screen
├── components/
│   ├── Waveform.tsx         # Real-time audio waveform bars
│   ├── ThemeToggle.tsx      # Animated dark/light switch (SVG)
│   └── MicIcon.tsx          # Vector microphone icon
├── services/
│   └── api.ts               # Calls to the backend API
├── config/
│   └── constants.ts         # API URL + language definitions
└── types/
    └── index.ts             # Shared TypeScript types
```

## Getting Started

### Prerequisites

- Node.js 18+
- A phone with the **Expo Go** app (Android/iOS) for testing, or an Android emulator
- The backend API running (local or the hosted Hugging Face Space)

### Setup

```bash
# Clone the repo
git clone https://github.com/Prosper700/naija-asr-app.git
cd naija-asr-app

# Install dependencies
npm install --legacy-peer-deps

# Start the dev server
npx expo start
```

Scan the QR code with the Expo Go app to run it on your phone.

### Configure the Backend URL

Set the API endpoint in `src/config/constants.ts`:

```typescript
export const API_URL = "https://<your-space>.hf.space/api";
```

For local backend testing, use your computer's LAN IP (not `localhost`, since the phone needs to reach it over Wi-Fi):

```typescript
export const API_URL = "http://192.168.x.x:8000/api";
```

## Building an APK

The app is distributed as an Android APK using EAS Build:

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

EAS builds the APK in the cloud and provides a download link. The build profile in `eas.json` is set to produce an installable `.apk`.

## Supported Languages

| Language | Voice ASR | Text Translation |
| -------- | --------- | ---------------- |
| English  | ✅        | ✅               |
| Hausa    | ✅        | ✅               |
| Yoruba   | ✅        | ✅               |
| Igbo     | ✅        | ✅               |

## Limitations & Future Work

- **Tonal accuracy** — Nigerian languages use tone marks and diacritics that can be dropped during transcription, especially in noisy environments. This was most noticeable in Yoruba testing so far; systematic evaluation across languages and quiet vs. noisy conditions is planned.
- **First request after idle** can take 30–60 seconds while the free-tier backend wakes up (the app shows a "server waking up" message).
- **iOS build** not yet configured (Android APK only for now).

## Acknowledgements

- [Expo](https://expo.dev) for the React Native tooling
- Backend powered by [Whisper](https://github.com/openai/whisper) and [NLLB-200](https://ai.meta.com/research/no-language-left-behind/)
