"use client"

import type { ReactNode } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AGENTS, DATA_MENU, MAIN_MENU, PINNED, USER, type NavItem } from "@/lib/data"
import { FigmaImg, MaskIcon, PersonAvatar, menuItemClass, popupClass } from "./primitives"

const EASE = "duration-[250ms] ease-[cubic-bezier(0.23,1,0.32,1)]"

type SidebarProps = {
  collapsed: boolean
  onToggle: () => void
  activeNav: string
  onNavigate: (item: NavItem) => void
  query: string
  onQuery: (q: string) => void
}

/** Figma 1:19 — 260px rail, white, 1px #E7E7E7 right border. Collapses to a 54px icon rail. */
export function Sidebar({ collapsed, onToggle, activeNav, onNavigate, query, onQuery }: SidebarProps) {
  return (
    <aside
      aria-label="Sidebar"
      data-collapsed={collapsed || undefined}
      className={cn(
        "group/sb relative z-20 flex h-full shrink-0 flex-col overflow-hidden border-r border-(--as-line) bg-white",
        "w-(--as-sidebar) data-collapsed:w-(--as-sidebar-rail)",
        "transition-[width]",
        EASE
      )}
    >
      {/* Brand — 1:20 */}
      <div className="relative flex h-[63px] w-(--as-sidebar) shrink-0 items-center border-b border-(--as-line) p-4">
        <div
          className={cn(
            "flex items-center gap-2 transition-opacity group-data-collapsed/sb:pointer-events-none group-data-collapsed/sb:opacity-0",
            EASE
          )}
        >
          <FigmaImg name="logo.svg" width={32} height={24} alt="" />
          <span className="text-base leading-none font-semibold tracking-[-0.32px] text-(--as-ink)">Assetora</span>
        </div>
        {/* Toggle glides between the brand row (x 214) and the centre of the rail (x 12). */}
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                onClick={onToggle}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-expanded={!collapsed}
                className={cn(
                  "absolute top-4 left-0 flex size-[30px] cursor-pointer items-center justify-center rounded-lg bg-white shadow-(--as-shadow-control) outline-none",
                  "translate-x-[214px] group-data-collapsed/sb:translate-x-3",
                  "transition-[translate,background-color]",
                  EASE,
                  "[@media(hover:hover)]:hover:bg-(--as-sunken) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(16,103,255,0.45)]"
                )}
              />
            }
          >
            <FigmaImg
              name="align-left-01.svg"
              className={cn("transition-transform", EASE, collapsed && "-scale-x-100")}
            />
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8} className="as-popup">
            {collapsed ? "Expand" : "Collapse"} sidebar · ⌘B
          </TooltipContent>
        </Tooltip>
      </div>

      <nav aria-label="Main" className="flex min-h-0 w-(--as-sidebar) flex-1 flex-col overflow-x-hidden overflow-y-auto [scrollbar-width:none]">
        {/* Main menu — 1:29 */}
        <Section label="Main menu">
          {MAIN_MENU.map((item) => (
            <NavRow
              key={item.id}
              collapsed={collapsed}
              label={item.label}
              active={activeNav === item.id}
              icon={<MaskIcon name={item.icon} />}
              onClick={() => onNavigate(item)}
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
              onClick={() => onNavigate(item)}
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
              onClick={() => onQuery(query === a.name ? "" : a.name)}
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
              onClick={() => onQuery(query === p.query ? "" : p.query)}
            />
          ))}
        </Section>
      </nav>

      {/* User — 1:156 */}
      <div
        className={cn(
          "w-(--as-sidebar) shrink-0 border-b border-(--as-line) p-4 transition-[padding] group-data-collapsed/sb:px-[9px]",
          EASE
        )}
      >
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                aria-label={`Account: ${USER.name}`}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-1 rounded-lg bg-white p-2 text-left shadow-(--as-shadow-control) outline-none",
                  "transition-[background-color,box-shadow,padding]",
                  EASE,
                  "[@media(hover:hover)]:hover:bg-(--as-sunken) data-popup-open:bg-(--as-sunken)",
                  "group-data-collapsed/sb:p-0 group-data-collapsed/sb:shadow-none group-data-collapsed/sb:hover:bg-transparent",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(16,103,255,0.45)]"
                )}
              />
            }
          >
            <span className="flex min-w-0 flex-1 items-center gap-2.5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-(--as-avatar-bg) text-sm leading-none font-medium tracking-[-0.21px] text-(--as-blue) shadow-(--as-shadow-control)">
                {USER.initials}
              </span>
              <span className="flex min-w-0 flex-col justify-center gap-[5px] leading-none font-medium whitespace-nowrap">
                <span className="text-sm tracking-[-0.21px] text-(--as-ink)">{USER.name}</span>
                <span className="text-xs tracking-[-0.12px] text-(--as-subtle)">{USER.email}</span>
              </span>
            </span>
            <FigmaImg name="chevron-selector-vertical.svg" />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" sideOffset={8} className={cn(popupClass, "w-[228px]")}>
            <DropdownMenuLabel className="px-2 py-1.5 text-xs text-(--as-subtle)">{USER.email}</DropdownMenuLabel>
            {["Profile", "Workspace settings", "Billing"].map((l) => (
              <DropdownMenuItem key={l} className={menuItemClass} onClick={() => toast(`${l} isn't part of this prototype`)}>
                {l}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="bg-(--as-line)" />
            <DropdownMenuItem className={menuItemClass} onClick={() => toast("Signed out (not really — it's a prototype)")}>
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}

function Section({ label, children, grow }: { label: string; children: ReactNode; grow?: boolean }) {
  return (
    <div className={cn("flex flex-col border-b border-(--as-line) p-3", grow && "flex-1")}>
      <p
        className={cn(
          "p-2 text-xs leading-none font-medium tracking-[-0.24px] whitespace-nowrap text-(--as-subtle) transition-opacity group-data-collapsed/sb:opacity-0",
          EASE
        )}
      >
        {label}
      </p>
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
                "transition-[background-color,color] duration-[120ms] ease-[cubic-bezier(0.23,1,0.32,1)]",
                "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[rgba(16,103,255,0.45)]",
                active
                  ? "-mx-3 w-(--as-sidebar) gap-1 bg-(--as-nav-active) px-5 py-2.5 font-semibold text-(--as-ink) [&_.as-mask]:text-(--as-blue)"
                  : cn(
                      "w-full rounded-lg font-medium text-(--as-muted) group-data-collapsed/sb:w-[30px]",
                      compact ? "gap-[5px] px-[7px] py-[9px]" : "gap-1.5 px-2 py-2.5",
                      "[@media(hover:hover)]:hover:bg-(--as-nav-hover) [@media(hover:hover)]:hover:text-(--as-ink)",
                      selected && "bg-(--as-nav-active) text-(--as-ink) [@media(hover:hover)]:hover:bg-(--as-nav-active)"
                    )
              )}
            />
          }
        >
          {icon}
          <span
            className={cn(
              "min-w-0 flex-1 truncate px-[2px] transition-opacity group-data-collapsed/sb:opacity-0",
              EASE
            )}
          >
            {label}
          </span>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={10} className="as-popup">
          {label}
        </TooltipContent>
      </Tooltip>
    </li>
  )
}
