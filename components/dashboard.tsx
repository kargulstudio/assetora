"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { differenceInCalendarDays, isWithinInterval, parseISO, endOfDay, startOfDay } from "date-fns"
import { toast } from "sonner"
import { comingSoon } from "@/lib/prototype"
import { BREAKPOINTS, useMediaQuery } from "@/lib/use-media-query"
import { DATE_PRESETS, SALES, TODAY, type NavItem, type Sale } from "@/lib/data"
import { Sidebar } from "./sidebar"
import { TopBar } from "./top-bar"
import { Overview } from "./overview"
import { SellingReport } from "./selling-report"
import { SellingHistory, type HistoryFilters, type Sort } from "./selling-history"

const DEFAULT_FILTERS: HistoryFilters = { state: "all", preset: "all", custom: undefined }

/** Assetora — Figma ZKxOvLKOz4VYG21iEqjG4l, node 1:17 ("Property Management", 1440×1024). */
export function AssetoraDashboard() {
  const isDesktop = useMediaQuery(BREAKPOINTS.lg, true)
  // null = follow the breakpoint (rail below 1024px); a click pins the user's choice
  const [userCollapsed, setUserCollapsed] = useState<boolean | null>(null)
  const collapsed = userCollapsed ?? !isDesktop
  const toggleSidebar = useCallback(() => setUserCollapsed(!collapsed), [collapsed])

  const [activeNav, setActiveNav] = useState("home")
  const [query, setQuery] = useState("")
  const [filters, setFilters] = useState<HistoryFilters>(DEFAULT_FILTERS)
  const [sort, setSort] = useState<Sort>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault()
        toggleSidebar()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [toggleSidebar])

  const rows = useMemo(() => filterSales(SALES, query, filters, sort), [query, filters, sort])

  // Only Home is built; other screens announce themselves and Home stays active.
  const onNavigate = (item: NavItem) => {
    if (item.id === "home") setActiveNav(item.id)
    else comingSoon(item.label)
  }

  const onExport = () => {
    const header = ["Property", "Address", "State", "Sold date", "Agent", "Buyer", "Status", "Price"]
    const lines = rows.map((r) =>
      [r.property, r.address, r.state, r.soldDate, r.agent.name, r.buyer.name, r.status, String(r.price)]
        .map((v) => `"${v.replaceAll('"', '""')}"`)
        .join(",")
    )
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "assetora-selling-history.csv"
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Exported ${rows.length} ${rows.length === 1 ? "sale" : "sales"}`, {
      description: "assetora-selling-history.csv",
    })
  }

  return (
    <div className="assetora flex h-dvh w-full overflow-hidden">
      <Sidebar
        collapsed={collapsed}
        onToggle={toggleSidebar}
        activeNav={activeNav}
        onNavigate={onNavigate}
        query={query}
        onQuery={setQuery}
      />
      <div className="flex h-full min-w-0 flex-1 flex-col overflow-y-auto">
        <div className="sticky top-0 z-10">
          <TopBar query={query} onQuery={setQuery} onExport={onExport} />
        </div>
        <main className="flex flex-1 flex-col">
          <Overview />
          <SellingReport />
          <SellingHistory
            rows={rows}
            filters={filters}
            onFilters={setFilters}
            sort={sort}
            onSort={setSort}
            hasQuery={!!query}
            onReset={() => {
              setFilters(DEFAULT_FILTERS)
              setQuery("")
            }}
          />
        </main>
      </div>
    </div>
  )
}

function filterSales(sales: Sale[], query: string, filters: HistoryFilters, sort: Sort) {
  const q = query.trim().toLowerCase()
  const today = parseISO(TODAY)
  const days = DATE_PRESETS.find((p) => p.id === filters.preset)?.days ?? null

  const out = sales.filter((s) => {
    if (q) {
      const hay = [s.property, s.address, s.state, s.agent.name, s.buyer.name, s.status].join(" ").toLowerCase()
      if (!hay.includes(q)) return false
    }
    if (filters.state !== "all" && s.state !== filters.state) return false
    const sold = parseISO(s.soldDate)
    if (days !== null && differenceInCalendarDays(today, sold) > days) return false
    if (filters.custom?.from) {
      const start = startOfDay(filters.custom.from)
      const end = endOfDay(filters.custom.to ?? filters.custom.from)
      if (!isWithinInterval(sold, { start, end })) return false
    }
    return true
  })

  if (sort) {
    const dir = sort.dir === "asc" ? 1 : -1
    out.sort((a, b) => (sort.key === "price" ? a.price - b.price : a.soldDate.localeCompare(b.soldDate)) * dir)
  }
  return out
}
