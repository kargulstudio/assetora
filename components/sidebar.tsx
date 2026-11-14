"use client"

import { useEffect, useRef, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AGENTS, DATA_MENU, MAIN_MENU, PINNED, USER, type NavItem } from "@/lib/data"
import { FigmaImg, MaskIcon, PersonAvatar, menuItemClass, popupClass } from "./primitives"

/** Geometry (rail width, toggle glide, slots) moves on the slow curve; keyboard toggles skip it. */
const MOVE = "duration-(--duration-slow) ease-out-strong group-data-instant/sb:transition-none"
/** Labels only fade, a touch faster than the geometry so they're gone before the rail narrows. */
const FADE =
  "transition-opacity duration-(--duration-fast) ease-out-strong group-data-collapsed/sb:opacity-0 group-data-instant/sb:transition-none"

type SidebarProps = {
  collapsed: boolean
  /** true when the last toggle came from the keyboard → skip the animation */
  instant: boolean
  /** ≥1024px: docked rail. Below: off-canvas drawer. */
  isDesktop: boolean
  mobileOpen: boolean
  onToggle: () => void
  onCloseMobile: () => void
  activeNav: string
  onNavigate: (item: NavItem) => void
  query: string
  onQuery: (q: string) => void
}

/**
 * Figma 1:19 — 260px rail, white, 1px #E7E7E7 right border.
 * ≥ lg it's docked and collapses to a 54px icon rail; below lg it's an off-canvas drawer.
 */
