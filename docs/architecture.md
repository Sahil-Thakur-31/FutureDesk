# Architecture

## Monorepo structure

```text
futuredesk/
  backend/
  desktop/
  mobile/
  shared/
  docs/
```

## Backend

- Express API with clean layering across `controllers`, `services`, `repositories`, and `models`
- MongoDB persistence through Mongoose
- JWT auth, bcrypt hashing, rate limiting, AES encryption for ID vault fields
- Socket.io room-per-user sync events
- Multer memory uploads with Backblaze B2 persistence

## Desktop

- Electron shell hosting a Vite + React workspace
- Zustand state management
- IndexedDB queue for offline mutation replay
- Shared API client and schemas from `@futuredesk/shared`

## Mobile

- Expo + React Native
- React Navigation bottom tabs
- AsyncStorage offline queue and session persistence
- Push notification scaffolding through `expo-notifications`

## Shared package

- Request helpers
- Zod validation schemas
- TypeScript entity contracts
- Common formatting and offline queue utilities
