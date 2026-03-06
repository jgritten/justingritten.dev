# ADR 0004: App shell and guest-as-default entry (Phase 0)

## Status

Accepted (Phase 0 foundation).

## Context

The roadmap requires a SaaS-style app where recruiters and visitors can land without friction, with a clear path to explore and link to the repo. Phase 0 establishes the UI framework: shell, layout, and guest-as-default entry, without auth or client/tenant logic yet.

## Decision

- **Entry:** Visitors land directly in the **app shell** (no separate landing page). No login required; everyone is treated as **Guest** for now. Auth and “Sign in” will be added in Phase 1.
- **Shell layout:** Three-section layout as in the roadmap:
  1. **Menu bar (row 1):** App name (“justingritten.dev”) top-left; user area top-right (dropdown: Guest, Sign in placeholder, “View source on GitHub”). Design allows adding client branding (e.g. client name/icon) later.
  2. **Row 2:** **Sidebar** (Dashboard, Create New, Search) + **content** area. Dashboard is the default route (`/`). Create New and Search open **placeholder modals** (short copy + Close) to show functionality; real wizards/search come in later phases.
- **Dashboard:** Displays the portfolio hero content (name, tagline, GitHub link) that previously lived on the single FrontPage. ProductList and FileExplorer remain in the codebase but are not part of the shell or nav for Phase 0.
- **Tech:** React Router for shell + routes; Radix UI (Theme, Dialog, DropdownMenu, Avatar) for layout and modals. Shell and sidebar are **mobile-responsive** (sidebar adapts for small screens).
- **No client/tenant UI yet:** No default-client ID or client name in the UI in Phase 0; the shell is prepared so client branding can be added when tenancy is implemented.

## Consequences

- Single entry point: open site → see app shell and Dashboard immediately.
- Placeholder user dropdown and modals set expectations and leave clear extension points for Phase 1 (auth) and Phase 2 (tenancy, Create New wizard, Search).
- Docs: [system-overview.md](../system-overview.md) updated to describe entry and shell; roadmap Phase 0 remains the source of scope.

## Phase 0 extensions (post-ADR)

Phase 0 was later extended with: **Settings** (sidebar item, sub-menu with Account/Application/Client, placeholder pages), **theme** (ThemeContext, persistence, Theme settings modal in user dropdown), **footer** (favicon, Resume, LinkedIn, Email), and **mobile overlay** (hamburger opens slide-out sidebar; two-column icon strip + settings sub-menu when on a settings route). These align with the shell foundation and do not change the above decision.
