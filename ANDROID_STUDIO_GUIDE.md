# Flappy Bird Android Studio / Capacitor

## Requirements
- Node.js 20+ (22 recommended), Android Studio, Android SDK and JDK 17.
- An existing deployed HTTPS backend (Render) with Aiven MySQL configured.

## Steps (Windows PowerShell)
1. Extract this ZIP to a short path such as `C:\Projects\FlappyBird`.
2. Copy `.env.android.example` to `.env.production` and set the **real** Render backend URL ending in `/api`. Do not commit production secrets. The backend runs separately.
3. Run `npm install` (downloads dependencies and updates package-lock.json).
4. Run `npm run build`.
5. Run `npm run android:init` to generate the native Android project and force landscape orientation.
6. Run `npm run android:sync`.
7. Run `npm run android:open`; choose a phone or emulator and press Run.
8. For APK: Android Studio > Build > Build Bundle(s) / APK(s) > Build APK(s).

## Important limitations
- The Android native folder is generated **locally** by `npm run android:init`; it is not included in this ZIP because Capacitor/Gradle packages could not be downloaded in the preparation environment.
- Google Identity Services web button in `src/components/AuthModal.jsx` may fail in embedded Android WebView. Implement native Google Sign-In with an Android OAuth client and backend token verification before treating Google login as supported.
- Email/password sign-in, skins, scores and leaderboard depend on the Render API and database; test these with your production server.
- `VITE_API_BASE_URL` is baked into the web build. After changing it, rerun `npm run android:sync`.
- The supplied gameplay code uses tap-to-flap. It does not contain the previously described moving bomb/rock drag-to-dodge mode; that feature has not been invented or added in this conversion.
- Test display on different phone sizes. Landscape orientation is set on the generated Android activity, not on desktop browser.
