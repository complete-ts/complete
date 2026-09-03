const FIRST_DOC_PAGE_TITLES = new Set(["Overview | Complete"]);

const KEY_MAP = new Map([
  ["ArrowLeft", navigateBackward],
  ["ArrowRight", navigateForward],
]);

main();

function main() {
  document.addEventListener("keydown", (event) => {
    // Do not do anything if we have any modifier keys pressed down.
    if (event.ctrlKey || event.shiftKey || event.altKey || event.metaKey) {
      return;
    }

    if (isEditableElementFocused()) {
      return;
    }

    const keyFunction = KEY_MAP.get(event.key);
    if (keyFunction !== undefined) {
      keyFunction();
    }
  });
}

/** @returns {boolean} */
function isEditableElementFocused() {
  const { activeElement } = document;
  return (
    activeElement instanceof HTMLElement
    && (activeElement.matches("input, textarea, [contenteditable='true']")
      || activeElement.closest("[contenteditable='true']") !== null)
  );
}

function navigateBackward() {
  if (isOnLandingPage()) {
    return;
  }

  if (isOnFirstDocPage()) {
    clickOnNavBarTitle();
    return;
  }

  clickFirstNavButton();
}

function navigateForward() {
  if (isOnLandingPage()) {
    clickOnFirstLandingPageButton();
    return;
  }

  if (isOnFirstDocPage()) {
    clickFirstNavButton();
    return;
  }

  clickSecondNavButton();
}

function isOnLandingPage() {
  return globalThis.location.pathname === "/";
}

function isOnFirstDocPage() {
  return FIRST_DOC_PAGE_TITLES.has(document.title);
}

function clickOnNavBarTitle() {
  const siteTitle = document.querySelector(".site-title");
  if (siteTitle instanceof HTMLElement) {
    siteTitle.click();
  }
}

function clickOnFirstLandingPageButton() {
  const learnMoreLink = document.querySelector("main a[href='/overview/']");
  if (learnMoreLink instanceof HTMLElement) {
    learnMoreLink.click();
  }
}

function clickFirstNavButton() {
  clickNavButton("prev");
}

function clickSecondNavButton() {
  clickNavButton("next");
}

/** @param {"next" | "prev"} direction */
function clickNavButton(direction) {
  const buttonLink = document.querySelector(
    `.pagination-links a[rel="${CSS.escape(direction)}"]`,
  );
  if (buttonLink instanceof HTMLElement) {
    buttonLink.click();
  }
}
