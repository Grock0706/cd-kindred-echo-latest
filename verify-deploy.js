// verify-deploy.js
import fetch from "node-fetch";

const TEST_TEXT = "Post-deploy check: Reflect on today's progress.";
const API_URL = "https://kindred-echo-latest.vercel.app/api/echo";

(async () => {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: TEST_TEXT }),
    });

    if (!res.ok) {
      console.error(`❌ API returned HTTP ${res.status}`);
      process.exit(1);
    }

    const data = await res.json();

    if (data?.reflection && data?.model?.includes("gpt-4o")) {
      console.log("✅ Echo API Live check passed:");
      console.log(`Model: ${data.model}`);
      console.log(`Reflection: ${data.reflection}`);
      process.exit(0);
    } else {
      console.error("⚠️ Echo API responded, but reflection looks mock or invalid:");
      console.log(JSON.stringify(data, null, 2));
      process.exit(1);
    }
  } catch (err) {
    console.error("🚨 Verification script failed:", err);
    process.exit(1);
  }
})();
