"use client"

import { useMemo, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react"
import { Switch as SwitchPrimitive } from "@base-ui/react/switch"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  MONTHS,
  PERIODS,
  PREV_YEAR,
  SOLD_PREV_YEAR,
  SOLD_THIS_YEAR,
  THIS_YEAR,
  type Period,
} from "@/lib/data"
import { ColorChip, FigmaImg, VRule, controlClass, menuItemClass, popupClass } from "./primitives"

const EASE = "ease-[cubic-bezier(0.23,1,0.32,1)]"
const CHART_H = 256

/** Figma 1:273 — "Selling report": legend, period menu, compare toggle, area chart. */
export function SellingReport() {
  const [period, setPeriod] = useState<Period>("annually")
  const [compare, setCompare] = useState(true)
  const [hover, setHover] = useState<{ index: number; x: number } | null>(null)

  const months = PERIODS.find((p) => p.id === period)!.months
  const start = MONTHS.length - months
  const visible = useMemo(() => MONTHS.map((_, i) => i).slice(start), [start])

  // Highlights are data-driven: weakest month (red) and strongest month (green) in view.
  const { low, high } = useMemo(() => {
    let lo = visible[0]
    let hi = visible[0]
    for (const i of visible) {
      if (SOLD_THIS_YEAR[i] < SOLD_THIS_YEAR[lo]) lo = i
      if (SOLD_THIS_YEAR[i] > SOLD_THIS_YEAR[hi]) hi = i
    }
    return { low: lo, high: hi }
  }, [visible])

  const colPct = 100 / months
  const leftPct = (i: number) => (i - start) * colPct

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.min(Math.max(e.clientX - rect.left, 0), rect.width - 1)
    const index = start + Math.floor((x / rect.width) * months)
    setHover({ index, x: (x / rect.width) * 100 })
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") {
      if (e.key === "Escape") setHover(null)
      return
    }
    e.preventDefault()
    const current = hover?.index ?? (e.key === "ArrowRight" ? start - 1 : MONTHS.length)
    const next = Math.min(Math.max(current + (e.key === "ArrowRight" ? 1 : -1), start), MONTHS.length - 1)
    setHover({ index: next, x: leftPct(next) + colPct / 2 })
  }

  const labelled = new Set([low, high])
  if (hover) labelled.add(hover.index)

  return (
    <section aria-labelledby="as-selling-report" className="flex flex-col gap-6 border-b border-(--as-line) bg-white px-4 py-5">
      {/* Header — 1:293 */}
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="as-selling-report" className="text-base leading-[1.4] font-semibold tracking-[-0.32px] whitespace-nowrap text-(--as-ink)">
          Selling report
        </h2>
        <div className="flex min-w-0 flex-1 items-center justify-center gap-4">
          <span className="flex items-center gap-1.5 text-sm leading-none font-medium tracking-[-0.28px] whitespace-nowrap text-(--as-muted)">
            <ColorChip color="var(--as-blue)" className="size-2.5 rounded-[3px]" />
            This year
          </span>
          <button
            type="button"
            onClick={() => setCompare((v) => !v)}
            aria-pressed={compare}
            className={cn(
              "flex cursor-pointer items-center gap-1.5 rounded text-sm leading-none font-medium tracking-[-0.28px] whitespace-nowrap text-(--as-muted) outline-none",
              "transition-opacity duration-200",
              EASE,
              !compare && "opacity-45",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(16,103,255,0.45)]"
            )}
          >
            <ColorChip color="var(--as-orange)" className="size-2.5 rounded-[3px]" />
            Previous year
          </button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger render={<button type="button" className={controlClass} aria-label="Report period" />}>
            <FigmaImg name="calendar.svg" />
            <span className="px-[2px] tracking-[-0.28px] whitespace-nowrap">{PERIODS.find((p) => p.id === period)!.label}</span>
            <FigmaImg name="chevron-selector-vertical.svg" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={6} className={cn(popupClass, "w-44")}>
            <DropdownMenuRadioGroup value={period} onValueChange={(v) => setPeriod(v as Period)}>
              {PERIODS.map((p) => (
                <DropdownMenuRadioItem key={p.id} value={p.id} className={menuItemClass}>
                  {p.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <VRule />

        <label className="flex cursor-pointer items-center gap-1.5 py-[5px]">
          <span className="px-[2px] text-sm leading-none font-medium tracking-[-0.28px] whitespace-nowrap text-(--as-muted)">
            Compare to previous period
          </span>
          <FigmaToggle checked={compare} onCheckedChange={setCompare} />
        </label>
      </div>

      {/* Chart — 1:319 */}
      <div className="flex flex-col gap-[15px]">
        <div
          role="img"
          tabIndex={0}
          aria-label={`Units sold per month, ${THIS_YEAR}${compare ? ` vs ${PREV_YEAR}` : ""}. Use arrow keys to inspect months.`}
          onPointerMove={onPointerMove}
          onPointerLeave={() => setHover(null)}
          onKeyDown={onKeyDown}
          onBlur={() => setHover(null)}
          className="relative w-full cursor-crosshair touch-pan-y outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[rgba(16,103,255,0.45)]"
          style={{ height: CHART_H }}
        >
          {/* vertical dashed grid (1:321) */}
          <FigmaImg name="chart-grid.svg" width={1149} height={256} className="pointer-events-none absolute inset-0 h-full w-full" />
          {/* horizontal dashed grid, every 64px (1:342–1:346) */}
          {[0, 64, 128, 192, 256].map((y) => (
            <FigmaImg
              key={y}
              name="gridline-h.svg"
              width={1148}
              height={1}
              className="pointer-events-none absolute left-0 h-px w-full"
              style={{ top: y - 0.5 }}
            />
          ))}

          {/* Series (1:347). Figma flips "This year" horizontally; zoom = scale from the right edge. */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div
              className={cn("absolute inset-0 origin-right transition-transform duration-300", EASE)}
              style={{ transform: `scaleX(${MONTHS.length / months})` }}
            >
              <FigmaImg
                name="series-this-area.svg"
                width={1148}
                height={216}
                className="absolute left-0 w-full -scale-x-100"
                style={{ top: 20, height: 216 }}
              />
              <FigmaImg
                name="series-this-line.svg"
                width={1149}
                height={129}
                className="absolute left-0 -scale-x-100"
                style={{ top: 19.5, height: 128.774, width: `${(1148.89 / 1148) * 100}%` }}
              />
              <FigmaImg
                name="series-prev-line.svg"
                width={1149}
                height={95}
                className={cn("absolute left-0 transition-opacity duration-200", EASE, !compare && "opacity-0")}
                style={{ top: 115.5, height: 95, width: `${(1148.58 / 1148) * 100}%` }}
              />
            </div>
          </div>

          {/* Column bands (1:351 / 1:352) + hover band */}
          {visible.map((i) => {
            const tone =
              i === low ? "bg-[rgba(241,76,67,0.1)]" : i === high ? "bg-[rgba(70,195,89,0.1)]" : hover?.index === i ? "bg-[rgba(9,9,11,0.035)]" : ""
            if (!tone) return null
            return (
              <div
                key={`band-${i}`}
                aria-hidden
                className={cn("pointer-events-none absolute top-0 h-full", tone)}
                style={{ left: `${leftPct(i)}%`, width: `${colPct}%` }}
              />
            )
          })}

          {/* Crosshair */}
          {hover && (
            <div
              aria-hidden
              className="pointer-events-none absolute top-0 h-full w-px bg-[rgba(40,40,40,0.24)]"
              style={{ left: `${hover.x}%` }}
            />
          )}

          {/* "2025: 143 sold" chips (1:353–1:372) */}
          {visible
            .filter((i) => labelled.has(i))
            .map((i) => (
              <div key={`labels-${i}`} aria-hidden className="pointer-events-none">
                <ValueChip
                  year={THIS_YEAR}
                  value={SOLD_THIS_YEAR[i]}
                  color="var(--as-blue)"
                  style={{ left: `${leftPct(i) + colPct / 2}%`, top: 6 }}
                />
                {compare && (
                  <ValueChip
                    year={PREV_YEAR}
                    value={SOLD_PREV_YEAR[i]}
                    color="var(--as-orange)"
                    style={{ left: `${leftPct(i) + colPct / 2}%`, top: CHART_H - 36 }}
                  />
                )}
              </div>
            ))}
        </div>

        {/* Month axis — 1:373 */}
        <div className="flex text-center text-sm leading-none font-medium tracking-[-0.28px]">
          {visible.map((i) => (
            <p
              key={MONTHS[i]}
              className={cn(
                "min-w-0 flex-1 truncate transition-colors duration-150",
                i === low ? "text-(--as-red)" : i === high ? "text-(--as-green)" : hover?.index === i ? "text-(--as-ink)" : "text-(--as-muted)"
              )}
            >
              {MONTHS[i]}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}

function ValueChip({ year, value, color, style }: { year: number; value: number; color: string; style: CSSProperties }) {
  return (
    <div
      className="absolute flex w-[116px] -translate-x-1/2 items-center justify-center gap-1 rounded-lg bg-white p-2 text-sm leading-none font-medium tracking-[-0.28px] whitespace-nowrap shadow-(--as-shadow-control)"
      style={style}
    >
      <span className="text-(--as-muted)">{year}:</span>
      <span style={{ color }}>{value} sold</span>
    </div>
  )
}

/** Figma "Toggle" (1:315): 36×20 gradient track, 0.5px edge, skeuomorphic knob asset. */
function FigmaToggle({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (v: boolean) => void }) {
  return (
    <SwitchPrimitive.Root
      checked={checked}
      onCheckedChange={(v) => onCheckedChange(v)}
      className={cn(
        "relative h-5 w-9 shrink-0 cursor-pointer overflow-hidden rounded-[100px] border-[0.5px] outline-none",
        "shadow-[inset_0px_0px_2px_0px_rgba(21,93,245,0.14)]",
        "transition-[background-color,border-color] duration-200",
        EASE,
        "border-[#cfcfcf] bg-[linear-gradient(90deg,#ebebeb_26.389%,#e0e0e0_100%)]",
        "data-checked:border-(--as-blue) data-checked:bg-[linear-gradient(90deg,#1067ff_0%,#0059f5_100%)]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(16,103,255,0.45)]"
      )}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "absolute top-[1px] left-[1px] size-4 transition-transform duration-200 data-checked:translate-x-4",
          EASE
        )}
      >
        <FigmaImg name="toggle-knob.svg" size={40} className="absolute -top-2.5 -left-3.5 max-w-none" />
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  )
}
