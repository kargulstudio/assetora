/**
 * Assetora mock data. Values that are visible in the Figma frame (node 1:17)
 * are kept 1:1; everything else is plausible filler for the prototype.
 */

export const ASSET = (name: string) => `/figma/${name}`

/* ------------------------------------------------------------------ Nav */

export type NavItem = { id: string; label: string; icon: string }

export const MAIN_MENU: NavItem[] = [
  { id: "home", label: "Home", icon: "home-02.svg" },
  { id: "payments", label: "Payments", icon: "credit-card-02.svg" },
  { id: "maintenance", label: "Maintenance", icon: "tool-01.svg" },
  { id: "inbox", label: "Inbox", icon: "mail-02.svg" },
]

export const DATA_MENU: NavItem[] = [
  { id: "properties", label: "Properties", icon: "building-07.svg" },
  { id: "tenants", label: "Tenants", icon: "building-02.svg" },
  { id: "transactions", label: "Transactions", icon: "credit-card-refresh.svg" },
  { id: "finance", label: "Finance", icon: "currency-dollar-circle.svg" },
  { id: "commissions", label: "Commissions", icon: "bank-note-01.svg" },
  { id: "report", label: "Report", icon: "bar-chart-11.svg" },
]

export type Person = { name: string; color: string }

export const AGENTS: Person[] = [
  { name: "Jonathan Hubner", color: "#46c359" },
  { name: "Benito Alvarez", color: "#ec3672" },
  { name: "Bella Hartono", color: "#1067ff" },
  { name: "Sean Vendy", color: "#ffa100" },
]

export const PINNED: { name: string; icon: string; query: string }[] = [
  { name: "Green Lake Apartment", icon: "emoji-office.svg", query: "Green Lake" },
  { name: "Oakwood Tower", icon: "emoji-office.svg", query: "Oakwood Tower" },
  { name: "Sunset Valley Residence", icon: "emoji-house.svg", query: "Sunset Valley" },
]

export const USER = { initials: "AS", name: "Andrew Smith", email: "andrew@example.com" }

/* ------------------------------------------------------------------ KPIs */

export type Comparison = "month" | "quarter" | "year"

export const COMPARISON_LABEL: Record<Comparison, string> = {
  month: "vs. last month",
  quarter: "vs. last quarter",
  year: "vs. last year",
}

export type Kpi = {
  id: string
  title: string
  value: string
  color: string
  delta: Record<Comparison, number>
}

export const KPIS: Kpi[] = [
  { id: "properties", title: "Total properties", value: "284", color: "#1067ff", delta: { month: -5.2, quarter: 3.1, year: 12.4 } },
  { id: "tenants", title: "Total tenants", value: "213", color: "#ffa100", delta: { month: 4.4, quarter: 6.8, year: 18.2 } },
  { id: "rental", title: "Total rental income", value: "$159,746.39", color: "#ec3672", delta: { month: -5.2, quarter: -1.4, year: 9.7 } },
  { id: "revenue", title: "Total revenue", value: "$200,642.28", color: "#46c359", delta: { month: -2, quarter: 2.6, year: 14.1 } },
]

/* ------------------------------------------------------------------ Selling report */

export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "Aug", "Sep"]

/** Units sold per month. Mar (min) and Aug (max) match the Figma labels. */
export const SOLD_THIS_YEAR = [168, 152, 143, 196, 221, 248, 263, 315, 289]
export const SOLD_PREV_YEAR = [141, 136, 132, 158, 149, 137, 130, 127, 122]
export const THIS_YEAR = 2025
export const PREV_YEAR = 2024

export type Period = "annually" | "half" | "quarter"

export const PERIODS: { id: Period; label: string; months: number }[] = [
  { id: "annually", label: "Annually", months: 9 },
  { id: "half", label: "Last 6 months", months: 6 },
  { id: "quarter", label: "Last quarter", months: 3 },
]

/* ------------------------------------------------------------------ Selling history */

export type Status = "Completed" | "Pending"

export type Sale = {
  id: string
  property: string
  address: string
  state: string
  image: string
  /** object-position for the 48×48 crop (Figma crops row 1 to the right edge) */
  focus: string
  soldDate: string // ISO yyyy-mm-dd
  agent: Person
  buyer: Person
  status: Status
  price: number
}

