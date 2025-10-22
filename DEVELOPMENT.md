Local dev instructions for Echo API

1) Start the local dev API server (express):

    npm run dev-server

  - This runs a small Express server on port 3001 by default exposing /api/echo.
  - It reuses the logic in api/echo.ts if available, otherwise returns a mock response.

2) Start the frontend dev server (Vite):

    # point the frontend to the local API server
    $env:VITE_API_BASE = 'http://localhost:3001'
    npm run dev

3) Open your browser at the Vite URL (usually http://localhost:5173/cd-kindred-echo-latest/) and use the Journal -> Reflect with Echo flow.

Notes:
- If you want to test with OpenAI, set OPENAI_API_KEY in your environment before starting dev-server (or deploy and set it in the host env).
- When deploying to Vercel/Netlify, remove the DEV server and rely on the serverless function in api/echo.ts.
