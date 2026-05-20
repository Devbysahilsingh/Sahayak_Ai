# Sahayak AI Mobile

React Native mobile app for the existing Sahayak AI grievance backend.

## What This Mobile App Uses

- Expo Go + Expo Router
- TypeScript
- NativeWind
- Zustand session and offline stores
- React Query for server state
- Expo Camera for live complaint and completion proof
- Expo Location for citizen/worker GPS
- Expo AV for voice complaint input
- Expo Notifications
- Reanimated loading states
- AsyncStorage fallback with MMKV-ready storage

The app keeps backend compatibility with the existing Django endpoints in `backend/` and the AI engine in `ai_engine/`.

## Folder Structure

```txt
mobile/
  app/
    _layout.tsx
    index.tsx
    (auth)/
      login.tsx
      register.tsx
      forgot-password.tsx
    (tabs)/
      _layout.tsx
      profile.tsx
      citizen/
        index.tsx
        submit.tsx
        complaints.tsx
        complaint/[id].tsx
      worker/
        index.tsx
        map.tsx
        analytics.tsx
        complaint/[id].tsx
  src/
    components/
    data/
    features/
      camera/
      voice/
    hooks/
    services/
    store/
    types/
    utils/
```

## Install

```powershell
cd "E:\bgi hackathon\Sahayak_Ai\citizen-grievance-system\mobile"
npm install
```

Create `.env` from `.env.example`:

```env
EXPO_PUBLIC_API_BASE_URL=http://10.160.178.28:8000/api
EXPO_PUBLIC_SOCKET_URL=ws://10.160.178.28:8000/ws
EXPO_PUBLIC_AI_ENGINE_URL=http://10.160.178.28:8001
EXPO_PUBLIC_LOCATION_MATCH_METERS=250
```

Use your current laptop Wi-Fi IPv4 in place of `10.160.178.28`.

## Backend Run

```powershell
cd "E:\bgi hackathon\Sahayak_Ai\citizen-grievance-system\backend"
& "E:\bgi hackathon\venv_ai\Scripts\python.exe" manage.py runserver 0.0.0.0:8000
```

## AI Engine Run

```powershell
cd "E:\bgi hackathon\Sahayak_Ai\citizen-grievance-system\ai_engine"
& "E:\bgi hackathon\venv_ai\Scripts\python.exe" -m uvicorn main:app --host 0.0.0.0 --port 8001
```

## Expo Run

```powershell
cd "E:\bgi hackathon\Sahayak_Ai\citizen-grievance-system\mobile"
npm start
```

Scan the QR code with Expo Go. Your phone and laptop must be on the same Wi-Fi network.

## NativeWind

NativeWind is configured through:

- `global.css`
- `tailwind.config.js`
- `babel.config.js`
- `metro.config.js`
- `nativewind-env.d.ts`

## OpenCV Setup

Expo Go cannot load native OpenCV frame processors. The current app includes an Expo Go-compatible mock pipeline in:

```txt
src/features/camera/visionPipeline.ts
```

For real OpenCV:

1. Move from Expo Go to an EAS development build.
2. Add a native OpenCV package or a custom native module.
3. Replace `scanEvidenceFrame(uri)` with the native OpenCV adapter.
4. Run:

```powershell
npx expo prebuild
npx eas build --profile development --platform android
```

## APK Build

Install EAS:

```powershell
npm install -g eas-cli
eas login
eas build:configure
```

Development APK:

```powershell
eas build --profile development --platform android
```

Production APK/AAB:

```powershell
eas build --profile production --platform android
```

## Notes

- Citizen flow supports login, dashboard, complaint history, details, feedback, GPS, live photo proof, voice input, offline draft queue, and notifications-ready setup.
- Worker flow supports assigned jobs, job details, GPS update, start job, completion proof, status actions, map-ready list, and analytics.
- Admin users route to worker/admin analytics because your mobile requirement combines worker/admin operational dashboards.
