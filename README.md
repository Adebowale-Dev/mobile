# SALOON BOOK mobile app

Run these commands inside `mobile/`:

```powershell
npm install
npx expo start
```

If `.env` is missing, copy `.env.example` to it. Set `EXPO_PUBLIC_API_URL` to your computer's reachable LAN API URL, for example `http://192.168.1.100:4000/api`. This is public configuration, not a place for secrets. Never use `localhost` for a physical phone's API connection.

Start the database and backend first. Keep phone and computer on the same Wi-Fi, install an SDK 57-compatible Expo Go build, and scan the terminal QR code. Verify `http://YOUR_LAN_IP:4000/health` opens in the phone browser. Restart Expo after changing environment variables.

For Expo connectivity issues, try `npx expo start --tunnel`. This tunnels Metro only; the backend must still be reachable independently.

Checks: `npm run lint` and `npx tsc --noEmit`. Use `npx expo install` for Expo-managed dependencies. On PowerShell systems that block scripts, use `npm.cmd` / `npx.cmd`.

See [the project setup guide](../backend/README.md) for backend startup, phone testing, authentication and the full acceptance checklist. Dependencies, environment files, and formatting configuration live within this folder.
