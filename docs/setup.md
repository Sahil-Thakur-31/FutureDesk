# FutureDesk Setup

## 1. Prerequisites

Install these first:

- Node.js 22 or newer
- MongoDB database
- Backblaze B2 bucket

Check Node:

```powershell
node -v
npm -v
```

## 2. Install pnpm on Windows

If `pnpm` is not installed or not available in PowerShell.

Preferred option:

```powershell
corepack enable
corepack prepare pnpm@10.6.1 --activate
pnpm -v
```

If `corepack` is not available, use:

```powershell
npm install -g pnpm
pnpm -v
```

If PowerShell still says `pnpm` is not recognized, close the terminal and open a new one.

## 3. Install project dependencies

From the repo root:

```powershell
cd C:\Users\Sahil\Codes\FutureDesk
pnpm install
```

## 4. Create environment files

Run these PowerShell commands from the repo root:

```powershell
Copy-Item .env.example .env
Copy-Item backend\.env.example backend\.env
Copy-Item desktop\.env.example desktop\.env
Copy-Item mobile\.env.example mobile\.env
```

Then fill in the required values.

## 5. Required environment variables

Root `.env` and `backend/.env` should contain:

```env
API_PUBLIC_URL=http://localhost:4000
DNS_SERVERS=1.1.1.1,8.8.8.8
MONGODB_URI=
JWT_SECRET=
PORT=4000
CLIENT_URL=http://localhost:5173
DESKTOP_URL=http://localhost:5173
MOBILE_DEEP_LINK=futuredesk://
B2_BUCKET=
B2_ACCESS_KEY=
B2_SECRET_KEY=
B2_ENDPOINT=
ENCRYPTION_KEY=
```

`desktop/.env`:

```env
VITE_API_URL=http://localhost:4000
```

`mobile/.env`:

```env
EXPO_PUBLIC_API_URL=http://localhost:4000
```

For Android, the app now tries this order when `EXPO_PUBLIC_API_URL` is `http://localhost:4000`:

1. Expo dev server host IP
2. `10.0.2.2` for Android emulator

That means `localhost` can still work in development without manually editing the code.

You can also set it explicitly:

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:4000
```

For a physical phone, use your computer's local network IP.

## 6. Start the backend

```powershell
pnpm --filter @futuredesk/backend dev
```

Expected API base URL:

```text
http://localhost:4000
```

Health check:

```text
GET /health
```

## 7. Start the desktop app

In a new terminal:

```powershell
cd C:\Users\Sahil\Codes\FutureDesk
pnpm --filter @futuredesk/desktop dev
```

This starts the React desktop UI through Vite.

If you want the Electron shell, use another terminal:

```powershell
cd C:\Users\Sahil\Codes\FutureDesk
pnpm --filter @futuredesk/desktop dev:electron
```

Important:

- Start the Vite dev server first.
- Then start `dev:electron`.

## 8. Start the mobile app

In another terminal:

```powershell
cd C:\Users\Sahil\Codes\FutureDesk
pnpm --filter @futuredesk/mobile dev
```

Then use Expo to open:

- Android emulator
- iOS simulator
- Expo Go on a physical device

## 9. Recommended terminal layout

Use 3 terminals:

```text
Terminal 1: pnpm --filter @futuredesk/backend dev
Terminal 2: pnpm --filter @futuredesk/desktop dev
Terminal 3: pnpm --filter @futuredesk/mobile dev
```

Optional Electron shell:

```text
Terminal 4: pnpm --filter @futuredesk/desktop dev:electron
```

## 10. Build commands

```powershell
pnpm --filter @futuredesk/shared build
pnpm --filter @futuredesk/backend build
pnpm --filter @futuredesk/desktop build
pnpm --filter @futuredesk/mobile build
```

## 11. Typecheck commands

```powershell
pnpm --filter @futuredesk/shared typecheck
pnpm --filter @futuredesk/backend typecheck
pnpm --filter @futuredesk/desktop typecheck
pnpm --filter @futuredesk/mobile typecheck
```

## 12. Common issues

`pnpm` not recognized:

```powershell
corepack enable
corepack prepare pnpm@10.6.1 --activate
```

Expo app cannot reach backend:

- Do not use `localhost` on a physical phone.
- Use your machine's LAN IP in `EXPO_PUBLIC_API_URL`.

Mongo connection fails:

- Check that MongoDB is reachable from your machine or deployment host.
- Verify username, password, and database URI.

Backblaze B2 upload fails:

- Verify bucket name, endpoint, and access keys.
- If your bucket is private, leave `B2_PUBLIC_URL` unset and use the authenticated backend file route.

Desktop Electron window opens blank:

- Make sure `pnpm --filter @futuredesk/desktop dev` is already running before `dev:electron`.

## 13. First command to run on your machine

Based on the error you showed, run this first:

```powershell
corepack enable
corepack prepare pnpm@10.6.1 --activate
pnpm -v
```

Then:

```powershell
cd C:\Users\Sahil\Codes\FutureDesk
pnpm install
```
