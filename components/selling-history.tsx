"use client"

import Image from "next/image"
import { useState, type ReactNode } from "react"
import { format, parseISO } from "date-fns"
import type { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ASSET, DATE_PRESETS, STATES, TODAY, currency, type Sale } from "@/lib/data"
import { formatRange } from "./overview"
import { FigmaImg, PersonAvatar, controlClass, menuItemClass, popupClass } from "./primitives"

export type HistoryFilters = {
  state: string // "all" | state name
  preset: string // DATE_PRESETS id
  custom: DateRange | undefined
}

export type SortKey = "soldDate" | "price"
export type Sort = { key: SortKey; dir: "asc" | "desc" } | null

/** Figma 1:383 — "Selling history" filters + table. */
export function SellingHistory({
  rows,
  filters,
  onFilters,
  sort,
  onSort,
  hasQuery,
  onReset,
}: {
  rows: Sale[]
  filters: HistoryFilters
  onFilters: (f: HistoryFilters) => void
  sort: Sort
  onSort: (s: Sort) => void
  hasQuery: boolean
  onReset: () => void
}) {
  const [calendarOpen, setCalendarOpen] = useState(false)
  const presetLabel = DATE_PRESETS.find((p) => p.id === filters.preset)?.label
  const filtered = filters.state !== "all" || filters.preset !== "all" || !!filters.custom?.from || hasQuery

  const toggleSort = (key: SortKey) => {
    if (sort?.key !== key) onSort({ key, dir: "desc" })
    else if (sort.dir === "desc") onSort({ key, dir: "asc" })
    else onSort(null)
  }

  return (
    <section
      aria-labelledby="as-selling-history"
      className="flex flex-1 flex-col gap-6 border-b border-(--as-line) bg-white px-4 py-5"
    >
      {/* Header — 1:384 */}
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="as-selling-history" className="min-w-0 flex-1 text-base leading-[1.4] font-semibold tracking-[-0.32px] text-(--as-ink)">
          Selling history
        </h2>

        {/* States */}
        <DropdownMenu>
          <DropdownMenuTrigger render={<button type="button" className={controlClass} aria-label="Filter by state" />}>
            <FigmaImg name="marker-pin-01.svg" />
            <FilterLabel active={filters.state !== "all"}>{filters.state === "all" ? "States" : filters.state}</FilterLabel>
            <FigmaImg name="chevron-selector-vertical.svg" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={6} className={cn(popupClass, "w-44")}>
            <DropdownMenuRadioGroup value={filters.state} onValueChange={(v) => onFilters({ ...filters, state: v as string })}>
              <DropdownMenuRadioItem value="all" className={menuItemClass}>
                All states
              </DropdownMenuRadioItem>
              {STATES.map((s) => (
                <DropdownMenuRadioItem key={s} value={s} className={menuItemClass}>
                  {s}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Date range — presets */}
        <DropdownMenu>
          <DropdownMenuTrigger render={<button type="button" className={controlClass} aria-label="Sold date preset" />}>
            <FigmaImg name="calendar.svg" />
            <FilterLabel active={filters.preset !== "all"}>{filters.preset === "all" ? "Date range" : presetLabel}</FilterLabel>
            <FigmaImg name="chevron-selector-vertical.svg" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={6} className={cn(popupClass, "w-44")}>
            <DropdownMenuRadioGroup
              value={filters.preset}
              onValueChange={(v) => onFilters({ ...filters, preset: v as string, custom: undefined })}
            >
              {DATE_PRESETS.map((p) => (
                <DropdownMenuRadioItem key={p.id} value={p.id} className={menuItemClass}>
                  {p.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Date range — custom calendar */}
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger render={<button type="button" className={controlClass} aria-label="Custom sold date range" />}>
            <FigmaImg name="calendar.svg" />
            <FilterLabel active={!!filters.custom?.from}>
              {filters.custom?.from ? formatRange(filters.custom) : "Date range"}
            </FilterLabel>
            <FigmaImg name="chevron-selector-vertical.svg" />
          </PopoverTrigger>
          <PopoverContent align="end" sideOffset={8} className={cn(popupClass, "w-auto gap-2 p-2")}>
            <Calendar
              mode="range"
              defaultMonth={filters.custom?.from ?? parseISO(TODAY)}
              selected={filters.custom}
              onSelect={(r) => onFilters({ ...filters, custom: r, preset: "all" })}
              className="bg-transparent p-0 [--cell-size:--spacing(8)]"
            />
            {filters.custom?.from && (
              <button
                type="button"
                onClick={() => {
                  onFilters({ ...filters, custom: undefined })
                  setCalendarOpen(false)
                }}
                className="cursor-pointer self-end rounded-md px-2 py-1 text-xs font-medium text-(--as-muted) hover:bg-(--as-sunken) hover:text-(--as-ink)"
              >
                Clear dates
              </button>
            )}
          </PopoverContent>
        </Popover>
      </div>

      {/* Table — 1:413 */}
      <Table className="min-w-[860px] table-fixed border-collapse text-sm leading-none tracking-[-0.28px]">
        <colgroup>
          <col className="w-[352px]" />
          <col />
          <col />
          <col />
          <col className="w-[132px]" />
          <col className="w-[120px]" />
        </colgroup>
        <TableHeader className="[&_tr]:border-0">
          <TableRow className="border-0 hover:bg-transparent">
            <Th>Property</Th>
            <Th>
              <SortButton label="Sold date" active={sort?.key === "soldDate" ? sort.dir : null} onClick={() => toggleSort("soldDate")} />
            </Th>
            <Th>Agents</Th>
            <Th>Buyer</Th>
            <Th>Status</Th>
            <Th className="pr-0 text-right">
              <SortButton label="Price" align="right" active={sort?.key === "price" ? sort.dir : null} onClick={() => toggleSort("price")} />
            </Th>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} className="border-b border-(--as-line) hover:bg-transparent">
              <Td>
                <div className="flex items-center gap-3">
                  <div className="relative size-12 shrink-0 rounded-lg border-2 border-white shadow-(--as-shadow-thumb)">
                    <Image
                      src={ASSET(row.image)}
                      alt=""
                      fill
                      sizes="48px"
                      className="rounded-lg object-cover"
                      style={{ objectPosition: row.focus }}
                    />
                  </div>
                  <div className="flex min-w-0 flex-col gap-2.5">
                    <span className="truncate font-semibold text-(--as-ink)">{row.property}</span>
                    <span className="truncate font-medium text-(--as-muted)">{row.address}</span>
                  </div>
                </div>
              </Td>
              <Td className="font-medium text-(--as-muted)">{format(parseISO(row.soldDate), "dd MMM yyyy")}</Td>
              <Td>
                <Person name={row.agent.name} color={row.agent.color} />
              </Td>
              <Td>
                <Person name={row.buyer.name} color={row.buyer.color} />
              </Td>
              <Td>
                <StatusPill status={row.status} />
              </Td>
              <Td className="pr-0 text-right font-semibold text-(--as-ink)">{currency(row.price)}</Td>
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow className="border-0 hover:bg-transparent">
              <TableCell colSpan={6} className="px-0 py-12 text-center whitespace-normal">
                <p className="font-medium text-(--as-ink)">No sales match your filters</p>
                <p className="mt-2 font-medium text-(--as-muted)">Try another state or date range.</p>
                {filtered && (
                  <button type="button" onClick={onReset} className={cn(controlClass, "mt-4 px-3")}>
                    Clear all filters
                  </button>
                )}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </section>
  )
}

function FilterLabel({ active, children }: { active: boolean; children: ReactNode }) {
  return <span className={cn("px-[2px] tracking-[-0.28px] whitespace-nowrap", active && "text-(--as-ink)")}>{children}</span>
}

function Th({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <TableHead className={cn("h-auto px-0 pr-3 pb-0 text-left align-middle text-sm leading-none font-medium text-(--as-muted)", className)}>
      {children}
    </TableHead>
  )
}

function Td({ children, className }: { children: ReactNode; className?: string }) {
  return <TableCell className={cn("px-0 pt-[18px] pr-3 pb-[17px] align-middle", className)}>{children}</TableCell>
}

function SortButton({
  label,
  active,
  align,
  onClick,
}: {
  label: string
  active: "asc" | "desc" | null
  align?: "right"
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Sort by ${label.toLowerCase()}`}
      className={cn(
        "relative cursor-pointer rounded leading-none font-medium outline-none hover:text-(--as-ink)",
        active && "text-(--as-ink)",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(16,103,255,0.45)]"
      )}
    >
      {label}
      {active && (
        <span aria-hidden className={cn("absolute top-0 text-[11px]", align === "right" ? "right-full mr-1" : "left-full ml-1")}>
          {active === "desc" ? "↓" : "↑"}
        </span>
      )}
    </button>
  )
}

function Person({ name, color }: { name: string; color: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <PersonAvatar color={color} />
      <span className="truncate font-medium text-(--as-muted)">{name}</span>
    </div>
  )
}

function StatusPill({ status }: { status: Sale["status"] }) {
  const done = status === "Completed"
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-[10px] border p-2 leading-none font-medium whitespace-nowrap",
        done
          ? "border-[rgba(70,195,89,0.2)] bg-[rgba(70,195,89,0.1)] text-(--as-green)"
          : "border-[rgba(255,161,0,0.24)] bg-[rgba(255,161,0,0.1)] text-[#d98500]"
      )}
    >
      {status}
    </span>
  )
}
