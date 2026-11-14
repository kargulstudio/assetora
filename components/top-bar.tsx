"use client"

import { useEffect, useRef, useState } from "react"
import { flushSync } from "react-dom"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { NOTIFICATIONS } from "@/lib/data"
import { AdaptivePopover } from "./sheet"
import { FigmaImg, VRule, controlClass } from "./primitives"

/** 30px square control on desktop, 40px touch target on phones. */
const iconButtonClass = cn(controlClass, "size-[30px] justify-center max-md:size-10")

/**
 * Figma 1:167 — 62px bar: search (278px), Export, rule, help, bell.
 * < lg it also carries the menu button + logo (the sidebar is a drawer there);
 * < md search collapses to an icon that expands over the bar.
 */
export function TopBar({
  query,
  onQuery,
  onExport,
  onOpenMenu,
}: {
  query: string
  onQuery: (q: string) => void
  onExport: () => void
  onOpenMenu: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [mobileSearch, setMobileSearch] = useState(false)

  // "/" focuses search from anywhere
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target
      const typing = el instanceof Element && el.closest("input, textarea, [contenteditable=true]")
      if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        flushSync(() => setMobileSearch(true))
        inputRef.current?.focus()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const closeSearch = () => {
    onQuery("")
    setMobileSearch(false)
  }

  return (
    <header className="relative flex h-[63px] shrink-0 items-center justify-between gap-4 border-b border-(--as-line) bg-white p-4 max-md:gap-2 max-md:py-0">
      <div className="flex min-w-0 items-center gap-2">
        <button type="button" aria-label="Open menu" onClick={onOpenMenu} className={cn(iconButtonClass, "lg:hidden")}>
          <FigmaImg name="menu-two-lines.svg" />
        </button>
        {/* the sidebar (and its logo) is a hidden drawer below lg, so the mark lives here */}
        <FigmaImg name="logo.svg" width={32} height={24} alt="Assetora" className="mx-1 lg:hidden" />

        {/*
          One search field for every breakpoint. ≥ md it sits inline (278px);
          < md it becomes a full-width bar over the header with a Cancel action.
        */}
        <div
          className={cn(
            "items-center gap-2 md:static md:flex",
            mobileSearch ? "absolute inset-0 z-10 flex bg-white px-4" : "hidden"
          )}
        >
          <label
            className={cn(
              controlClass,
              "w-[278px] min-w-0 cursor-text max-md:h-10 max-md:flex-1",
              "focus-within:bg-white focus-within:shadow-[0px_1px_2px_0px_rgba(40,40,40,0.08),0px_0px_0px_1px_var(--as-blue),0px_0px_0px_4px_rgba(16,103,255,0.12)]"
            )}
          >
            <FigmaImg name="search-lg.svg" />
            <span className="flex min-w-0 flex-1 items-center px-[2px]">
              <input
                ref={inputRef}
                type="search"
                enterKeyHint="search"
                value={query}
                onChange={(e) => onQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    closeSearch()
                    e.currentTarget.blur()
                  }
                }}
                placeholder="Search..."
                aria-label="Search selling history"
                // 16px on phones stops iOS Safari from zooming into the field
                className="w-full min-w-0 bg-transparent text-sm leading-none font-medium tracking-[-0.28px] text-(--as-ink) outline-none placeholder:text-(--as-placeholder) max-md:text-base [&::-webkit-search-cancel-button]:hidden"
              />
            </span>
            {query && (
              <button
                type="button"
                onClick={() => {
                  onQuery("")
                  inputRef.current?.focus()
                }}
                className="cursor-pointer rounded px-1 text-xs leading-none text-(--as-subtle) hover:text-(--as-ink) max-md:-my-2 max-md:py-3"
                aria-label="Clear search"
              >
                Clear
              </button>
            )}
          </label>
          <button
            type="button"
            onClick={closeSearch}
            className="h-10 shrink-0 cursor-pointer px-1 text-sm font-medium text-(--as-blue) md:hidden"
          >
            Cancel
          </button>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {/* compact search trigger (phones) */}
        <button
          type="button"
          aria-label="Search selling history"
          aria-expanded={mobileSearch}
          onClick={() => {
            // render the field first, then focus it inside the same tap so iOS opens the keyboard
            flushSync(() => setMobileSearch(true))
            inputRef.current?.focus()
          }}
          className={cn(iconButtonClass, "relative md:hidden")}
        >
          <FigmaImg name="search-lg.svg" />
          {query && <span aria-hidden className="absolute top-2 right-2 size-1.5 rounded-full bg-(--as-blue)" />}
        </button>

        {/* Export — dark raised button (1:175); icon-only on small phones */}
        <button
          type="button"
          onClick={onExport}
          aria-label="Export CSV"
          className={cn(
            "as-chip flex h-[30px] [--as-chip-color:#282828] cursor-pointer items-center justify-center gap-[3px] rounded-lg px-3 text-sm leading-none font-medium tracking-[-0.28px] text-white outline-none",
            "transition-[background-color] duration-[120ms] ease-[cubic-bezier(0.23,1,0.32,1)]",
            "[@media(hover:hover)]:hover:[--as-chip-color:#3a3a3a] active:[--as-chip-color:#1c1c1c]",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(16,103,255,0.45)]",
            "max-md:h-10 max-sm:w-10 max-sm:px-0"
          )}
        >
          <FigmaImg name="upload-01.svg" />
          <span className="max-sm:sr-only">Export</span>
        </button>

        <VRule className="max-md:hidden" />

        {/* Help (1:181) */}
        <AdaptivePopover
          title="Help"
          tooltip="Help"
          className="w-64 gap-0 p-1"
          trigger={
            <button type="button" aria-label="Help" className={iconButtonClass}>
              <FigmaImg name="help-circle.svg" />
            </button>
          }
        >
          {(phone) => (
            <>
              {!phone && (
                <>
                  <p className="px-2 pt-1.5 pb-1 text-xs font-medium text-(--as-subtle)">Keyboard shortcuts</p>
                  {[
                    ["Focus search", "/"],
                    ["Toggle sidebar", "⌘ B"],
                    ["Clear search", "Esc"],
                  ].map(([label, key]) => (
                    <div key={label} className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm font-medium text-(--as-muted)">
                      {label}
                      <kbd className="rounded-[5px] bg-(--as-sunken) px-1.5 py-0.5 font-sans text-xs text-(--as-ink) shadow-(--as-shadow-control)">
                        {key}
                      </kbd>
                    </div>
                  ))}
                  <div className="my-1 h-px bg-(--as-line)" />
                </>
              )}
              <button
                type="button"
                className="w-full cursor-pointer rounded-md px-2 py-1.5 text-left text-sm font-medium text-(--as-muted) hover:bg-(--as-sunken) hover:text-(--as-ink) max-md:py-3"
              >
                Contact support
              </button>
            </>
          )}
        </AdaptivePopover>

        <Notifications />
      </div>
    </header>
  )
}

