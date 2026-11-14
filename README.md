# Assetora

> [!IMPORTANT]
> **Design prototype only.** No backend, no API and no auth. Everything is mock data in `lib/`, and nothing you do is saved.

A real-estate overview dashboard: KPI cards, a "Selling report" chart comparing this year with last year, and a "Selling history" table.

Built from Figma file `ZKxOvLKOz4VYG21iEqjG4l`, node `1-17` ([open in Figma](https://www.figma.com/design/ZKxOvLKOz4VYG21iEqjG4l/Untitled?node-id=1-17)).

## Run it

```bash
pnpm install
```

```bash
pnpm dev
```

Open <http://localhost:3000>. The design is authored at **1440 × 1024**, so that viewport matches Figma 1:1.

Other scripts: `pnpm build` · `pnpm start` · `pnpm lint`

## What works

- **Sidebar** collapses to an icon rail (button or <kbd>⌘B</kbd>, which skips the animation). The logo stays, labels fade, the toggle glides under the logo and collapsed items show tooltips. Agents and pinned properties filter the table
- **Small screens**: below 1024px the sidebar is an off-canvas drawer (menu button, scrim, <kbd>Esc</kbd>). Below 768px search collapses to an icon, KPIs scroll sideways, the chart crosshair follows a finger, sales become cards, and filters, sorting and dates sit behind one **Filters** bottom sheet. Popovers and calendars open as bottom sheets
- **Search** filters the table; <kbd>/</kbd> focuses it, <kbd>Esc</kbd> clears it
- **Export** downloads a CSV of the visible rows
- **Date range** opens a two-month calendar
- **KPI menus** switch the comparison period (month, quarter, year) and copy values
- **Chart**: hover or arrow keys show a crosshair with sold counts. *Annually* switches to the last 6 months or last quarter, and the compare toggle (or legend) hides last year's line
- **Table**: filter by state or date range, sort by sold date or price, with an empty state when nothing matches
- **Notifications**: *Mark all as read* clears the unread dots
- **Not built yet**: other nav items, account menu items, KPI details and support chat do nothing

## Stack

- **Next.js 16** (App Router, React 19)
- **Tailwind CSS v4** with design tokens in `app/globals.css` (adapted from Statsnap) plus app tokens in `app/assetora.css`
- **shadcn/ui on Base UI** primitives in `components/ui`
- **lucide-react** icons; every Figma icon, logo and image is a local file in `public/figma/`

## Project layout

| Path | What it is |
| --- | --- |
| [`components/dashboard.tsx`](components/dashboard.tsx) | Page composition and shared state (search, filters, sidebar) |
| [`components/sidebar.tsx`](components/sidebar.tsx) | Collapsible sidebar: menu, data, agents, pinned properties, user card |
| [`components/top-bar.tsx`](components/top-bar.tsx) | Search, Export, help and notifications |
| [`components/overview.tsx`](components/overview.tsx) | Overview header, date range and KPI cards |
| [`components/selling-report.tsx`](components/selling-report.tsx) | Selling report chart, legend, period menu and compare toggle |
| [`components/selling-history.tsx`](components/selling-history.tsx) | Selling history table with filters and sorting |
| [`components/primitives.tsx`](components/primitives.tsx) | Small shared pieces (Figma icon, avatar, menu button) |
| [`components/sheet.tsx`](components/sheet.tsx) | Bottom sheet (Base UI Drawer) and a popover that becomes a sheet on phones |
| [`app/icon.svg`](app/icon.svg), [`app/apple-icon.tsx`](app/apple-icon.tsx) | Favicon and Apple touch icon from the logo mark |
| [`lib/data.ts`](lib/data.ts) | Mock properties, KPIs, chart series and sales |
