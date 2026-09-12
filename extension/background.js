/* global chrome */

const FOCUS_END_ALARM = "cortex-focus-end";

const DEFAULT_BLOCKED_DOMAINS = [
  "youtube.com",
  "instagram.com",
  "steamcommunity.com",
  "store.steampowered.com",
];

const ALLOWED_DOMAINS = new Set(
  DEFAULT_BLOCKED_DOMAINS,
);

const STATE_KEYS = [
  "enabled",
  "blockedDomains",
  "blockedAttempts",
  "sessionId",
  "endsAt",
];

function sanitizeDomains(domains) {
  if (!Array.isArray(domains)) {
    return DEFAULT_BLOCKED_DOMAINS;
  }

  const validDomains = [
    ...new Set(
      domains.filter(
        (domain) =>
          typeof domain === "string" &&
          ALLOWED_DOMAINS.has(domain),
      ),
    ),
  ];

  return validDomains.length > 0
    ? validDomains
    : DEFAULT_BLOCKED_DOMAINS;
}

async function getState() {
  const storedState =
    await chrome.storage.local.get(STATE_KEYS);

  return {
    enabled: storedState.enabled === true,
    blockedDomains: sanitizeDomains(
      storedState.blockedDomains,
    ),
    blockedAttempts: Number.isInteger(
      storedState.blockedAttempts,
    )
      ? storedState.blockedAttempts
      : 0,
    sessionId:
      typeof storedState.sessionId === "string"
        ? storedState.sessionId
        : null,
    endsAt:
      typeof storedState.endsAt === "number"
        ? storedState.endsAt
        : null,
  };
}

function createBlockingRules(domains) {
  const blockedPageUrl =
    chrome.runtime.getURL("blocked.html");

  return domains.map((domain, index) => ({
    id: 1000 + index,
    priority: 1,
    action: {
      type: "redirect",
      redirect: {
        url: `${blockedPageUrl}?site=${encodeURIComponent(
          domain,
        )}`,
      },
    },
    condition: {
      urlFilter: `||${domain}/`,
      resourceTypes: ["main_frame"],
    },
  }));
}

async function removeBlockingRules() {
  const currentRules =
    await chrome.declarativeNetRequest.getDynamicRules();

  if (currentRules.length === 0) {
    return;
  }

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: currentRules.map((rule) => rule.id),
  });
}

async function applyBlockingRules(domains) {
  const currentRules =
    await chrome.declarativeNetRequest.getDynamicRules();

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: currentRules.map((rule) => rule.id),
    addRules: createBlockingRules(domains),
  });
}

async function updateBadge(enabled) {
  await chrome.action.setBadgeText({
    text: enabled ? "ON" : "",
  });

  if (enabled) {
    await chrome.action.setBadgeBackgroundColor({
      color: "#06b6d4",
    });
  }
}

async function scheduleEndAlarm(endsAt) {
  await chrome.alarms.clear(FOCUS_END_ALARM);

  if (
    typeof endsAt === "number" &&
    endsAt > Date.now()
  ) {
    await chrome.alarms.create(FOCUS_END_ALARM, {
      when: endsAt,
    });
  }
}

async function stopFocusLock() {
  await removeBlockingRules();
  await chrome.alarms.clear(FOCUS_END_ALARM);

  await chrome.storage.local.set({
    enabled: false,
    sessionId: null,
    endsAt: null,
  });

  await updateBadge(false);

  return getState();
}

async function setEnabled(enabled) {
  if (!enabled) {
    return stopFocusLock();
  }

  const state = await getState();

  await applyBlockingRules(state.blockedDomains);
  await chrome.storage.local.set({
    enabled: true,
  });
  await scheduleEndAlarm(state.endsAt);
  await updateBadge(true);

  return getState();
}

async function startFocusLock(message) {
  if (
    typeof message.sessionId !== "string" ||
    !message.sessionId
  ) {
    throw new Error("A valid Focus Session ID is required.");
  }

  if (
    typeof message.endsAt !== "number" ||
    message.endsAt <= Date.now()
  ) {
    throw new Error("A future Focus Session end time is required.");
  }

  const blockedDomains = sanitizeDomains(
    message.blockedDomains,
  );

  await applyBlockingRules(blockedDomains);

  const previousState = await getState();

  await chrome.storage.local.set({
    enabled: true,
    blockedDomains,
    blockedAttempts:
      message.resetAttempts === true ? 0 : previousState.blockedAttempts,
    sessionId: message.sessionId,
    endsAt: message.endsAt,
  });

  await scheduleEndAlarm(message.endsAt);
  await updateBadge(true);

  return getState();
}

async function restoreFocusLock() {
  const state = await getState();

  await chrome.storage.local.set(state);

  if (
    state.enabled &&
    state.endsAt !== null &&
    state.endsAt <= Date.now()
  ) {
    await stopFocusLock();
    return;
  }

  if (state.enabled) {
    await applyBlockingRules(state.blockedDomains);
    await scheduleEndAlarm(state.endsAt);
  } else {
    await removeBlockingRules();
    await chrome.alarms.clear(FOCUS_END_ALARM);
  }

  await updateBadge(state.enabled);
}

async function handleInternalMessage(message) {
  if (message.type === "GET_STATE") {
    return {
      ok: true,
      state: await getState(),
    };
  }

  if (message.type === "SET_ENABLED") {
    return {
      ok: true,
      state: await setEnabled(
        message.enabled === true,
      ),
    };
  }

  if (message.type === "RECORD_BLOCK") {
    const state = await getState();

    if (!state.enabled) {
      return {
        ok: true,
        blockedAttempts: state.blockedAttempts,
      };
    }

    const blockedAttempts =
      state.blockedAttempts + 1;

    await chrome.storage.local.set({
      blockedAttempts,
    });

    return {
      ok: true,
      blockedAttempts,
    };
  }

  if (message.type === "RESET_ATTEMPTS") {
    await chrome.storage.local.set({
      blockedAttempts: 0,
    });

    return {
      ok: true,
      blockedAttempts: 0,
    };
  }

  return {
    ok: false,
    error: "Unknown internal message type.",
  };
}

async function handleExternalMessage(message) {
  if (message.type === "CORTEX_GET_LOCK_STATE") {
    return {
      ok: true,
      state: await getState(),
    };
  }

  if (message.type === "CORTEX_START_FOCUS") {
    return {
      ok: true,
      state: await startFocusLock(message),
    };
  }

  if (message.type === "CORTEX_STOP_FOCUS") {
    return {
      ok: true,
      state: await stopFocusLock(),
    };
  }

  return {
    ok: false,
    error: "Unknown external message type.",
  };
}

function respondToMessage(handler, sendResponse) {
  handler()
    .then(sendResponse)
    .catch((error) => {
      sendResponse({
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Extension operation failed.",
      });
    });

  return true;
}

chrome.runtime.onInstalled.addListener(() => {
  restoreFocusLock();
});

chrome.runtime.onStartup.addListener(() => {
  restoreFocusLock();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === FOCUS_END_ALARM) {
    stopFocusLock();
  }
});

chrome.runtime.onMessage.addListener(
  (message, _sender, sendResponse) =>
    respondToMessage(
      () => handleInternalMessage(message),
      sendResponse,
    ),
);

chrome.runtime.onMessageExternal.addListener(
  (message, _sender, sendResponse) =>
    respondToMessage(
      () => handleExternalMessage(message),
      sendResponse,
    ),
);