/** Notifications (1:185) */
function Notifications() {
  const [unread, setUnread] = useState(() => new Set(NOTIFICATIONS.map((n) => n.id)))

  const markAll = (
    <button
      type="button"
      disabled={!unread.size}
      onClick={() => {
        setUnread(new Set())
        toast.success("All notifications marked as read")
      }}
      className="cursor-pointer text-xs font-medium text-(--as-blue) hover:underline disabled:cursor-default disabled:text-(--as-subtle) disabled:no-underline max-md:-mr-2 max-md:px-2 max-md:py-3 max-md:text-sm"
    >
      Mark all as read
    </button>
  )

  return (
    <AdaptivePopover
      title="Notifications"
      tooltip="Notifications"
      className="w-80 gap-0 p-1"
      action={markAll}
      trigger={
        <button type="button" aria-label="Notifications" className={iconButtonClass}>
          <FigmaImg name="bell-02.svg" />
        </button>
      }
    >
      {(phone) => (
        <>
          {!phone && (
            <div className="flex items-center justify-between px-2 pt-1.5 pb-1">
              <p className="text-xs font-medium text-(--as-subtle)">Notifications</p>
              {markAll}
            </div>
          )}
          {NOTIFICATIONS.map((n) => (
            <div key={n.id} className="flex flex-col gap-1 rounded-md px-2 py-2 hover:bg-(--as-sunken) max-md:py-3">
              <div className="flex items-baseline justify-between gap-2">
                <span className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-(--as-ink)">
                  {unread.has(n.id) && (
                    <>
                      <span aria-hidden className="size-1.5 shrink-0 self-center rounded-full bg-(--as-blue)" />
                      <span className="sr-only">Unread:</span>
                    </>
                  )}
                  {n.title}
                </span>
                <span className="shrink-0 text-xs text-(--as-subtle)">{n.time}</span>
              </div>
              <span className="text-xs leading-snug text-(--as-muted)">{n.body}</span>
            </div>
          ))}
        </>
      )}
    </AdaptivePopover>
  )
}
