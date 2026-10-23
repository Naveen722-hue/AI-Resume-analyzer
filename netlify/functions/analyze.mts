import type { Config } from "@netlify/functions";

import { ALLOWED_EXTENSIONS, UnsupportedFileError, extensionOf, extractText } from "../../lib/parser.js";
import { analyze } from "../../lib/scorer.js";

const MAX_CONTENT_LENGTH = 5 * 1024 * 1024; // 5 MB

const fail = (error: string, status = 400) => Response.json({ error }, { status });

export default async (req: Request) => {
  if (req.method !== "POST") return fail("Method not allowed", 405);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail("Please choose a resume file.");
  }

  const file = form.get("resume");
  const jobText = String(form.get("job_description") ?? "");

  if (!(file instanceof File) || !file.name) return fail("Please choose a resume file.");
  if (!ALLOWED_EXTENSIONS.includes(extensionOf(file.name))) {
    return fail("Only PDF, DOCX and TXT files are supported.");
  }
  if (file.size > MAX_CONTENT_LENGTH) return fail("File is too large (max 5 MB).", 413);

  // the file is only held in memory for this request - nothing is stored
  let text: string;
  try {
    text = await extractText(file.name, await file.arrayBuffer());
  } catch (err) {
    if (err instanceof UnsupportedFileError) return fail(err.message);
    return fail("Couldn't read that file. Is it corrupted or password protected?");
  }

  if (text.length < 50) return fail("Couldn't find enough text. Scanned PDFs aren't supported yet.");

  return Response.json({
    filename: file.name,
    result: analyze(text, jobText),
    // trimmed copy so the page can request AI feedback without re-uploading
    resume_text: text.slice(0, 6000),
  });
};

export const config: Config = { path: "/api/analyze" };
