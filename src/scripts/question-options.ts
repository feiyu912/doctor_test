export {};

function markAnswers(card: HTMLElement, revealed: boolean): void {
  card.querySelectorAll<HTMLElement>("[data-option-key]").forEach((option) => {
    const isCorrect = option.dataset.correct === "true";
    const isSelected = option.getAttribute("aria-pressed") === "true";
    const feedback = option.querySelector<HTMLElement>(".option-feedback");

    option.dataset.answerState = revealed
      ? isCorrect
        ? "correct"
        : isSelected
          ? "incorrect"
          : "neutral"
      : "pending";
    option.classList.toggle("is-correct", revealed && isCorrect);
    option.classList.toggle("is-wrong", revealed && isSelected && !isCorrect);

    if (feedback) {
      feedback.textContent = revealed
        ? isCorrect
          ? "\u6b63\u786e"
          : isSelected
            ? "\u9519\u8bef"
            : ""
        : "";
    }
  });
}

function clearGroup(group: HTMLElement): void {
  group.querySelectorAll<HTMLElement>("[data-option-key]").forEach((option) => {
    option.setAttribute("aria-pressed", "false");
    option.dataset.selected = "false";
  });
}

function selectOption(option: HTMLElement): void {
  const group = option.closest<HTMLElement>("[data-option-group]");
  if (!group) return;

  const isMultiple = group.dataset.inputType !== "radio";
  const isSelected = option.getAttribute("aria-pressed") === "true";

  if (!isMultiple) clearGroup(group);

  const nextSelected = isMultiple ? !isSelected : true;
  option.setAttribute("aria-pressed", String(nextSelected));
  option.dataset.selected = String(nextSelected);

  const card = option.closest<HTMLElement>("[data-question-card]");
  if (card) markAnswers(card, card.dataset.answerRevealed === "true");
}

function initExistingCards(): void {
  document.querySelectorAll<HTMLElement>("[data-question-card]").forEach((card) => {
    markAnswers(card, card.dataset.answerRevealed === "true");
  });
}

function init(): void {
  initExistingCards();

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const option = target.closest<HTMLElement>("[data-option-key]");
    if (option) {
      selectOption(option);
      return;
    }

    const clear = target.closest<HTMLElement>("[data-clear-selection]");
    if (!clear) return;

    const card = clear.closest<HTMLElement>("[data-question-card]");
    const group = card?.querySelector<HTMLElement>("[data-option-group]");
    if (!card || !group) return;

    clearGroup(group);
    markAnswers(card, card.dataset.answerRevealed === "true");
  });

  document.addEventListener("answer-panel-change", (event) => {
    const card = event.target;
    if (card instanceof HTMLElement && card.matches("[data-question-card]")) {
      markAnswers(card, card.dataset.answerRevealed === "true");
    }
  });

  window.addEventListener("answer-mode-change", () => initExistingCards());
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  init();
}
