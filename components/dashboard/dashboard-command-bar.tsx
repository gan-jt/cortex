"use client";

import { useEffect } from "react";

import { SearchIcon } from "@/components/icons";

function focusTaskComposer() {
  const composer =
    document.querySelector<HTMLTextAreaElement>(
      "#task-description",
    );

  if (!composer) {
    return;
  }

  composer.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });

  window.setTimeout(() => {
    composer.focus({
      preventScroll: true,
    });
  }, 350);
}

export function DashboardCommandBar() {
  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      const usesShortcut =
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k";

      if (!usesShortcut) {
        return;
      }

      event.preventDefault();
      focusTaskComposer();
    }

    window.addEventListener("keydown", handleShortcut);

    return () => {
      window.removeEventListener(
        "keydown",
        handleShortcut,
      );
    };
  }, []);

  return (
    <button
      className="dashboard-command-bar"
      type="button"
      onClick={focusTaskComposer}
    >
      <SearchIcon />

      <span>Ask Cortex anything...</span>

      <kbd>
        Ctrl
        <b>K</b>
      </kbd>
    </button>
  );
}