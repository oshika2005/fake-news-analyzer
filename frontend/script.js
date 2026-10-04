const API_URL = "http://127.0.0.1:8000/analyze";

const SAMPLES = {
  en: "BREAKING: Doctors don't want you to know this! Drinking hot water cures all diseases. Forward to 10 people!",
  hi: "ज़रूरी खबर: कल रात 12 बजे से सभी ATM बंद हो जाएंगे, अपना पैसा आज ही निकाल लो। सबको फॉरवर्ड करो!",
  hing: "Bhaiyo aaj raat 12 baje se sab ATM band ho jayenge, paisa nikal lo. Sabko forward karo, jaldi!",
  ok: "The municipal corporation has announced that water supply will be shut for maintenance on Sunday from 10 AM to 2 PM, as per the notice published on its official website.",
};

const input = document.getElementById("input");
const btn = document.getElementById("analyzeBtn");
const errorEl = document.getElementById("error");
const resultEl = document.getElementById("result");

document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    input.value = SAMPLES[chip.dataset.sample];
  });
});

btn.addEventListener("click", analyze);

async function analyze() {
  const text = input.value.trim();
  errorEl.hidden = true;

  if (text.length < 20) {
    return showError("Please paste a longer message (at least 20 characters).");
  }

  btn.disabled = true;
  btn.textContent = "Analyzing...";
  resultEl.hidden = true;

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    if (!res.ok) {
      return showError(typeof data.detail === "string" ? data.detail : "Something went wrong.");
    }
    render(data);
  } catch (err) {
    showError("Could not reach the server. Is the backend running?");
  } finally {
    btn.disabled = false;
    btn.textContent = "Analyze";
  }
}

function showError(msg) {
  errorEl.textContent = msg;
  errorEl.hidden = false;
}

function render(data) {
  const scoreEl = document.getElementById("scoreText");
  const labelEl = document.getElementById("label");
  const fill = document.getElementById("barFill");

  if (data.score === null || data.score === undefined) {
    scoreEl.textContent = "N/A";
    fill.style.width = "0%";
    fill.style.background = "var(--muted)";
    labelEl.className = "badge";
  } else {
    scoreEl.textContent = data.score + "/100";
    fill.style.width = data.score + "%";
    const color = data.score >= 70 ? "green" : data.score >= 40 ? "yellow" : "red";
    fill.style.background = `var(--${color})`;
    labelEl.className = "badge " + color;
  }
  labelEl.textContent = data.label || "Unknown";

  const claimsEl = document.getElementById("claims");
  claimsEl.innerHTML = "";
  if (!data.claims || data.claims.length === 0) {
    claimsEl.innerHTML = '<li class="muted">No specific claims found.</li>';
  } else {
    data.claims.forEach((c) => {
      const li = document.createElement("li");
      const claim = document.createElement("div");
      claim.textContent = c.claim;
      const quote = document.createElement("div");
      quote.className = "quote";
      quote.textContent = "\u201C" + c.quote + "\u201D";
      li.append(claim, quote);
      claimsEl.appendChild(li);
    });
  }

  const flagsEl = document.getElementById("flags");
  flagsEl.innerHTML = "";
  (data.red_flags || []).forEach((f) => {
    const span = document.createElement("span");
    span.className = "flag";
    span.textContent = f;
    flagsEl.appendChild(span);
  });

  document.getElementById("explanation").textContent = data.explanation || "";
  document.getElementById("modelUsed").textContent = data.model_used ? "Model: " + data.model_used : "";

  resultEl.hidden = false;
  resultEl.scrollIntoView({ behavior: "smooth" });
}
