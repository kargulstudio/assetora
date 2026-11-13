import type { CSSProperties, ReactNode } from "react"
import { cn } from "@/lib/utils"
import { ASSET } from "@/lib/data"

/** Exact Figma SVG asset at its native size (14px unless told otherwise). */
export function FigmaImg({
  name,
  size = 14,
  width,
  height,
  className,
  alt = "",
  style,
}: {
  name: string
  size?: number
  width?: number
  height?: number
  className?: string
  alt?: string
  style?: CSSProperties
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={ASSET(name)}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      width={width ?? size}
      height={height ?? size}
      draggable={false}
      className={cn("block max-w-none shrink-0 select-none", className)}
      style={style}
    />
  )
}

/** Figma icon tinted via mask → follows `color` (used where state changes the tint). */
export function MaskIcon({ name, size = 14, className }: { name: string; size?: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("as-mask", className)}
      style={{ width: size, height: size, "--as-icon": `url(${ASSET(name)})` } as CSSProperties}
    />
  )
}

/** Avatar [1.0] — coloured 16px circle with the white silhouette asset. */
export function PersonAvatar({ color }: { color: string }) {
  return (
    <span className="relative size-4 shrink-0 overflow-hidden rounded-full" style={{ background: color }}>
      <FigmaImg name="avatar.svg" size={16} className="absolute inset-0" />
    </span>
  )
}

/** Coloured chip with white edge + inner glow (KPI icon tiles, legend swatches). */
export function ColorChip({
  color,
  className,
  children,
}: {
  color: string
  className?: string
  children?: ReactNode
}) {
  return (
    <span
      aria-hidden
      className={cn("as-chip inline-flex shrink-0 items-center justify-center overflow-hidden", className)}
      style={{ "--as-chip-color": color } as CSSProperties}
    >
      {children}
    </span>
  )
}

/** 1×12 vertical rule between header controls. */
export function VRule({ className }: { className?: string }) {
  return <span aria-hidden className={cn("h-3 w-px shrink-0 bg-(--as-line)", className)} />
}

/** Shared look of every white Figma control (search, Annually, States, Date range…). */
export const controlClass = cn(
  "inline-flex h-[30px] shrink-0 cursor-pointer items-center gap-1 rounded-lg bg-white p-2 text-sm leading-none font-medium text-(--as-muted) shadow-(--as-shadow-control) outline-none select-none",
  "transition-[background-color,box-shadow,color] duration-[120ms] ease-[cubic-bezier(0.23,1,0.32,1)]",
  "[@media(hover:hover)]:hover:bg-(--as-sunken) active:bg-[#f5f5f5] data-popup-open:bg-(--as-sunken)",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(16,103,255,0.45)]"
)

/** Popup surface shared by menus/popovers on this route. */
export const popupClass =
  "as-popup rounded-xl bg-white p-1 text-sm text-(--as-ink) shadow-[0px_8px_24px_-4px_rgba(9,9,11,0.12),0px_2px_4px_0px_rgba(9,9,11,0.06),0px_0px_0px_1px_#ececec] ring-0"

export const menuItemClass =
  "cursor-pointer rounded-md px-2 py-1.5 text-sm font-medium text-(--as-muted) focus:bg-(--as-sunken) focus:text-(--as-ink)"
