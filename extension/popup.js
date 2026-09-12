/* global chrome */

const toggle = document.querySelector("#enabled-toggle");
const statusMessage =
  document.querySelector("#status-message");
const domainList = document.querySelector("#domain-list");
const attemptCount =
  document.querySelector("#attempt-count");
const resetButton =
  document.querySelector("#reset-button");
const errorMessage =
  document.querySelector("#error-message");

async function sendExtensionMessage(message) {
  const response =
    await chrome.runtime.sendMessage(message);

  if (!response?.ok) {
    throw new Error(
      response?.error ?? "Extension request failed.",
    );
  }

  return response;
}

function renderState(state) {
  toggle.checked = state.enabled;
  attemptCount.textContent =
    state.blockedAttempts.toString();

  statusMessage.textContent = state.enabled
    ? "Focus Lock is active."
    : "Focus Lock is currently off.";

  statusMessage.classList.toggle(
    "active",
    state.enabled,
  );

  domainList.replaceChildren();

  for (const domain of state.blockedDomains) {
    const item = document.createElement("li");
    item.textContent = domain;
    domainList.append(item);
  }
}

function setBusy(busy) {
  toggle.disabled = busy;
  resetButton.disabled = busy;
}

function showError(error) {
  errorMessage.hidden = false;
  errorMessage.textContent =
    error instanceof Error
      ? error.message
      : "Extension operation failed.";
}

function clearError() {
  errorMessage.hidden = true;
  errorMessage.textContent = "";
}

async function loadState() {
  clearError();
  setBusy(true);

  try {
    const response = await sendExtensionMessage({
      type: "GET_STATE",
    });

    renderState(response.state);
  } catch (error) {
    showError(error);
  } finally {
    setBusy(false);
  }
}

toggle.addEventListener("change", async () => {
  clearError();
  setBusy(true);

  try {
    const response = await sendExtensionMessage({
      type: "SET_ENABLED",
      enabled: toggle.checked,
    });

    renderState(response.state);
  } catch (error) {
    showError(error);
    await loadState();
  } finally {
    setBusy(false);
  }
});

resetButton.addEventListener("click", async () => {
  clearError();
  setBusy(true);

  try {
    await sendExtensionMessage({
      type: "RESET_ATTEMPTS",
    });

    attemptCount.textContent = "0";
  } catch (error) {
    showError(error);
  } finally {
    setBusy(false);
  }
});

loadState();