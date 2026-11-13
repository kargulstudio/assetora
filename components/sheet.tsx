"use client"

import type { ReactElement, ReactNode } from "react"
import { Drawer } from "@base-ui/react/drawer"
import { cn } from "@/lib/utils"
import { BREAKPOINTS, useMediaQuery } from "@/lib/use-media-query"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { popupClass } from "./primitives"

/** Phones (< md) get bottom sheets, bigger touch targets and stacked layouts. SSR assumes desktop. */
export function useIsPhone() {
  return !useMediaQuery(BREAKPOINTS.md, true)
}

type SheetProps = {
  title: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** element rendered as the trigger (Base UI `render` prop) */
  trigger?: ReactElement
  /** pinned under the scrolling content (e.g. Clear / Done) */
  footer?: ReactNode
  /** extra control at the right of the title row */
  action?: ReactNode
  children: ReactNode
}

/**
 * Bottom sheet (Base UI Drawer): slides up on the drawer curve, swipe down / Esc /
 * backdrop tap to dismiss. Used on phones where a floating popover would be cramped.
 */
export function BottomSheet({ title, open, onOpenChange, trigger, footer, action, children }: SheetProps) {
  return (
    <Drawer.Root open={open} onOpenChange={(o) => onOpenChange?.(o)}>
      {trigger && <Drawer.Trigger render={trigger} />}
      <Drawer.Portal>
        <Drawer.Backdrop
          className={cn(
            "fixed inset-0 z-[60] min-h-dvh bg-(--bg-overlay)",
            "opacity-[calc(1-var(--drawer-swipe-progress))] transition-opacity duration-[400ms] ease-drawer",
            "data-swiping:duration-0 data-starting-style:opacity-0 data-ending-style:opacity-0"
          )}
        />
        <Drawer.Viewport className="fixed inset-0 z-[60] flex items-end justify-center">
          <Drawer.Popup
            className={cn(
              "as-popup flex max-h-[85dvh] w-full flex-col rounded-t-2xl bg-white text-sm text-(--as-ink) outline-none",
              "shadow-[0px_-8px_32px_-8px_rgba(9,9,11,0.18),0px_0px_0px_1px_#ececec]",
              "[transform:translateY(var(--drawer-swipe-movement-y))] transition-transform duration-[400ms] ease-drawer",
              "data-swiping:select-none data-starting-style:[transform:translateY(100%)] data-ending-style:[transform:translateY(100%)]",
              "data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)]"
            )}
          >
            <div aria-hidden className="mx-auto mt-2 h-1 w-9 shrink-0 rounded-full bg-[#dcdcdc]" />
            <div className="flex shrink-0 items-center justify-between gap-3 px-4 pt-2 pb-1">
              <Drawer.Title className="text-base leading-10 font-semibold tracking-[-0.32px] text-(--as-ink)">{title}</Drawer.Title>
              {action}
            </div>
            <Drawer.Content className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-[calc(12px+env(safe-area-inset-bottom,0px))]">
              {children}
            </Drawer.Content>
            {footer && (
              <div className="flex shrink-0 gap-2 border-t border-(--as-line) px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))]">
                {footer}
              </div>
            )}
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

/** Closes the nearest bottom sheet (use inside BottomSheet children/footer). */
export const SheetClose = Drawer.Close

/**
 * A popover on desktop, a bottom sheet on phones — same trigger, same content.
 * `children` may be a function of `phone` when the content needs to adapt (e.g. calendar months).
 */
export function AdaptivePopover({
  title,
  trigger,
  tooltip,
  open,
  onOpenChange,
  align = "end",
  className,
  action,
  children,
}: {
  title: string
  trigger: ReactElement
  tooltip?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  align?: "start" | "center" | "end"
  /** popover surface classes (desktop) */
  className?: string
  /** sheet title-row action (phones) */
  action?: ReactNode
  children: ReactNode | ((phone: boolean) => ReactNode)
}) {
  const phone = useIsPhone()
  const content = typeof children === "function" ? children(phone) : children

  if (phone) {
    return (
      <BottomSheet title={title} open={open} onOpenChange={onOpenChange} trigger={trigger} action={action}>
        {content}
      </BottomSheet>
    )
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      {tooltip ? (
        <Tooltip>
          <TooltipTrigger render={<PopoverTrigger render={trigger} />} />
          <TooltipContent side="bottom" className="as-popup">
            {tooltip}
          </TooltipContent>
        </Tooltip>
      ) : (
        <PopoverTrigger render={trigger} />
      )}
      <PopoverContent align={align} sideOffset={8} className={cn(popupClass, className)}>
        {content}
      </PopoverContent>
    </Popover>
  )
}
