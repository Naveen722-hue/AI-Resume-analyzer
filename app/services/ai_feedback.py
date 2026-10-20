import os

PROMPT = """You are a friendly but honest career coach reviewing a resume.

RESUME:
{resume}

JOB DESCRIPTION (may be empty):
{job}

Give feedback in this format:
1. Overall impression (2-3 sentences)
2. Top 3 strengths
3. Top 3 things to improve
4. Rewrite one weak bullet point to show how to make it stronger
Keep it practical and under 300 words."""


def get_ai_feedback(resume_text: str, job_text: str = ""):
    """Returns feedback text, or None if no API key / the call fails."""
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        return None

    try:
        import anthropic

        client = anthropic.Anthropic(api_key=api_key)
        message = client.messages.create(
            model=os.getenv("ANTHROPIC_MODEL", "claude-sonnet-5-5"),
            max_tokens=800,
            messages=[{
                "role": "user",
                "content": PROMPT.format(resume=resume_text[:6000], job=job_text[:3000]),
            }],
        )
        return message.content[0].text
    except Exception as exc:  # keep the app usable even if the API is down
        print(f"[ai_feedback] failed: {exc}")
        return None
