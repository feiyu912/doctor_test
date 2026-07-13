import { readStorage, writeStorage } from "../lib/storage";

type AnswerMode = "hide" | "show";

const ANSWER_MODE_KEY = "medical-question-bank:answer-mode";
const DEFAULT_MODE: AnswerMode = "hide";
const SHOW_LABEL = "\u663e\u793a\u7b54\u6848";
const HIDE_LABEL = "\u9690\u85cf\u7b54\u6848";

function isAnswerMode(value: string | null): value is AnswerMode {
  return value === "hide" || value === "show";
}

function getStoredMode(): AnswerMode | null {
  const stored = readStorage(ANSWER_MODE_KEY);
  return isAnswerMode(stored) ? stored : null;
}

function getMode(): AnswerMode {
  return getStoredMode() ?? DEFAULT_MODE;
}

function setExpanded(card: HTMLElement, expanded: boolean): void {
  const panel = card.querySelector<HTMLElement>("[data-answer-panel]");
  const toggle = card.querySelector<HTMLButtonElement>("[data-answer-toggle]");
  if (!panel) return;

  panel.hidden = !expanded;
  card.dataset.answerRevealed = expanded ? "true" : "false";
  card.classList.toggle("answers-visible", expanded);

  if (toggle) {
    toggle.setAttribute("aria-expanded", String(expanded));
    if (!toggle.getAttribute("aria-controls") && panel.id) {
      toggle.setAttribute("aria-controls", panel.id);
    }
    toggle.textContent = expanded ? HIDE_LABEL : SHOW_LABEL;
  }

  card.dispatchEvent(
    new CustomEvent("answer-panel-change", {
      bubbles: true,
      detail: { expanded }
    })
  );
}

function applyMode(mode: AnswerMode, persist: boolean): void {
  document.documentElement.dataset.answerMode = mode;
  if (persist) writeStorage(ANSWER_MODE_KEY, mode);

  document.querySelectorAll<HTMLElement>("[data-answer-mode-set]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.answerModeSet === mode));
  });

  document.querySelectorAll<HTMLElement>("[data-question-card]").forEach((card) => {
    setExpanded(card, mode === "show");
  });

  window.dispatchEvent(new CustomEvent("answer-mode-change", { detail: { mode } }));
}

function openPreferenceDialog(dialog: HTMLDialogElement): void {
  const input = dialog.querySelector<HTMLInputElement>(`input[name="answerMode"][value="${getMode()}"]`);
  if (input) input.checked = true;

  if (typeof dialog.showModal === "function") {
    dialog.showModal();
  } else {
    dialog.setAttribute("open", "");
  }
}

function readDialogMode(dialog: HTMLDialogElement): AnswerMode {
  const selectedMode = dialog.querySelector<HTMLInputElement>('input[name="answerMode"]:checked')?.value ?? null;
  return isAnswerMode(selectedMode) ? selectedMode : DEFAULT_MODE;
}

function initPreferenceDialog(): void {
  const dialog = document.querySelector<HTMLDialogElement>("[data-answer-preference-dialog]");
  if (!dialog || getStoredMode()) return;

  openPreferenceDialog(dialog);

  dialog.addEventListener("close", () => {
    applyMode(readDialogMode(dialog), true);
  });

  dialog.addEventListener("submit", () => {
    applyMode(readDialogMode(dialog), true);
  });
}

function initAnswerToggles(): void {
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const modeButton = target.closest<HTMLElement>("[data-answer-mode-set]");
    if (modeButton) {
      const mode = modeButton.dataset.answerModeSet ?? null;
      if (isAnswerMode(mode)) applyMode(mode, true);
      return;
    }

    const toggle = target.closest<HTMLButtonElement>("[data-answer-toggle]");
    if (!toggle) return;

    const card = toggle.closest<HTMLElement>("[data-question-card]");
    if (!card) return;

    setExpanded(card, toggle.getAttribute("aria-expanded") !== "true");
  });
}

function init(): void {
  applyMode(getMode(), false);
  initAnswerToggles();
  initPreferenceDialog();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  init();
}
