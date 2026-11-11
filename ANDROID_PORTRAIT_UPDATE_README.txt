FLAPPY BIRD — ANDROID PORTRAIT UPDATE

Changes:
- Keeps Android portrait orientation and makes setup-android.mjs retain it.
- Removes the 1.25 canvas scaling ceiling and fills unused portrait-stage space with a sky backdrop.
- Hides desktop-only keyboard instructions on narrow portrait screens.
- Does not stretch the original 360x540 game coordinates, preserving collision behavior.

IMPORTANT GOOGLE SIGN-IN:
- src/components/AuthModal.jsx only renders Google Sign-In when VITE_GOOGLE_CLIENT_ID is set.
- Google Identity Services web login is not supported reliably inside Android WebView.
- A production Android implementation needs a native Google Sign-In plugin, an Android OAuth client configured with package name + SHA-1, and backend token verification. This archive DOES NOT claim native Google login is fixed.
- Do not put OAuth client secrets, DB credentials or backend secrets in the Vite environment.

UPDATE STEPS:
1. Back up your existing project. Extract this ZIP to a new directory.
2. Copy your own .env.production into the new project (do not publish it). Verify VITE_API_BASE_URL points to your actual HTTPS Render backend.
3. In VS Code terminal: npm install
4. npm run android:sync
5. npm run android:open
6. In Android Studio select vivo V2434, app, then Run.

Note: The 360:540 game aspect ratio remains intact. On very tall phones the sky backdrop fills spare vertical space; fully extending the actual game world would require redesigning the game's logical viewport and collision/rendering coordinates.
