# Khmer Typing Land

A Khmer typing education web app built with Vite, React, and TypeScript.

## Features

- Interactive typing practice
- Multiplayer and challenge modes
- Firebase hosting compatible
- Vercel deploy ready

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:5000` in your browser.

## Build

```bash
npm run build
```

The production files are generated into `dist/public`.

## GitHub upload note

Make sure you do not commit the following folders:

- `node_modules/`
- `dist/`
- `.local/`
- `server/public/`

These folders are already excluded in `.gitignore`.

## Deploy

### Vercel

- Build Command: `npm run build`
- Output Directory: `dist/public`

### Firebase

- `firebase deploy`

## GitHub Actions

The repo includes `.github/workflows/firebase-deploy.yml` to deploy to Firebase on push to `main`.
