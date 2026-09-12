/* global chrome */

const blockedSite =
  document.querySelector("#blocked-site");
const attemptCount =
  document.querySelector("#attempt-count");
const dashboardButton =
  document.querySelector("#dashboard-button");
const disableButton =
  document.querySelector("#disable-button");
const statusMessage =
  document.querySelector("#status-message");

function getBlockedHostname() {
  const parameters = new URLSearchParams(
    window.location.search,
  );

  const hostname = parameters.get("site") ?? "";

  return /^[a-z0-9.-]+$/i.test(hostname)
    ? hostname
    : "this website";
}

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

async function initializeBlockedPage() {
  const hostname = getBlockedHostname();

  blockedSite.textContent = hostname;

  try {
    const response = await sendExtensionMessage({
      type: "RECORD_BLOCK",
      hostname,
    });

    attemptCount.textContent =
      response.blockedAttempts.toString();
  } catch (error) {
    attemptCount.textContent = "?";
    statusMessage.textContent =
      error instanceof Error
        ? error.message
        : "Could not record the blocked attempt.";
  }
}

dashboardButton.addEventListener("click", () => {
  window.location.assign("http://localhost:3000");
});

disableButton.addEventListener("click", async () => {
  const shouldDisable = window.confirm(
    "End the current Focus Lock session?",
  );

  if (!shouldDisable) {
    return;
  }

  disableButton.disabled = true;
  statusMessage.textContent = "Ending Focus Lock...";

  try {
    await sendExtensionMessage({
      type: "SET_ENABLED",
      enabled: false,
    });

    const hostname = getBlockedHostname();

    if (hostname !== "this website") {
      window.location.assign(`https://${hostname}`);
    } else {
      window.location.assign("http://localhost:3000");
    }
  } catch (error) {
    disableButton.disabled = false;
    statusMessage.textContent =
      error instanceof Error
        ? error.message
        : "Could not disable Focus Lock.";
  }
});

initializeBlockedPage();