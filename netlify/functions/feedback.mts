import Anthropic from "@anthropic-ai/sdk";
import type { Config } from "@netlify/functions";

const PROMPT = (resume: string, job: string) => `You are a friendly but honest career coach reviewing a resume.

RESUME:
${resume}

JOB DESCRIPTION (may be empty):
${job}

Give feedback in this format:
1. Overall impression (2-3 sentences)
2. Top 3 strengths
3. Top 3 things to improve
4. Rewrite one weak bullet point to show how to make it stronger
Keep it practical and under 300 words.`;

export default async (req: Request) => {
  if (req.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 });

  const { resume_text = "", job_description = "" } = await req.json().catch(() => ({}));
  if (typeof resume_text !== "string" || !resume_text.trim()) {
    return Response.json({ error: "Missing resume text." }, { status: 400 });
  }

  try {
    const anthropic = new Anthropic();
    const message = await anthropic.messages.create({
      model: "claude-sonnet-5-5",
      max_tokens: 800,
      messages: [{
        role: "user",
        content: PROMPT(resume_text.slice(0, 6000), String(job_description).slice(0, 3000)),
      }],
    });
    const feedback = message.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("")
      .trim();
    return Response.json({ feedback });
  } catch (err) {
    // keep the app usable even if the API is down
    console.error("[feedback] failed:", err);
    return Response.json({ error: "AI feedback isn't available right now." }, { status: 502 });
  }
};

export const config: Config = { path: "/api/feedback" };
