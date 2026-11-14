# PrayashCare Staff Portal

The staff portal provides administrator, doctor, and receptionist workflows for hospital operations.

## Local development

```bash
npm install
npm run dev
```

The development server uses port `5174` by default. Configure `VITE_BACKEND_URL` in the local environment when the API is not available at `http://localhost:4000`.

## Build and lint

```bash
npm run build
npm run lint
```

Original logos, the favicon, app icon, and web manifest are served from `public/brand` and `public/manifest.webmanifest`.
