# Sitemap

Human-readable map of the current pages in `justingritten.dev`, how they are reached, and where you can navigate from each page. Keep this file updated whenever routes or major navigation entries change.

## Global shell navigation

- **App shell**
  - Layout: `AppShell` wraps all pages with menu bar, sidebar, and footer.
  - Behaviour: The shell is always visible; navigation is primarily via the sidebar, plus header/footer links.

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
└─ AppShell (MenuBar, Sidebar, Footer, Content)
   ├─ Initial page
   │  └─ /  (Profile dashboard)
   │     ├─ Scroll within profile sections
   │     └─ Use sidebar to jump to other areas
   │
   ├─ Navigation via Sidebar
   │  ├─ Profile/Dashboard → /
   │  ├─ SaaS → /saas/dashboard
   │  └─ Settings → /settings → /settings/account
   │        ├─ /settings/account
   │        ├─ /settings/application
   │        └─ /settings/client
   │
   ├─ Actions via Sidebar buttons
   │  ├─ Create New → opens Create New modal (overlay)
   │  └─ Search     → opens Search modal (overlay)
   │
   ├─ Actions via MenuBar
   │  ├─ Site name/logo → navigate to / (Profile)
   │  └─ Theme settings → open Theme Settings modal, persist theme
   │
   └─ External links
      ├─ From MenuBar (e.g. GitHub, resume)
      └─ From Footer (resume, LinkedIn, email, etc.)
```

## Per-page navigation

### `/` – Profile

- **Primary ways to arrive**
  - Default landing route (`/` index) inside `AppShell`.
  - Clicking the site name/logo in the menu bar.
  - Selecting the Profile/Dashboard entry in the sidebar.

- **From here, you can navigate**
  - To `/saas/dashboard` via the SaaS/Product entry in the sidebar.
  - To `/settings/account`, `/settings/application`, or `/settings/client` via the Settings entry and submenu.
  - To external resources (resume, LinkedIn, email, GitHub) via header/footer links.

### `/saas/dashboard` – SaaS dashboard

- **Primary ways to arrive**
  - Sidebar SaaS/Product entry (or equivalent group under “Products”).
  - Programmatic redirects or in-page CTAs (when present) that deep-link to `/saas/dashboard`.

- **From here, you can navigate**
  - Back to `/` via the Profile/Dashboard entry in the sidebar or clicking the site name in the menu bar.
  - Into any Settings page via the Settings entry in the sidebar.
  - Out to external links via footer/menu.

### `/settings/*` – Settings pages

- **Primary ways to arrive**
  - Sidebar Settings entry, which takes you to `/settings` → `/settings/account` by default.
  - Direct deep links to `/settings/account`, `/settings/application`, or `/settings/client`.

- **From here, you can navigate**
  - Between settings pages using:
    - The Settings submenu in the sidebar, and/or
    - Tabs/links within the Settings UI (depending on implementation).
  - Back to `/` or `/saas/dashboard` via their respective sidebar entries.
  - Out to external links via footer/menu.

## Keeping this sitemap up to date

When you add, remove, or significantly change a route or navigation entry:

1. **Update routes** in `client/src/App.tsx`.
2. **Update navigation** in `client/src/Components/AppShell/Sidebar.tsx` and related config (e.g. `sidebarConfig`).
3. **Update this document** (`docs/sitemap.md`):
   - Add, remove, or modify entries under **Route tree**.
   - Adjust the **Per-page navigation** section as needed.
4. If you introduce an entirely new module (e.g. another SaaS product), also review the `.cursor/rules/site-map.mdc` rule to ensure the conceptual module map stays in sync.

