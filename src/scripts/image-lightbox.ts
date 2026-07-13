export {};

const SCROLL_LOCK_CLASS = "lightbox-open";

let previousOverflow = "";

function lockScroll(): void {
  previousOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  document.documentElement.classList.add(SCROLL_LOCK_CLASS);
  document.body.classList.add(SCROLL_LOCK_CLASS);
}

function unlockScroll(): void {
  document.body.style.overflow = previousOverflow;
  document.documentElement.classList.remove(SCROLL_LOCK_CLASS);
  document.body.classList.remove(SCROLL_LOCK_CLASS);
}

function closeLightbox(dialog: HTMLDialogElement): void {
  if (dialog.open && typeof dialog.close === "function") {
    dialog.close();
  } else {
    dialog.removeAttribute("open");
    unlockScroll();
  }
}

function openLightbox(dialog: HTMLDialogElement, trigger: HTMLElement): void {
  const image = dialog.querySelector<HTMLImageElement>("[data-lightbox-image]");
  const caption = dialog.querySelector<HTMLElement>("[data-lightbox-caption]");
  const source = trigger.dataset.imageSrc;
  if (!image || !source) return;

  const alt = trigger.dataset.imageAlt ?? trigger.querySelector("img")?.getAttribute("alt") ?? "";
  image.src = source;
  image.alt = alt;
  if (caption) caption.textContent = alt;

  lockScroll();
  if (typeof dialog.showModal === "function") {
    dialog.showModal();
  } else {
    dialog.setAttribute("open", "");
  }
}

function init(): void {
  const dialog = document.querySelector<HTMLDialogElement>("[data-image-lightbox]");
  if (!dialog) return;

  dialog.addEventListener("close", unlockScroll);
  dialog.addEventListener("cancel", () => unlockScroll());

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const opener = target.closest<HTMLElement>("[data-lightbox-open]");
    if (opener) {
      openLightbox(dialog, opener);
      return;
    }

    if (target.closest("[data-lightbox-close]")) {
      closeLightbox(dialog);
      return;
    }

    if (target === dialog) closeLightbox(dialog);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && dialog.open) closeLightbox(dialog);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  init();
}
