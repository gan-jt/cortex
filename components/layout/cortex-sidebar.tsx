"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { useCompanionSelection } from "@/hooks/use-companion-selection";

import {
  FocusIcon,
  HistoryIcon,
  HomeIcon,
  LayersIcon,
  MenuIcon,
} from "@/components/icons";

import { useFocusProfile } from "@/hooks/use-focus-profile";

const NAVIGATION_ITEMS = [
  {
    href: "/",
    label: "Dashboard",
    icon: HomeIcon,
  },
  {
    href: "/research",
    label: "Research",
    icon: LayersIcon,
  },
  {
    href: "/focus",
    label: "Focus Sessions",
    icon: FocusIcon,
  },
  {
    href: "/#approval-history",
    label: "Approval History",
    icon: HistoryIcon,
  },
];

function isNavigationActive(
  pathname: string,
  href: string,
) {
  if (href === "/") {
    return pathname === "/";
  }

  if (href.startsWith("/#")) {
    return false;
  }

  return pathname.startsWith(href);
}

export function CortexSidebar() {
  const { companion } =
    useCompanionSelection();

  const pathname = usePathname();

  const [isOpen, setIsOpen] =
    useState(false);

  const {
    profile,
    progress,
    isLoaded,
  } = useFocusProfile();

  const completedSessions =
    profile?.completedSessions ?? 0;

  return (
    <>
      <button
        aria-label="Open navigation"
        className="mobile-menu"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        <MenuIcon />
      </button>

      {isOpen && (
        <button
          aria-label="Close navigation"
          className="sidebar-scrim"
          type="button"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`sidebar ${isOpen ? "sidebar-open" : ""
          }`}
      >
        <button
          aria-label="Close navigation"
          className="mobile-close"
          type="button"
          onClick={() => setIsOpen(false)}
        >
          ×
        </button>

        <Link
          aria-label="Cortex Dashboard"
          className="brand"
          href="/"
          onClick={() => setIsOpen(false)}
        >
          <span className="brand-art">
            <Image
              priority
              alt="Cortex — Work, in the right mode"
              height={674}
              src="/cortex-brand-source.png"
              width={950}
            />
          </span>
        </Link>

        <nav
          aria-label="Primary navigation"
          className="nav-list"
        >
          {NAVIGATION_ITEMS.map((item) => {
            const Icon = item.icon;

            const isActive =
              isNavigationActive(
                pathname,
                item.href,
              );

            return (
              <Link
                aria-current={
                  isActive ? "page" : undefined
                }
                className={`nav-item ${isActive ? "active" : ""
                  }`}
                href={item.href}
                key={item.href}
                onClick={() => setIsOpen(false)}
              >
                <Icon />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-companion">
          <div
            className="sidebar-selected-companion"
            style={{
              filter: `drop-shadow(0 0 12px ${companion.glow})`,
            }}
          >
            <Image
              priority
              alt={`${companion.name} companion`}
              height={58}
              src={companion.image}
              width={58}
            />
          </div>

          <div>
            <strong>
              {isLoaded
                ? `Level ${progress.level}`
                : "Loading profile"}
            </strong>

            <span>
              {isLoaded
                ? `${progress.xpIntoLevel} / ${progress.xpForNextLevel} XP`
                : "Preparing companion"}
            </span>
          </div>
        </div>

        <div className="mini-progress">
          <span
            style={{
              width: isLoaded
                ? `${progress.levelProgressPercent}%`
                : "0%",
            }}
          />
        </div>

        <p className="sidebar-note">
          {completedSessions} focus{" "}
          {completedSessions === 1
            ? "session"
            : "sessions"}{" "}
          completed.
        </p>
      </aside>
    </>
  );
}