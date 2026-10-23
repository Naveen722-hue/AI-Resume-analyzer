const $ = (id) => document.getElementById(id);

const form = $("upload-form");
const btn = $("submit-btn");
const flash = $("flash");

function showError(message) {
  flash.textContent = message;
  flash.hidden = false;
}

// fill a container with tags, or a fallback when the list is empty
function renderTags(el, items, cls, emptyText, emptyAsMuted) {
  el.replaceChildren();
  if (!items.length) {
    const empty = document.createElement(emptyAsMuted ? "p" : "span");
    if (emptyAsMuted) empty.className = "muted";
    empty.textContent = emptyText;
    el.append(empty);
    return;
  }
  for (const item of items) {
    const tag = document.createElement("span");
    tag.className = cls ? `tag ${cls}` : "tag";
    tag.textContent = item;
    el.append(tag);
  }
}

function renderResult({ filename, result }) {
  $("r-filename").textContent = filename;
  $("r-score").textContent = result.score;
  $("r-words").textContent = result.word_count;

  $("r-match-section").hidden = result.match_pct === null;
  if (result.match_pct !== null) {
    $("r-match").textContent = result.match_pct;
    renderTags($("r-matched"), result.matched_skills, "good", "none");
    renderTags($("r-missing"), result.missing_skills, "bad", "nothing 🎉");
  }

  renderTags($("r-skills"), result.skills_found, "", "No known skills detected.", true);
  renderTags($("r-sections"), result.sections_found, "", "None detected.", true);

  const tips = $("r-tips");
  tips.replaceChildren();
  for (const t of result.tips.length ? result.tips : ["Looks solid!"]) {
    const li = document.createElement("li");
    li.textContent = t;
    tips.append(li);
  }

  $("upload-view").hidden = true;
  $("result-view").hidden = false;
  window.scrollTo(0, 0);
}

async function loadFeedback(resumeText, jobText) {
  const status = $("r-ai-status");
  const out = $("r-ai");
  $("r-ai-section").hidden = false;
  out.hidden = true;
  status.hidden = false;
  status.textContent = "Generating feedback...";

  try {
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resume_text: resumeText, job_description: jobText }),
    });
    const data = await res.json();
    if (!res.ok || !data.feedback) throw new Error(data.error);
    out.textContent = data.feedback;
    out.hidden = false;
    status.hidden = true;
  } catch {
    status.textContent = "AI feedback isn't available right now. Please try again later.";
  }
}

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    flash.hidden = true;
    btn.disabled = true;
    btn.textContent = "Analyzing...";

    const formData = new FormData(form);
    const useAi = $("use-ai").checked;
    const jobText = String(formData.get("job_description") || "");

    try {
      const res = await fetch("/api/analyze", { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showError(data.error || "Something went wrong. Please try again.");
        return;
      }
      renderResult(data);
      $("r-ai-section").hidden = true;
      if (useAi) loadFeedback(data.resume_text, jobText);
    } catch {
      showError("Couldn't reach the server. Please try again.");
    } finally {
      btn.disabled = false;
      btn.textContent = "Analyze";
    }
  });
}