const agent = (name: string) => AGENTS.find((a) => a.name === name)!

export const SALES: Sale[] = [
  {
    id: "s1",
    property: "Apartment Studio Type",
    address: "721 Meadowview Residences",
    state: "California",
    image: "house-1.jpg",
    focus: "98% 50%",
    soldDate: "2026-01-12",
    agent: agent("Bella Hartono"),
    buyer: { name: "Sindy Huang", color: "#757575" },
    status: "Completed",
    price: 245000,
  },
  {
    id: "s2",
    property: "Luxury Condo",
    address: "469 Oakwood Tower",
    state: "New York",
    image: "house-2.jpg",
    focus: "50% 50%",
    soldDate: "2026-01-12",
    agent: agent("Sean Vendy"),
    buyer: { name: "Mario Caesar", color: "#46c359" },
    status: "Completed",
    price: 310500,
  },
  {
    id: "s3",
    property: "Townhouse",
    address: "578 Sunset Valley Residence",
    state: "Texas",
    image: "house-3.jpg",
    focus: "50% 50%",
    soldDate: "2026-01-12",
    agent: agent("Benito Alvarez"),
    buyer: { name: "Marlo Ernesto", color: "#ffa100" },
    status: "Completed",
    price: 498000,
  },
  {
    id: "s4",
    property: "Lakeside Loft",
    address: "12 Green Lake Apartment",
    state: "Washington",
    image: "house-2.jpg",
    focus: "30% 50%",
    soldDate: "2026-01-08",
    agent: agent("Jonathan Hubner"),
    buyer: { name: "Priya Raman", color: "#ec3672" },
    status: "Pending",
    price: 289900,
  },
  {
    id: "s5",
    property: "Family Villa",
    address: "88 Sunset Valley Residence",
    state: "Texas",
    image: "house-3.jpg",
    focus: "70% 50%",
    soldDate: "2025-12-19",
    agent: agent("Benito Alvarez"),
    buyer: { name: "Tom Whitaker", color: "#1067ff" },
    status: "Completed",
    price: 612000,
  },
  {
    id: "s6",
    property: "Penthouse Suite",
    address: "1203 Oakwood Tower",
    state: "New York",
    image: "house-1.jpg",
    focus: "60% 50%",
    soldDate: "2025-12-02",
    agent: agent("Sean Vendy"),
    buyer: { name: "Grace Liu", color: "#46c359" },
    status: "Completed",
    price: 925000,
  },
  {
    id: "s7",
    property: "Garden Duplex",
    address: "34 Green Lake Apartment",
    state: "Washington",
    image: "house-3.jpg",
    focus: "30% 50%",
    soldDate: "2025-11-14",
    agent: agent("Jonathan Hubner"),
    buyer: { name: "Daniel Ortiz", color: "#ffa100" },
    status: "Pending",
    price: 356750,
  },
  {
    id: "s8",
    property: "Modern Bungalow",
    address: "9 Palm Crest Avenue",
    state: "Florida",
    image: "house-1.jpg",
    focus: "20% 50%",
    soldDate: "2025-10-27",
    agent: agent("Bella Hartono"),
    buyer: { name: "Hannah Becker", color: "#757575" },
    status: "Completed",
    price: 418300,
  },
]

export const STATES = Array.from(new Set(SALES.map((s) => s.state))).sort()

/** Fixed "today" for the mock so date presets are deterministic. */
export const TODAY = "2026-01-15"

export const DATE_PRESETS: { id: string; label: string; days: number | null }[] = [
  { id: "7", label: "Last 7 days", days: 7 },
  { id: "30", label: "Last 30 days", days: 30 },
  { id: "90", label: "Last 90 days", days: 90 },
  { id: "all", label: "All time", days: null },
]

export const NOTIFICATIONS = [
  { id: "n1", title: "Luxury Condo sold", body: "Sean Vendy closed 469 Oakwood Tower at $310,500.", time: "2h ago" },
  { id: "n2", title: "Maintenance request", body: "Green Lake Apartment · Unit 4B reported a leaking faucet.", time: "5h ago" },
  { id: "n3", title: "Rent received", body: "12 tenants paid January rent on time.", time: "Yesterday" },
]

export const currency = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
