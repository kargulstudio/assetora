"use client"

import Image from "next/image"
import { useState, type ReactNode } from "react"
import { format, parseISO } from "date-fns"
import type { DateRange } from "react-day-picker"
import { ListFilter } from "lucide-react"
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
import { BottomSheet, SheetClose } from "./sheet"

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

  const [sheetOpen, setSheetOpen] = useState(false)
  const activeCount =
    (filters.state !== "all" ? 1 : 0) + (filters.preset !== "all" || filters.custom?.from ? 1 : 0) + (sort ? 1 : 0)

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

        {/* Phones: every filter, sort and date control lives behind one button + bottom sheet */}
        <BottomSheet
          title="Filter & sort"
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          trigger={
            <button type="button" className={cn(controlClass, "md:hidden")} aria-label={`Filters${activeCount ? `, ${activeCount} active` : ""}`}>
              <ListFilter aria-hidden className="size-3.5 shrink-0" strokeWidth={1.75} />
              <span className={cn("px-[2px] tracking-[-0.28px]", activeCount > 0 && "text-(--as-ink)")}>Filters</span>
              {activeCount > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-(--as-blue) text-xs leading-none font-semibold text-white">
                  {activeCount}
                </span>
              )}
            </button>
          }
          footer={
            <>
              <button
                type="button"
                disabled={!activeCount}
                onClick={() => {
                  onFilters({ state: "all", preset: "all", custom: undefined })
                  onSort(null)
                }}
                className={cn(controlClass, "flex-1 justify-center disabled:cursor-default disabled:opacity-50")}
              >
                Clear all
              </button>
              <SheetClose
                className={cn(
                  // the sheet portals outside `.assetora`, so the dark raised look is spelled out here
                  "flex h-10 flex-1 cursor-pointer items-center justify-center rounded-lg bg-(--as-ink) text-sm font-medium text-white outline-none shadow-(--as-shadow-chip) active:bg-[#1c1c1c]",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(16,103,255,0.45)]"
                )}
              >
                Show {rows.length} {rows.length === 1 ? "sale" : "sales"}
              </SheetClose>
            </>
          }
        >
          <FilterSheetBody filters={filters} onFilters={onFilters} sort={sort} onSort={onSort} />
        </BottomSheet>

        {/* States */}
        <DropdownMenu>
          <DropdownMenuTrigger render={<button type="button" className={cn(controlClass, "max-md:hidden")} aria-label="Filter by state" />}>
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
          <DropdownMenuTrigger render={<button type="button" className={cn(controlClass, "max-md:hidden")} aria-label="Sold date preset" />}>
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
          <PopoverTrigger render={<button type="button" className={cn(controlClass, "max-md:hidden")} aria-label="Custom sold date range" />}>
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

      {/* Phones — stacked cards */}
      <ul className="-my-3 flex flex-col md:hidden">
        {rows.map((row) => (
          <SaleCard key={row.id} row={row} />
        ))}
        {rows.length === 0 && <EmptyState filtered={filtered} onReset={onReset} />}
      </ul>

      {/*
        Table — 1:413. Scrolls sideways on tablets with the property column pinned.
        The scroll container is pulled out 16px each side and padded back, so the
        thumbnails' shadows aren't clipped at its edge (the table itself doesn't move).
      */}
      <div className="max-md:hidden [&>[data-slot=table-container]]:-mx-4 [&>[data-slot=table-container]]:w-[calc(100%+2rem)] [&>[data-slot=table-container]]:px-4">
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
            <Th className={stickyCol}>Property</Th>
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
              <Td className={stickyCol}>
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
              <TableCell colSpan={6} className="p-0 whitespace-normal">
                <EmptyState filtered={filtered} onReset={onReset} />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      </div>
    </section>
  )
}

/** Below xl the table can be wider than its column, so it scrolls sideways with the property pinned. */
const stickyCol = "max-xl:sticky max-xl:left-0 max-xl:z-[1] max-xl:bg-white"

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

function EmptyState({ filtered, onReset }: { filtered: boolean; onReset: () => void }) {
  return (
    <div className="py-12 text-center">
      <p className="font-medium text-(--as-ink)">No sales match your filters</p>
      <p className="mt-2 font-medium text-(--as-muted)">Try another state or date range.</p>
      {filtered && (
        <button type="button" onClick={onReset} className={cn(controlClass, "mt-4 px-3")}>
          Clear all filters
        </button>
      )}
    </div>
  )
}

