"use client"

import { useEffect, useRef } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { NOTIFICATIONS } from "@/lib/data"
import { FigmaImg, VRule, controlClass, popupClass } from "./primitives"

/** Figma 1:167 — 62px bar: search (278px), Export, rule, help, bell. */
export function TopBar({
  query,
  onQuery,
  onExport,
}: {
  query: string
  onQuery: (q: string) => void
  onExport: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  // "/" focuses search from anywhere
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target
      const typing = el instanceof Element && el.closest("input, textarea, [contenteditable=true]")
      if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <header className="flex h-[63px] shrink-0 items-center justify-between gap-4 border-b border-(--as-line) bg-white p-4">
      <label
        className={cn(
          controlClass,
          "w-[278px] min-w-0 cursor-text",
          "focus-within:bg-white focus-within:shadow-[0px_1px_2px_0px_rgba(40,40,40,0.08),0px_0px_0px_1px_var(--as-blue),0px_0px_0px_4px_rgba(16,103,255,0.12)]"
        )}
      >
        <FigmaImg name="search-lg.svg" />
        <span className="flex min-w-0 flex-1 items-center px-[2px]">
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                onQuery("")
                e.currentTarget.blur()
              }
            }}
            placeholder="Search..."
            aria-label="Search selling history"
            className="w-full min-w-0 bg-transparent text-sm leading-none font-medium tracking-[-0.28px] text-(--as-ink) outline-none placeholder:text-(--as-placeholder) [&::-webkit-search-cancel-button]:hidden"
          />
        </span>
        {query && (
          <button
            type="button"
            onClick={() => {
              onQuery("")
              inputRef.current?.focus()
            }}
            className="cursor-pointer rounded px-1 text-xs leading-none text-(--as-subtle) hover:text-(--as-ink)"
            aria-label="Clear search"
          >
            Clear
          </button>
        )}
      </label>

      <div className="flex shrink-0 items-center gap-2">
        {/* Export — dark raised button (1:175) */}
        <button
          type="button"
          onClick={onExport}
          className={cn(
            "as-chip flex h-[30px] [--as-chip-color:#282828] cursor-pointer items-center justify-center gap-[3px] rounded-lg px-3 text-sm leading-none font-medium tracking-[-0.28px] text-white outline-none",
            "transition-[background-color] duration-[120ms] ease-[cubic-bezier(0.23,1,0.32,1)]",
            "[@media(hover:hover)]:hover:[--as-chip-color:#3a3a3a] active:[--as-chip-color:#1c1c1c]",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(16,103,255,0.45)]"
          )}
        >
          <FigmaImg name="upload-01.svg" />
          Export
        </button>

        <VRule />

        {/* Help (1:181) */}
        <Popover>
          <Tooltip>
            <TooltipTrigger
              render={
                <PopoverTrigger
                  render={<button type="button" aria-label="Help" className={cn(controlClass, "size-[30px] justify-center")} />}
                />
              }
            >
              <FigmaImg name="help-circle.svg" />
            </TooltipTrigger>
            <TooltipContent side="bottom" className="as-popup">Help</TooltipContent>
          </Tooltip>
          <PopoverContent align="end" sideOffset={8} className={cn(popupClass, "w-64 gap-0 p-1")}>
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
            <button
              type="button"
              onClick={() => toast("Support chat isn't part of this prototype")}
              className="w-full cursor-pointer rounded-md px-2 py-1.5 text-left text-sm font-medium text-(--as-muted) hover:bg-(--as-sunken) hover:text-(--as-ink)"
            >
              Contact support
            </button>
          </PopoverContent>
        </Popover>

        {/* Notifications (1:185) */}
        <Popover>
          <Tooltip>
            <TooltipTrigger
              render={
                <PopoverTrigger
                  render={
                    <button type="button" aria-label="Notifications" className={cn(controlClass, "size-[30px] justify-center")} />
                  }
                />
              }
            >
              <FigmaImg name="bell-02.svg" />
            </TooltipTrigger>
            <TooltipContent side="bottom" className="as-popup">Notifications</TooltipContent>
          </Tooltip>
          <PopoverContent align="end" sideOffset={8} className={cn(popupClass, "w-80 gap-0 p-1")}>
            <div className="flex items-center justify-between px-2 pt-1.5 pb-1">
              <p className="text-xs font-medium text-(--as-subtle)">Notifications</p>
              <button
                type="button"
                onClick={() => toast.success("All notifications marked as read")}
                className="cursor-pointer text-xs font-medium text-(--as-blue) hover:underline"
              >
                Mark all as read
              </button>
            </div>
            {NOTIFICATIONS.map((n) => (
              <div key={n.id} className="flex flex-col gap-1 rounded-md px-2 py-2 hover:bg-(--as-sunken)">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold text-(--as-ink)">{n.title}</span>
                  <span className="shrink-0 text-xs text-(--as-subtle)">{n.time}</span>
                </div>
                <span className="text-xs leading-snug text-(--as-muted)">{n.body}</span>
              </div>
            ))}
          </PopoverContent>
        </Popover>
      </div>
    </header>
  )
}