export function Sidebar({
  collapsed,
  instant,
  isDesktop,
  mobileOpen,
  onToggle,
  onCloseMobile,
  activeNav,
  onNavigate,
  query,
  onQuery,
}: SidebarProps) {
  const toggleRef = useRef<HTMLButtonElement>(null)
  // Move focus into the drawer when it opens so keyboard and screen-reader users land inside it
  useEffect(() => {
    if (mobileOpen) toggleRef.current?.focus({ preventScroll: true })
  }, [mobileOpen])

  // On the drawer, picking anything also closes it so the result is visible
  const pick = (fn: () => void) => () => {
    fn()
    if (!isDesktop) onCloseMobile()
  }

  return (
    <aside
      aria-label="Sidebar"
      data-collapsed={collapsed || undefined}
      data-instant={instant || undefined}
      data-mobile-open={mobileOpen || undefined}
      // the off-screen drawer must not be reachable by Tab / screen readers
      inert={!isDesktop && !mobileOpen}
      className={cn(
        "group/sb flex h-full shrink-0 flex-col overflow-hidden border-r border-(--as-line) bg-white",
        "w-(--as-sidebar) data-collapsed:w-(--as-sidebar-rail)",
        // < lg: off-canvas drawer on the iOS-style drawer curve
        "fixed inset-y-0 left-0 z-50 -translate-x-full data-mobile-open:translate-x-0",
        "data-mobile-open:shadow-[16px_0_48px_-8px_rgba(9,9,11,0.24)]",
        "transition-[translate,box-shadow] duration-300 ease-drawer",
        // ≥ lg: docked rail; only the width animates (collapse)
        "lg:relative lg:z-20 lg:translate-x-0 lg:shadow-none lg:transition-[width] lg:duration-(--duration-slow) lg:ease-out-strong",
        "data-instant:transition-none lg:data-instant:transition-none"
      )}
    >
      {/* Brand — 1:20. The logo always stays; only the wordmark fades. */}
      <div className="flex h-[63px] w-(--as-sidebar) shrink-0 items-center border-b border-(--as-line) p-4">
        <div className="flex items-center gap-2">
          <FigmaImg
            name="logo.svg"
            width={32}
            height={24}
            alt="Assetora"
            // nudge 5px so the 32px mark centres on the 54px rail (same axis as the nav icons)
            className={cn("transition-transform group-data-collapsed/sb:-translate-x-[5px]", MOVE)}
          />
          <span aria-hidden className={cn("text-base leading-none font-semibold tracking-[-0.32px] text-(--as-ink)", FADE)}>
            Assetora
          </span>
        </div>
      </div>

      {/*
        Sidebar toggle. One element that glides between two slots:
          expanded  → right end of the brand row   (x 214, y 16)
          collapsed → under the logo, top of nav   (x 12,  y 75)
        Only `transform` animates, in step with the rail's width.
      */}
      <div
        className={cn(
          "absolute top-0 left-0 z-20 translate-x-[214px] translate-y-4",
          "group-data-collapsed/sb:translate-x-3 group-data-collapsed/sb:translate-y-[75px]",
          "transition-transform",
          MOVE
        )}
      >
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                ref={toggleRef}
                type="button"
                onClick={isDesktop ? onToggle : onCloseMobile}
                aria-label={!isDesktop ? "Close menu" : collapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-expanded={isDesktop ? !collapsed : undefined}
                className={cn(
                  // < lg: 40px hit area around the 30px button
                  "relative after:absolute after:-inset-[5px] lg:after:hidden",
                  "flex size-[30px] cursor-pointer items-center justify-center rounded-lg bg-white shadow-(--as-shadow-control) outline-none",
                  "transition-[background-color] duration-[120ms] ease-out-strong",
                  "[@media(hover:hover)]:hover:bg-(--as-sunken) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(16,103,255,0.45)]"
                )}
              />
            }
          >
            <FigmaImg name="align-left-01.svg" className={cn("transition-transform", MOVE, collapsed && "-scale-x-100")} />
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8} className="as-popup">
            {!isDesktop ? "Close menu" : `${collapsed ? "Expand" : "Collapse"} sidebar`} · ⌘B
          </TooltipContent>
        </Tooltip>
      </div>

      <nav aria-label="Main" className="flex min-h-0 w-(--as-sidebar) flex-1 flex-col overflow-x-hidden overflow-y-auto [scrollbar-width:none]">
        {/* Main menu — 1:29. Opens a slot for the toggle when the rail is collapsed. */}
        <Section label="Main menu" toggleSlot>
          {MAIN_MENU.map((item) => (
            <NavRow
              key={item.id}
              collapsed={collapsed}
              label={item.label}
              active={activeNav === item.id}
              icon={<MaskIcon name={item.icon} />}
              onClick={pick(() => onNavigate(item))}
            />
          ))}
        </Section>

        {/* Data — 1:55 */}
        <Section label="Data">
          {DATA_MENU.map((item) => (
            <NavRow
              key={item.id}
              collapsed={collapsed}
              label={item.label}
              active={activeNav === item.id}
              icon={<MaskIcon name={item.icon} />}
              onClick={pick(() => onNavigate(item))}
            />
          ))}
        </Section>

        {/* Agents — 1:94 (click filters the selling history) */}
        <Section label="Agents">
          {AGENTS.map((a) => (
            <NavRow
              key={a.name}
              collapsed={collapsed}
              label={a.name}
              compact
              selected={query === a.name}
              icon={<PersonAvatar color={a.color} />}
              onClick={pick(() => onQuery(query === a.name ? "" : a.name))}
            />
          ))}
        </Section>

        {/* Pinned property — 1:141 */}
        <Section label="Pinned property" grow>
          {PINNED.map((p) => (
            <NavRow
              key={p.name}
              collapsed={collapsed}
              label={p.name}
              selected={query === p.query}
              icon={<FigmaImg name={p.icon} />}
              onClick={pick(() => onQuery(query === p.query ? "" : p.query))}
            />
          ))}
        </Section>
      </nav>

      {/* User — 1:156. Collapses to just the avatar. */}
      <div
        className={cn(
          "w-(--as-sidebar) shrink-0 border-b border-(--as-line) p-4 transition-[padding] group-data-collapsed/sb:px-[9px]",
          MOVE
        )}
      >
        <DropdownMenu>
          <Tooltip disabled={!collapsed}>
            <TooltipTrigger
              render={
                <DropdownMenuTrigger
                  render={
                    <button
                      type="button"
                      aria-label={`Account: ${USER.name}`}
                      className={cn(
                        "flex w-full cursor-pointer items-center gap-1 rounded-lg bg-white p-2 text-left shadow-(--as-shadow-control) outline-none",
                        "transition-[background-color,box-shadow,padding]",
                        MOVE,
                        "[@media(hover:hover)]:hover:bg-(--as-sunken) data-popup-open:bg-(--as-sunken)",
                        "group-data-collapsed/sb:p-0 group-data-collapsed/sb:shadow-none group-data-collapsed/sb:hover:bg-transparent",
                        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(16,103,255,0.45)]"
                      )}
                    />
                  }
                />
              }
            >
              <span className="flex min-w-0 flex-1 items-center gap-2.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-(--as-avatar-bg) text-sm leading-none font-medium tracking-[-0.21px] text-(--as-blue) shadow-(--as-shadow-control)">
                  {USER.initials}
                </span>
                <span className={cn("flex min-w-0 flex-col justify-center gap-[5px] leading-none font-medium whitespace-nowrap", FADE)}>
                  <span className="text-sm tracking-[-0.21px] text-(--as-ink)">{USER.name}</span>
                  <span className="text-xs tracking-[-0.12px] text-(--as-subtle)">{USER.email}</span>
                </span>
              </span>
              <FigmaImg name="chevron-selector-vertical.svg" className={FADE} />
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={10} className="as-popup">
              {USER.name}
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent side="top" align="start" sideOffset={8} className={cn(popupClass, "w-[228px]")}>
            <DropdownMenuGroup>
              <DropdownMenuLabel className="px-2 py-1.5 text-xs text-(--as-subtle)">{USER.email}</DropdownMenuLabel>
              {["Profile", "Workspace settings", "Billing"].map((l) => (
                <DropdownMenuItem key={l} className={menuItemClass}>
                  {l}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-(--as-line)" />
            <DropdownMenuItem className={menuItemClass}>
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}

function Section({
  label,
  children,
  grow,
  toggleSlot,
}: {
  label: string
  children: ReactNode
  grow?: boolean
  /** opens a 30px + 8px slot for the sidebar toggle when the rail is collapsed */
  toggleSlot?: boolean
}) {
  return (
    <div className={cn("flex flex-col border-b border-(--as-line) p-3", grow && "flex-1")}>
      {/* Heading folds away on the rail (grid-rows: height-auto collapse, no JS measuring) */}
      <div
        className={cn(
          "grid grid-rows-[1fr] transition-[grid-template-rows,opacity] group-data-collapsed/sb:grid-rows-[0fr] group-data-collapsed/sb:opacity-0",
          MOVE
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <p className="p-2 text-xs leading-none font-medium tracking-[-0.24px] whitespace-nowrap text-(--as-subtle)">{label}</p>
        </div>
      </div>
      {toggleSlot && (
        <div
          aria-hidden
          className={cn("grid grid-rows-[0fr] transition-[grid-template-rows] group-data-collapsed/sb:grid-rows-[1fr]", MOVE)}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="h-[38px]" />
          </div>
        </div>
      )}
      <ul className="flex flex-col">{children}</ul>
    </div>
  )
}

/**
 * Figma rows: px-8 py-10 gap-6 (agents: px-7 py-9 gap-5). The active "Home" row is a
 * full-bleed band (260px, px-20, gap-4, #1067FF 7%) — kept for whichever item is active.
 */
function NavRow({
  label,
  icon,
  active,
  selected,
  compact,
  collapsed,
  onClick,
}: {
  label: string
  icon: ReactNode
  active?: boolean
  selected?: boolean
  compact?: boolean
  collapsed: boolean
  onClick: () => void
}) {
  return (
    <li className="flex">
      <Tooltip disabled={!collapsed}>
        <TooltipTrigger
          render={
            <button
              type="button"
              onClick={onClick}
              aria-current={active ? "page" : undefined}
              aria-pressed={selected ?? undefined}
              aria-label={collapsed ? label : undefined}
              className={cn(
                "flex cursor-pointer items-center text-left text-sm leading-none tracking-[-0.28px] whitespace-nowrap outline-none",
                // colours answer hover fast; the 30px rail pill narrows in step with the rail
                "[transition:background-color_120ms_var(--ease-out),color_120ms_var(--ease-out),width_var(--duration-slow)_var(--ease-out)]",
                "group-data-instant/sb:[transition-property:background-color,color]",
                "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[rgba(16,103,255,0.45)]",
                active
                  ? "-mx-3 w-(--as-sidebar) gap-1 bg-(--as-nav-active) px-5 py-2.5 font-semibold max-lg:py-[13px] text-(--as-ink) [&_.as-mask]:text-(--as-blue)"
                  : cn(
                      "w-full rounded-lg font-medium text-(--as-muted) group-data-collapsed/sb:w-[30px]",
                      // < lg (drawer, touch) rows grow to 40px
                      compact ? "gap-[5px] px-[7px] py-[9px] max-lg:py-3" : "gap-1.5 px-2 py-2.5 max-lg:py-[13px]",
                      "[@media(hover:hover)]:hover:bg-(--as-nav-hover) [@media(hover:hover)]:hover:text-(--as-ink)",
                      selected && "bg-(--as-nav-active) text-(--as-ink) [@media(hover:hover)]:hover:bg-(--as-nav-active)"
                    )
              )}
            />
          }
        >
          {icon}
          <span className={cn("min-w-0 flex-1 truncate px-[2px]", FADE)}>{label}</span>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={10} className="as-popup">
          {label}
        </TooltipContent>
      </Tooltip>
    </li>
  )
}
