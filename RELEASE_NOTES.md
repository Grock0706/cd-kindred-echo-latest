Kindred Echo — Production Release Checklist
=========================================

This file documents the final steps to cut a production release for Kindred Echo and verify the live LLM integration.

1) Confirm environment variables (production)
   - OPENAI_API_KEY: set to a valid OpenAI platform key (no surrounding quotes, no CR/LF)
   - HUGGINGFACE_API_KEY: optional, set if you want HF router as primary
   - HF_MODEL: optional, e.g., `mistralai/Mistral-7B-Instruct-v0.2`
   - ECHO_MODE: set to `live` to force live LLM path (or unset) — do NOT set to `mock`
   - ECHO_DEBUG: set to `0` (or remove) for production to avoid leaking upstream errors
   - VITE_API_BASE: the published frontend URL (if you host frontend separately)

   Use the Vercel Dashboard (Project → Settings → Environment Variables) or the Vercel CLI from your authenticated machine.

2) Deploy to production from the project folder
   - Recommended: set the Vercel Project Root to `kindred-echo-latest` in Dashboard (Settings → Root Directory).
   - Or deploy manually from the folder where `package.json` lives:

     ```powershell
     cd kindred-echo-latest
     vercel --prod
     ```

3) Smoke test the API (no debug)

   ```powershell
   $body = @{ text = "Production smoke test: I felt anxious today but proud of progress." } | ConvertTo-Json
   Invoke-RestMethod -Uri 'https://<your-prod-host>/api/echo' -Method POST -ContentType 'application/json' -Body $body
   ```

   Expected: JSON with `reflection` and a `model` field that is not `mock`.

4) If the response is still `mode: "mock"` or 500s with upstream errors:
   - Re-check that `OPENAI_API_KEY` is present and valid in Production (and that it is a platform OpenAI API key if you are calling `api.openai.com`).
   - If using OpenRouter or another gateway, set `OPENAI_API_BASE` accordingly (e.g., `https://api.openrouter.ai/v1`).
   - Validate Hugging Face token and model by calling the router endpoint locally (curl) to ensure no 401/403.

5) Finalize release metadata and tag
   - Locally (from your machine where git is available), run:

     ```bash
     git checkout main
     git pull origin main
     git tag -a v1.0.0 -m "Kindred Echo live LLM integration (GPT-4o-mini)"
     git push --tags
     ```

   - Create a GitHub Release from the tag in the repo UI, or run `gh release create v1.0.0 --title "v1.0.0" --notes-file RELEASE_NOTES.md`.

6) Post-release
   - Ensure `ECHO_DEBUG` is removed or set to `0` in production.
   - Monitor usage and error logs for the first 24–48 hours.

Notes
-----
- We removed local `.env.production` from the repo; keep secrets in Vercel only.
- The serverless function includes a safe error handler that returns JSON on unexpected crashes. It will include stack traces only if `ECHO_DEBUG=1`.

If you want, I can:
- Re-run a final smoke test after you confirm envs and deployment, and interpret any remaining errors.
- Prepare the exact GitHub Release notes and create a draft release file.
