import mammoth from "mammoth";
import { extractText as extractPdfText, getDocumentProxy } from "unpdf";

import { cleanText } from "./text.js";

export const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".txt"];

export class UnsupportedFileError extends Error {}

export function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot === -1 ? "" : filename.slice(dot).toLowerCase();
}

/** Pull plain text out of a resume file (pdf, docx or txt). */
export async function extractText(filename: string, data: ArrayBuffer): Promise<string> {
  const ext = extensionOf(filename);
  let raw: string;

  if (ext === ".pdf") {
    const pdf = await getDocumentProxy(new Uint8Array(data));
    const { text } = await extractPdfText(pdf, { mergePages: false });
    raw = text.join("\n");
  } else if (ext === ".docx") {
    const { value } = await mammoth.extractRawText({ buffer: Buffer.from(data) });
    raw = value;
  } else if (ext === ".txt") {
    raw = new TextDecoder("utf-8").decode(data);
  } else {
    throw new UnsupportedFileError(`Unsupported file type: ${ext}`);
  }

  return cleanText(raw);
}
