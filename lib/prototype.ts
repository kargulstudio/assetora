import { toast } from "sonner"

/**
 * Every control on the page does *something*. Controls that would open screens
 * that don't exist in this design prototype say so instead of doing nothing.
 */
export function comingSoon(feature: string) {
  toast(`${feature} is coming soon`, { id: "coming-soon" })
}