/** Phone layout of one table row: thumb, name/address, price; then date + status; then agent → buyer. */
function SaleCard({ row }: { row: Sale }) {
  return (
    <li className="flex flex-col gap-3 border-b border-(--as-line) py-4 text-sm leading-none tracking-[-0.28px] last:border-b-0">
      <div className="flex items-center gap-3">
        <div className="relative size-12 shrink-0 rounded-lg border-2 border-white shadow-(--as-shadow-thumb)">
          <Image src={ASSET(row.image)} alt="" fill sizes="48px" className="rounded-lg object-cover" style={{ objectPosition: row.focus }} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <span className="truncate font-semibold text-(--as-ink)">{row.property}</span>
          <span className="truncate font-medium text-(--as-muted)">{row.address}</span>
        </div>
        <span className="shrink-0 self-start pt-0.5 font-semibold text-(--as-ink)">{currency(row.price)}</span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="font-medium text-(--as-muted)">Sold {format(parseISO(row.soldDate), "dd MMM yyyy")}</span>
        <StatusPill status={row.status} />
      </div>
      <div className="flex min-w-0 items-center gap-2 text-xs">
        <span className="shrink-0 text-(--as-subtle)">Agent</span>
        <Person name={row.agent.name} color={row.agent.color} />
        <span className="shrink-0 text-(--as-subtle)">Buyer</span>
        <Person name={row.buyer.name} color={row.buyer.color} />
      </div>
    </li>
  )
}

const SORTS: { label: string; value: Sort }[] = [
  { label: "Default", value: null },
  { label: "Newest first", value: { key: "soldDate", dir: "desc" } },
  { label: "Oldest first", value: { key: "soldDate", dir: "asc" } },
  { label: "Price: high to low", value: { key: "price", dir: "desc" } },
  { label: "Price: low to high", value: { key: "price", dir: "asc" } },
]

/** Bottom-sheet body on phones: sort, state, sold date (preset or custom range). */
function FilterSheetBody({
  filters,
  onFilters,
  sort,
  onSort,
}: {
  filters: HistoryFilters
  onFilters: (f: HistoryFilters) => void
  sort: Sort
  onSort: (s: Sort) => void
}) {
  const sameSort = (a: Sort, b: Sort) => a?.key === b?.key && a?.dir === b?.dir
  return (
    <div className="flex flex-col gap-5 px-2 pt-2 pb-2">
      <ChipGroup label="Sort by">
        {SORTS.map((o) => (
          <Chip key={o.label} selected={sameSort(sort, o.value)} onClick={() => onSort(o.value)}>
            {o.label}
          </Chip>
        ))}
      </ChipGroup>
      <ChipGroup label="State">
        {["all", ...STATES].map((st) => (
          <Chip key={st} selected={filters.state === st} onClick={() => onFilters({ ...filters, state: st })}>
            {st === "all" ? "All states" : st}
          </Chip>
        ))}
      </ChipGroup>
      <ChipGroup label="Sold date">
        {DATE_PRESETS.map((p) => (
          <Chip
            key={p.id}
            selected={!filters.custom?.from && filters.preset === p.id}
            onClick={() => onFilters({ ...filters, preset: p.id, custom: undefined })}
          >
            {p.label}
          </Chip>
        ))}
      </ChipGroup>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-(--as-subtle)">
            Custom range{filters.custom?.from && <span className="text-(--as-ink)"> · {formatRange(filters.custom)}</span>}
          </p>
          {filters.custom?.from && (
            <button
              type="button"
              onClick={() => onFilters({ ...filters, custom: undefined })}
              className="-my-3 cursor-pointer px-2 py-3 text-xs font-medium text-(--as-blue)"
            >
              Clear dates
            </button>
          )}
        </div>
        <Calendar
          mode="range"
          defaultMonth={filters.custom?.from ?? parseISO(TODAY)}
          selected={filters.custom}
          onSelect={(r) => onFilters({ ...filters, custom: r, preset: "all" })}
          className="mx-auto bg-transparent p-0 [--cell-size:--spacing(10)]"
        />
      </div>
    </div>
  )
}

function ChipGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={label} className="flex flex-col gap-2">
      <p className="text-xs font-medium text-(--as-subtle)">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        controlClass,
        "h-10 px-3",
        selected && "bg-(--as-nav-active) text-(--as-blue) shadow-[0px_0px_0px_1px_var(--as-blue)] [@media(hover:hover)]:hover:bg-(--as-nav-active)"
      )}
    >
      {children}
    </button>
  )
}
