(function () {
  "use strict";

  const form = document.getElementById("chat-form");
  const input = document.getElementById("message-input");
  const messages = document.getElementById("messages");
  const intro = document.getElementById("intro");

  function formatResult(value) {
    if (Object.is(value, -0)) return "0";
    return new Intl.NumberFormat(undefined, { maximumSignificantDigits: 12 }).format(value);
  }

  function addMessage(text, kind) {
    const row = document.createElement("div");
    row.className = `message-row ${kind}`;

    if (kind === "answer") {
      const avatar = document.createElement("span");
      avatar.className = "answer-mark";
      avatar.setAttribute("aria-hidden", "true");
      avatar.textContent = "∑";
      row.appendChild(avatar);
    }

    const bubble = document.createElement("div");
    bubble.className = "message-bubble";
    bubble.textContent = text;
    row.appendChild(bubble);
    messages.appendChild(row);
    row.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function submitExpression(expression) {
    const cleaned = expression.trim();
    if (!cleaned) return;
    intro.hidden = true;
    addMessage(cleaned, "user");
    try {
      const result = window.SumwiseCalculator.calculate(cleaned.replace(/\bof\b/gi, "*"));
      addMessage(`${cleaned} = ${formatResult(result)}`, "answer");
    } catch (error) {
      addMessage(error.message, "answer error");
    }
    input.value = "";
    input.focus();
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    submitExpression(input.value);
  });

  document.querySelectorAll(".suggestion").forEach(function (button) {
    button.addEventListener("click", function () {
      submitExpression(button.dataset.expression);
    });
  });

  document.getElementById("clear-chat").addEventListener("click", function () {
    messages.replaceChildren();
    intro.hidden = false;
    input.value = "";
    input.focus();
  });
})();