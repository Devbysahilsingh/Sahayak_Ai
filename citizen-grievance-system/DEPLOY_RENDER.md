# Render Deployment

This repo is prepared for Render with the blueprint at `../render.yaml` because the Git repository root is `Sahayak_Ai` and this app is inside `citizen-grievance-system`.

## Services

- `sahayak-ai-frontend`: React/Vite static site
- `sahayak-ai-backend`: Django API, configured as a paid `starter` service because persistent disks are not available on Render free web services
- `sahayak-ai-engine`: FastAPI AI/voice service, configured as `standard` because PyTorch/Transformers/Whisper dependencies need more memory than the free instance normally provides

## Required External Accounts

- GitHub repository connected to Render
- MongoDB Atlas cluster
- Geoapify API key

## Render Steps

1. Push the latest code to GitHub.
2. In Render, choose **New > Blueprint**.
3. Select the GitHub repo that contains `Sahayak_Ai/render.yaml`.
4. Render will create the three services from the blueprint.
5. When prompted for unsynced environment variables, fill:
   - `MONGODB_URI`
   - `GEOAPIFY_API_KEY`
6. Deploy the services.
7. After Render creates the public URLs, confirm these values match your actual service URLs:
   - Backend `DJANGO_ALLOWED_HOSTS`: `sahayak-ai-backend.onrender.com`
   - Backend `CORS_ALLOWED_ORIGINS`: `https://sahayak-ai-frontend.onrender.com`
   - Backend `CSRF_TRUSTED_ORIGINS`: `https://sahayak-ai-frontend.onrender.com`
   - Backend `AI_ENGINE_URL`: `https://sahayak-ai-engine.onrender.com`
   - Frontend `VITE_API_BASE_URL`: `https://sahayak-ai-backend.onrender.com/api`
8. If Render changes any service URL because the name is taken, update the matching env vars and redeploy the frontend/backend.

## Important Notes

- The backend has a persistent disk mounted at `/var/data` for uploaded media and Django's SQLite framework database. Render supports persistent disks only on paid web services.
- Application data is stored in MongoDB Atlas, not SQLite.
- `ASYNC_COMPLAINT_PROCESSING=False` is set for Render simplicity, so no Redis/Celery worker is required.
- The AI service dependencies are large. If you need a lower-cost deploy, temporarily remove the AI service, set backend `AI_ENGINE_URL` blank, and the backend will use fallback routing rules.
- Vite frontend env vars are baked in at build time. If you change `VITE_API_BASE_URL`, redeploy the frontend.

## Health Checks

- Backend: `https://sahayak-ai-backend.onrender.com/api/health/`
- AI engine: `https://sahayak-ai-engine.onrender.com/health`

## Phone And Laptop Access

- The same frontend URL works on laptop and phone: `https://sahayak-ai-frontend.onrender.com`
- Citizen web view starts from `/login`, then `/my-grievances`, `/submit`, and `/notifications`.
- Worker web view starts from `/worker/login`, then `/officer`, `/officer/assigned`, `/officer/high-priority`, and related job detail pages.
- Mobile browsers can use **Add to Home screen** because the frontend includes a web app manifest.
- Camera, microphone, and location features require HTTPS, which Render provides automatically.
