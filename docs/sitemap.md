# Sitemap

Human-readable map of the current pages in `justingritten.dev`, how they are reached, and where you can navigate from each page. Keep this file updated whenever routes or major navigation entries change.

## Global shell navigation

- **Portfolio shell**
  - Layout: **`GlobalLayout`** (`GlobalMenuBar` + main content + `Footer`) wraps **`/`** and **`/build`**. No sidebar on these routes.
- **SaaS shell**
  - Layout: **`SaasAppShell`** reuses **`MenuBar`**, **`Sidebar`**, and shared **`AppShell.css`** under `/saas/dashboard`, `/saas/settings/*`, etc.
- **Legacy `AppShell` component**
  - The **`AppShell.tsx`** file (full menu + sidebar + theme modal) is **not** mounted on any route today; the portfolio moved to **`GlobalLayout`**. It remains exported for tests/barrel compatibility until removed or rewired.

- **Menu bar**
  - Center: Site name (`justingritten.dev`) linking to the home/profile view.
  - Right: User/theme dropdown and quick links (e.g. GitHub, resume).

- **Sidebar**
  - Main: Primary navigation (Profile/Dashboard, SaaS, actions like Create New/Search).
  - Bottom: Settings entry and any persistent utilities.
  - Submenus: Some entries (e.g. Settings) open a secondary panel with sub-pages.

- **Footer**
  - External navigation: Resume, LinkedIn, email, and similar links out of the app.

## Route tree

The canonical source of routes is `client/src/App.tsx`. This section mirrors that file as a text-based tree showing how a guest moves through the shell.

```text
User opens justingritten.dev
└─ Global layout (GlobalMenuBar with tabs, Footer)
   ├─ Tabs in GlobalMenuBar
   │  ├─ Profile tab         → /
   │  ├─ SaaS tab            → /saas
   │  └─ Build & Activity tab→ /build
   │
   ├─ /  (Profile)
   │  ├─ Welcome & intro
   │  ├─ My Tech Wheelhouse
   │  └─ Contact card
   │
   ├─ /build  (Build & Activity)
   │  ├─ CI/CD overview widget
   │  ├─ Roadmap widget
   │  └─ Recent Activity widget
   │
   └─ /saas  (SaaS entry)
      ├─ SaaSEntry (login / continue as guest placeholder)
      │  ├─ "Log in (placeholder)"    → /saas/dashboard
      │  └─ "Continue as Guest"       → /saas/dashboard
      │
      └─ SaaS shell (SaasAppShell: SaaS MenuBar, Sidebar, Content)
         ├─ Main routes
         │  ├─ /saas/dashboard
         │  └─ /saas/settings
         │        ├─ /saas/settings/account
         │        ├─ /saas/settings/application
         │        └─ /saas/settings/client
         │
         ├─ Actions via Sidebar buttons
         │  ├─ Create New → opens Create New modal (overlay)
         │  └─ Search     → opens Search modal (overlay)
         │
         └─ Actions via SaaS MenuBar
            ├─ User menu (Guest placeholder)
            └─ Theme settings → open Theme Settings modal, persist theme
```

## Per-page navigation

### `/` – Profile

- **Primary ways to arrive**
  - Default landing route (`/` index) inside **`GlobalLayout`**.
  - Clicking the **Profile** tab in **`GlobalMenuBar`**.

- **From here, you can navigate**
  - To **`/saas`** via the **SaaS** tab in **`GlobalMenuBar`** (then through SaaS entry/shell to dashboard or settings).
  - To **`/build`** via the **Build & Activity** tab.
  - To external resources (resume, LinkedIn, email, GitHub) via header/footer links.

### `/saas/dashboard` – SaaS dashboard

- **Primary ways to arrive**
  - Sidebar SaaS/Product entry (or equivalent group under “Products”).
  - Programmatic redirects or in-page CTAs (when present) that deep-link to `/saas/dashboard`.

- **From here, you can navigate**
  - Back to `/` via the Profile/Dashboard entry in the sidebar or clicking the site name in the menu bar.
  - Into any Settings page via the Settings entry in the sidebar.
  - Out to external links via footer/menu.

### `/saas/settings/*` – SaaS settings (product)

- **Primary ways to arrive**
  - Sidebar **Settings** entry inside **`SaasAppShell`**, which takes you to `/saas/settings` → `/saas/settings/account` by default.
  - Direct deep links to `/saas/settings/account`, `/saas/settings/application`, or `/saas/settings/client`.

- **From here, you can navigate**
  - Between settings pages using the Settings submenu in the SaaS sidebar and/or tabs/links within the Settings UI.
  - Back to `/` via **GlobalMenuBar** tabs or to `/saas/dashboard` via the SaaS sidebar.
  - Out to external links via footer/menu.

## Keeping this sitemap up to date

When you add, remove, or significantly change a route or navigation entry:

1. **Update routes** in `client/src/App.tsx`.
2. **Update navigation** in `client/src/Components/AppShell/Sidebar.tsx` and related config (e.g. `sidebarConfig`).
3. **Update this document** (`docs/sitemap.md`):
   - Add, remove, or modify entries under **Route tree**.
   - Adjust the **Per-page navigation** section as needed.
4. If you introduce an entirely new module (e.g. another SaaS product), also review the `.cursor/rules/site-map.mdc` rule to ensure the conceptual module map stays in sync.

