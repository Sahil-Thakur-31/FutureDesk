# Deployment

## Backend

1. Provision MongoDB and Backblaze B2.
2. Set backend environment variables from [backend/.env.example](/c:/Users/Sahil/Codes/FutureDesk/backend/.env.example).
3. Build with `pnpm --filter @futuredesk/backend build`.
4. Deploy the `backend/dist` output to a Node.js host such as Railway, Render, Fly.io, or an AWS container.

## Desktop

1. Set [desktop/.env.example](/c:/Users/Sahil/Codes/FutureDesk/desktop/.env.example).
2. Run `pnpm --filter @futuredesk/desktop build`.
3. Package Electron with your preferred bundler such as `electron-builder` or `electron-forge`.

## Mobile

1. Set [mobile/.env.example](/c:/Users/Sahil/Codes/FutureDesk/mobile/.env.example).
2. Run `pnpm --filter @futuredesk/mobile dev` for local testing.
3. Use EAS Build for signed Android and iOS artifacts.

## Realtime

- Ensure the API host allows WebSocket upgrades for Socket.io.
- Configure the frontend apps to point at the same backend origin used for REST APIs.
