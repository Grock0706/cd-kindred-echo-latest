# Deploying Echo API to Vercel

Quick steps to deploy the Echo serverless function to Vercel and configure the OpenAI or Hugging Face secret.

1. Install and login to Vercel CLI (if you prefer the web UI you can skip CLI):

```powershell
npm i -g vercel
npx vercel login
```

2. From the project root, deploy:

```powershell
cd C:\Users\gerar\OneDrive\PO_PM\kindred-echo\kindred-echo-latest
vercel --prod
```

3. Add the `OPENAI_API_KEY` in the Vercel dashboard (Project Settings → Environment Variables) or via CLI:

```powershell
vercel env add OPENAI_API_KEY production
```

4. Verify the endpoint:

```
POST https://<your-project>.vercel.app/api/echo
Body: { "text": "..." }
```

Notes
- The repository already includes `api/echo.js` which is Vercel-ready. The TypeScript `api/echo.ts` can remain for local dev/testing.
- For testing without an OpenAI key, the function returns a mock empathetic reflection.

Hugging Face (optional, free inference)
---------------------------------------

You can use Hugging Face Inference to get free or lower-cost LLM responses. Steps:

1. Add your Hugging Face token to Vercel:

```powershell
vercel env add HUGGINGFACE_API_KEY production
```

When prompted, paste your token (it should begin with `hf_`).

2. Set the model name (example: `tiiuae/falcon-7b-instruct`):

```powershell
vercel env add HF_MODEL production
# when prompted, enter: tiiuae/falcon-7b-instruct
```

3. Redeploy:

```powershell
vercel --prod
```

4. Verify by POSTing to `/api/echo` — the handler will try Hugging Face first, then OpenAI, then fallback to the mock.
# Deploying Echo API to Vercel

Quick steps to deploy the Echo serverless function to Vercel and configure the OpenAI secret.

1. Install and login to Vercel CLI (if you prefer the web UI you can skip CLI):

```powershell
npm i -g vercel
npx vercel login
```

2. From the project root, deploy:

```powershell
cd C:\Users\gerar\OneDrive\PO_PM\kindred-echo\kindred-echo-latest
vercel --prod
```

3. Add the `OPENAI_API_KEY` in the Vercel dashboard (Project Settings → Environment Variables) or via CLI:

```powershell
vercel env add OPENAI_API_KEY production
```

4. Verify the endpoint:

```
POST https://<your-project>.vercel.app/api/echo
Body: { "text": "..." }
```

Notes
- The repository already includes `api/echo.js` which is Vercel-ready. The TypeScript `api/echo.ts` can remain for local dev/testing.
- For testing without an OpenAI key, the function returns a mock empathetic reflection.
