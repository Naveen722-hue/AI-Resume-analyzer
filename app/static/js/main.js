const form = document.getElementById("upload-form");
if (form) {
  form.addEventListener("submit", () => {
    const btn = document.getElementById("submit-btn");
    btn.disabled = true;
    btn.textContent = "Analyzing...";
  });
}
