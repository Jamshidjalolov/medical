# EduVista Academy

Premium educational testing website built with React, Vite, TailwindCSS, and React Router.

## Features

- Register flow with local validation
- Firebase Google sign-in with backend JWT session
- 8 educational topics with premium cards
- 10 learning cards and 10 quiz questions per topic
- Topic, quiz, certificate, and admin flows stored in backend
- Final 50-question certificate exam
- Certificate requires 70% or higher
- Certificate preview and PDF download with `html2canvas` + `jsPDF`

## Project Structure

```text
src/
  assets/
  components/
  context/
  data/
  pages/
  utils/
```

## Run

```bash
copy .env.example .env
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy

Frontend `Vercel`, backend `Render` uchun tayyor config qo'shilgan:

- `vercel.json`
- `render.yaml`

Vercel env namuna:

```bash
copy .env.example .env.production
```

Muhim qiymatlar:

- `VITE_SITE_URL=https://your-project.vercel.app`
- `VITE_API_BASE_URL=https://your-render-service.onrender.com/api/v1`
- `VITE_FIREBASE_API_KEY=...`
- `VITE_FIREBASE_AUTH_DOMAIN=...`
- `VITE_FIREBASE_PROJECT_ID=...`
- `VITE_FIREBASE_STORAGE_BUCKET=...`
- `VITE_FIREBASE_MESSAGING_SENDER_ID=...`
- `VITE_FIREBASE_APP_ID=...`

SPA deep-link ishlashi uchun `vercel.json` barcha route'larni `index.html` ga rewrite qiladi.
Share preview rasmi uchun `public/og-cover.png` va `index.html` ichida Open Graph meta qo'shilgan. `VITE_SITE_URL` ni trailing slashsiz yozing.

Backend deploy tartibi va Render env'lari `backend/README.md` da yozilgan.
