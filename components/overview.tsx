"use client"

import { useState } from "react"
import { format, isSameYear } from "date-fns"
import type { DateRange } from "react-day-picker"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { COMPARISON_LABEL, KPIS, type Comparison, type Kpi } from "@/lib/data"
import { ColorChip, FigmaImg, controlClass, menuItemClass, popupClass } from "./primitives"

export function formatRange(range: DateRange | undefined) {
  if (!range?.from) return "Pick dates"
  const to = range.to ?? range.from
  return isSameYear(range.from, to)
    ? `${format(range.from, "MMM dd")} – ${format(to, "MMM dd, yyyy")}`
    : `${format(range.from, "MMM dd, yyyy")} – ${format(to, "MMM dd, yyyy")}`
}

/** Figma 1:189 — Overview header + 4 KPI cards. */
export function Overview() {
  const [range, setRange] = useState<DateRange | undefined>({
    from: new Date(2023, 8, 7),
    to: new Date(2023, 8, 21),
  })

  return (
    <section aria-labelledby="as-overview" className="flex flex-col gap-5 border-b border-(--as-line) bg-white px-4 py-5">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
          <h1 id="as-overview" className="text-base leading-[1.4] font-semibold tracking-[-0.32px] text-(--as-ink)">
            Overview
          </h1>
          <p className="text-sm leading-none font-medium tracking-[-0.28px] text-(--as-muted)">
            Real-time insights and activity across your properties
          </p>
        </div>
        <Popover>
          <PopoverTrigger render={<button type="button" className={controlClass} aria-label="Overview date range" />}>
            <FigmaImg name="calendar.svg" />
            <span className="px-[2px] tracking-[-0.28px] whitespace-nowrap">{formatRange(range)}</span>
          </PopoverTrigger>
          <PopoverContent align="end" sideOffset={8} className={cn(popupClass, "w-auto p-2")}>
            <Calendar
              mode="range"
              numberOfMonths={2}
              defaultMonth={range?.from}
              selected={range}
              onSelect={setRange}
              className="bg-transparent p-0 [--cell-size:--spacing(8)]"
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {KPIS.map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} />
        ))}
      </div>
    </section>
  )
}

function KpiCard({ kpi }: { kpi: Kpi }) {
  const [comparison, setComparison] = useState<Comparison>("month")
  const delta = kpi.delta[comparison]
  const deltaLabel = `${delta > 0 ? "+" : ""}${delta}%`

  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-2xl bg-white shadow-(--as-shadow-card)">
      <header className="flex items-center gap-3 border-b border-(--as-line) bg-(--as-sunken) p-4">
        <ColorChip color={kpi.color} className="size-[30px] rounded-lg">
          <FigmaImg name="cursor-click-01.svg" size={16} />
        </ColorChip>
        <h2 className="min-w-0 flex-1 truncate text-sm leading-none font-semibold tracking-[-0.28px] text-(--as-ink)">
          {kpi.title}
        </h2>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                aria-label={`${kpi.title} options`}
                className={cn(
                  "-m-1.5 flex size-[26px] cursor-pointer items-center justify-center rounded-md outline-none",
                  "transition-[background-color] duration-[120ms] ease-[cubic-bezier(0.23,1,0.32,1)]",
                  "[@media(hover:hover)]:hover:bg-[rgba(9,9,11,0.05)] data-popup-open:bg-[rgba(9,9,11,0.05)]",
                  "focus-visible:outline-2 focus-visible:outline-[rgba(16,103,255,0.45)]"
                )}
              />
            }
          >
            <FigmaImg name="dots-horizontal.svg" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={6} className={cn(popupClass, "w-48")}>
            <DropdownMenuGroup>
              <DropdownMenuLabel className="px-2 py-1.5 text-xs text-(--as-subtle)">Compare with</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={comparison} onValueChange={(v) => setComparison(v as Comparison)}>
                {(Object.keys(COMPARISON_LABEL) as Comparison[]).map((c) => (
                  <DropdownMenuRadioItem key={c} value={c} className={menuItemClass}>
                    {COMPARISON_LABEL[c].replace("vs. ", "").replace(/^./, (m) => m.toUpperCase())}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-(--as-line)" />
            <DropdownMenuItem
              className={menuItemClass}
              onClick={() => {
                navigator.clipboard?.writeText(kpi.value).catch(() => {})
                toast.success(`Copied ${kpi.value}`)
              }}
            >
              Copy value
            </DropdownMenuItem>
            <DropdownMenuItem className={menuItemClass} onClick={() => toast(`${kpi.title} details aren't part of this prototype`)}>
              View details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <div className="as-geist flex flex-col justify-center gap-2 overflow-hidden p-4 whitespace-nowrap">
        <p className="truncate text-2xl leading-[1.24] font-semibold tracking-[-0.48px] text-(--as-ink)">
          {kpi.value}
        </p>
        <p className="flex gap-1 text-sm leading-[1.24] tracking-[-0.28px]">
          <span className={cn("font-medium", delta < 0 ? "text-(--as-red)" : "text-(--as-green)")}>
            {deltaLabel}
          </span>
          <span className="truncate font-normal text-(--as-muted)">{COMPARISON_LABEL[comparison]}</span>
        </p>
      </div>
    </article>
  )
}
