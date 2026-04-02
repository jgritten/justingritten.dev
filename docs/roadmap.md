# Feature roadmap and reference

This doc is the **single source of truth** for feature planning and “memory” when discussing the site’s direction. Use it to stay on track and to align implementation order with dependencies and portfolio goals.

---

## 1. Reference and principles (memory)

### Purpose of the site

- **Portfolio / landing page (primary):** Present you as a **full‑stack engineer** who can join a team and ship reliably. The `/` route (Profile) should quickly answer “Who is Justin?”, “What does he do well?”, and “How do I book time with him?”.
- **Commercial SaaS MVP demo (secondary):** Provide a reusable, **2–4 week SaaS starter** demo under `/saas` that shows how you design multi‑tenant, production‑grade products. Recruiters and potential buyers should be able to click through a believable dashboard + settings flow.
- **Ideas and experiments (tertiary):** Offer a home for **personal product ideas and demos** (e.g. a **municipality community hub** with maps, event pins, construction notices, and evacuation routes) without diluting the main portfolio story.
- **Public repo:** Design and docs should be recruiter-friendly; no secrets in code.

### Stated goals (your ideas, unordered)

- **User login:** Username/password; email verification; optional third-party logins (Google, Facebook, etc.).
- **Guest login (default entry for now):** To accommodate **recruiters and other quick visitors**, a **Guest** login is available and is the **default way to view the site** initially. Every guest is treated as a user of the **same default client** you set up (a single shared “demo” client). This lets casual users get into the site quickly, see what’s there, and **dig deeper only if they wish** (e.g. sign up or log in for full access). Rate limits and other guest-specific behaviour (e.g. doc gen by IP) apply to this path.
- **Login path trigger (two cases—not account creation vs returning):**
  - **First-time / no client (e.g. cold-call or new account):** User has no client. From the **post-sign-in hub** (`/saas/post-sign-in`), offer **Create Client** (opens the **Client Creation wizard**). The wizard ends with them **landing on the dashboard of their new client**. If their email has a **pending invitation**, show it on the same hub and let them **accept** or **decline**; accepting grants the **assigned role** and **access** to that client’s data.
  - **Returning user (already has account):** After sign-in, land on the **post-sign-in hub** (workspace launcher), not straight into the dashboard—so first-time and returning users both see **invitations**, **client list**, and **Create Client** before entering a tenant. **Optional acceleration:** If the user has set a **default client** and **“skip hub when default is available”**, they may be sent **directly** to that client’s dashboard (otherwise **even a single membership** stays on the hub until they choose **Open** or change preference). **Multiple clients:** User picks a client (or uses default per preference), can **set or clear default client** from the hub, then opens that client’s dashboard. **New pending invitation:** Same hub surfaces **accept/decline**, then **choose which client** to open (including the newly accepted client).
- **Current client context and multi-client:** The app treats the user with a clear **current Client** in mind. If the user is in **multiple clients**, they have a **means to switch** (e.g. from menu bar or sidebar). The same user may be e.g. **Manager** for one client and **Associate** for another; **permissions and application access must change accordingly** when switching. A user’s **permissions and access must be validated before any data can be accessed** (authorization on every data access).
- **Client (tenant) creation:** Users can be grouped under a **Client** with:
  - Shared objects: head office location, user groups, permissions.
  - Admin: enable/disable features per client (all users under that client are restricted).
  - Document generation: editable custom letterhead and footer per client.
- **WebSocket:** Server ↔ client communication for:
  - Support staff messaging (to a user or to all users of a client).
- **Notifications** (leveraging WebSocket):
  - Small alerts.
  - Notification icon with history of past notifications.
  - Full-page modal notifications (e.g. “You’re about to generate a file. This comes with a charge. Do you accept?”).
- **Mobile responsive:** Application works well on mobile.
- **Desktop layout – persistent user area:** User info in a persistent place (e.g. bottom of sidebar or top-right of page).
- **Three-section layout:**
  1. **Row 1 (full width):** Menu bar – notification icons, header info, client icon (left), user icon/image (right).
  2. **Row 2:** Left = **sidebar** (menu items); right = **content** (driven by sidebar selection). Default = Dashboard.
- **Username dropdown:** Account Settings (user info, address), Application Settings (theme, etc.), Logout.
- **User roles (two levels):**
  - **Client roles:** Roles for users *within* a client (client users using the product); used for permissions and feature access per client.
  - **SaaS roles:** Support and Admin for the product itself. Support can message users, **emulate (impersonate)** a user to assist with issues, and perform **elevated data manipulation** (CRUD on objects that normal client users cannot access—e.g. fix data in the DB). Admin has full control.
- **App / Client branding:** Either the **app name** is always visible at the top-left of the menu bar, or some combination of **app name + client name/icon**. May later move client icon/name to the **top of the sidebar**, with sidebar menu items starting on the next row below.
- **Theme:** All **Radix theme functionality** that we can use should be editable and **persist between sessions** (dark mode, accent colours, header font, etc.). **Clients** can optionally set a **persistent theme for all their users** (tenant-level default or override).
- **Audit log (within a client):** Whenever data is manipulated within a client, an **accessible log for client users** (e.g. “12:34 Aug 1st – Shanda updated Matter 56. Added new item 123. 12:36 – Shanda updated Matter 56. Edited item 456…”).
- **Document generation:** Upload a **template PDF** with editable placeholders (e.g. “On this day of [ADD DATE HERE], [NAME] bought the property [ADDRESS]…”). A **microserver** takes the template and fills in data when the user clicks **Generate**; client letterhead/footer apply.
- **Sidebar primary actions:** Sidebar defaults to **Dashboard**; then **Create New** and **Search**. **Create New** opens a **modal wizard** to begin object creation. **Search** opens a **modal** with a table and filters—**client users** see results scoped to their client; **support** can search across clients.
- **Soft delete:** Objects in the database are **not physically removed**; they have an **IsDeleted** boolean column. Search/list results **exclude** IsDeleted = true unless explicitly passed a flag (e.g. **IncludeDeleted**).
- **Bulk actions:** Included as functionality **when applicable** (e.g. multi-select then act on many).
- **Rate limiting (document generation):** Doc gen is CPU-heavy. Limit by **User** (or by **IP** for Guest)—e.g. **3 generations per day**. Nice-to-have: **Request additional generations** button that sends an email for you to approve; discuss when realized.
- **Onboarding tour:** Implement a “click next on highlighted sections” style tour once the features to tour are defined.
- **Help widget:** Eventually an **AI API chat** that references your documentation for help. Learning feature (first time hooking up an AI API in SaaS). Important but **later phase**.
- **Keyboard shortcuts** and **localization readiness:** Nice-to-have; prioritize in the same **future-ideas** area (not soon).
- **Version / revision history:** Changes to objects should be **auditable**; **clear revision history** visible (view previous versions, diff where useful).
- **Dashboard activity:** User sees **recently edited matters** and **“Ready at a Glance”** metrics: e.g. Matters Opened/Closed (day/week/month/year), Documents Generated, and other object activity as defined during development.
- **File validation:** When applicable (e.g. template uploads, document uploads)—type, size, optional virus scan.
- **Scheduled jobs / document packages:** Define a **package of documents** to generate in a **bulk series** (e.g. on **Matter Closed**), so users don’t generate each one individually. **Client Admin/Manager** roles can pick and choose documents to define a package; the package is available to client users from within the Doc Gen component.
- **Email notifications:** Emails can be sent for events. **Notification preferences are per user**, but **templated by Client Admin/Managers** (client defines which options exist; each user chooses from those).
- **Configurable fields:** Yes, but **define objects first**; revisit custom fields when relevant.
- **Configurable dashboard:** Each client can use the **Default Dashboard** or **toggle on/off** various offered components. Users of that client see that default but **can also edit their own** dashboard (personal override).
- **2FA:** Yes, but **nice to have for later**.
- **API keys:** Not at this stage, **possibly never**.
- **Offline / graceful degradation:** When API or WebSocket is unavailable, **banner or theme should shift** and **header or other text** should convey status to the user.

### How we stay on track

- **Order of work:** Decide per phase; the list above is **not** the implementation order. Dependencies (e.g. auth before clients, WebSocket before notifications) drive order.
- **Docs and ADRs:** For each major feature (auth, new API surface, deployment change), add/update as per [docs/decisions/README.md](decisions/README.md) and the workspace rule (e.g. ADR + `security.md` for auth).
- **Scope per slice:** Prefer small, shippable slices (e.g. “login UI + token” then “email verification” then “Google OAuth”) so the roadmap stays manageable and demoable.

---

## 2. Feature list (consolidated)

| Area | Feature | Notes |
|------|---------|------|
| **Auth** | Guest login (default entry) | Default way to view site; all guests use same default client; recruiters/casual visitors can explore without signing in |
| **Auth** | Username/password login | Optional later; **Clerk** is the primary SaaS path today ([ADR 0010](decisions/0010-clerk-saas-authentication.md)) |
| **Auth** | Email verification | Optional; document approach (e.g. token in link, rate limits) |
| **Auth** | Third-party login | Google, Facebook, etc.; document OAuth/OpenID choice |
| **Auth** | Login path trigger | After Clerk sign-in: **post-sign-in hub** (invites, client list, Create Client); optional default client + skip-hub preference; no forced auto-dashboard for single-client users unless they opt in |
| **Tenancy** | Default client for guests | Single preconfigured client; all Guest users are scoped to this client for demo/exploration |
| **Tenancy** | Client (tenant) model | Create client; associate users to client |
| **Tenancy** | Client Creation wizard | Modal wizard for no-client users; create client then land on that client’s dashboard |
| **Tenancy** | Client invitation flow | Accept invitation → join client with assigned role and permissions (first-time or returning with new invitation) |
| **Tenancy** | Returning user: choose client | Hub lists memberships; user opens a client or sets **default client**; optional **skip hub** when default exists—**not** an automatic single-client redirect unless user prefers it |
| **Tenancy** | Returning user: new invitation | If returning user has pending invitation, opportunity to accept it, then choose which client to open (including newly accepted) |
| **Tenancy** | Current client context | App always has a “current Client”; all data and UI scoped to current client |
| **Tenancy** | Switch client (multi-client) | If user is in multiple clients, UI to switch; role and access differ per client |
| **Tenancy** | Per-client role | Same user can have different client role per client (e.g. Manager here, Associate there) |
| **Tenancy** | Authorization on data access | Validate user permissions for current client/role before any data is returned or action allowed |
| **Tenancy** | Shared data per client | Head office, user groups, permissions |
| **Tenancy** | Client admin | Enable/disable features per client; letterhead/footer for doc gen |
| **Realtime** | WebSocket | Server ↔ client; support messaging (to user or to all users of a client) |
| **Notifications** | Small alerts | Toast/snackbar style |
| **Notifications** | Notification icon + history | Badge + list of past notifications |
| **Notifications** | Full-page modal | E.g. confirm charge before generating file |
| **Layout** | Mobile responsive | All key flows work on small screens |
| **Layout** | Persistent user area (desktop) | Bottom of sidebar or top-right; consistent placement |
| **Layout** | Three-section shell | Menu bar → Sidebar + Content; default = Dashboard |
| **Shell** | Menu bar | Notifications, header, app/client branding (left), user (right) |
| **Shell** | Username dropdown | Account Settings, Application Settings, Logout |
| **Shell** | App / Client branding | App name always top-left, or app + client name/icon; may move to top of sidebar later |
| **Roles** | Client roles | Roles for users within a client; permissions and feature access per client |
| **Roles** | SaaS roles: Support, Admin | Support: messaging, impersonation, elevated CRUD; Admin: full control |
| **Roles** | Impersonation (emulate user) | Support can “be” a user to reproduce and assist with issues |
| **Roles** | Support data manipulation | CRUD on objects not exposed to normal client users (fix DB/data) |
| **Theme** | Full Radix theming + persistence | All theme options (dark, colours, fonts, etc.) editable; persist per user across sessions |
| **Theme** | Client default theme | Optional tenant-level theme applied to all users of that client |
| **Audit** | Client-accessible audit log | Per-client log of data changes (who, when, what—e.g. “Shanda updated Matter 56. Added item 123”) |
| **Doc gen** | Template PDF + microserver | Upload template with placeholders; microserver fills data on Generate; client letterhead/footer |
| **Doc gen** | Rate limiting | Per User (or per IP for Guest) e.g. 3 generations/day; optional “Request additional” → email for approval |
| **Shell** | Sidebar: Create New, Search | Dashboard default; Create New = modal wizard; Search = modal table + filters (client-scoped; support cross-client) |
| **Data** | Soft delete | IsDeleted column; results exclude deleted unless IncludeDeleted flag |
| **Data** | Bulk actions | Multi-select and act on many when applicable |
| **UX** | Onboarding tour | “Next” through highlighted sections; implement once features are defined |
| **Help** | Help widget → AI chat | Later: AI API chat referencing docs; learning feature for SaaS |
| **Audit** | Version / revision history | Object changes auditable; clear revision history visible (view previous, diff) |
| **Dashboard** | Activity + “Ready at a Glance” | Recently edited matters; metrics e.g. Matters Opened/Closed (day/week/month/year), Docs Generated |
| **Dashboard** | Test results visualization | One of the dashboard widgets: show **test results** (pass/fail count, coverage %) and **when** the last run was (e.g. last deploy/merge). Data from a CI-generated summary file the app fetches; see "Test results dashboard widget" (Section 5b). |
| **Data** | File validation | Type, size, optional scan when applicable (templates, uploads) |
| **Doc gen** | Document packages (scheduled/bulk) | Package = group of docs to generate in bulk (e.g. on Matter Closed); Admin/Manager define; available in Doc Gen |
| **Notifications** | Email + user preferences | Emails sent for events; preferences per user, options templated by Client Admin/Managers |
| **Tenancy** | Configurable fields | Custom fields on objects; revisit once objects are defined |
| **Dashboard** | Configurable dashboard | Client: default or toggle components; users see client default, can edit their own |
| **Auth** | 2FA | Nice to have; later |
| **UX** | Offline / graceful degradation | Banner or theme shift + header/text to convey connection status |

---

## 3. Suggested implementation order (phases)

Order is driven by **dependencies** and **portfolio impact**, not your original brainstorm order.

### Phase 0: Foundation (do first)

- **Guest as default entry:** The site is **viewable by default as a Guest**. No login required to enter; visitors land in the app shell and are treated as **Guest** users of a **single default client** you configure. This accommodates recruiters and quick visitors: they can explore the layout, dashboard, and demos and dig deeper (sign up / log in) only if they wish.
- **Default client:** Set up one **default client** used for all Guest sessions (shared demo client). All guest traffic is scoped to this client; rate limits and permissions apply per Guest (e.g. by IP where needed).  
  **When to implement:** Defer to **Phase 1 (Guest session)**. Implement the default client (e.g. constant or env `VITE_DEFAULT_CLIENT_ID`, or backend entity) when you add the explicit Guest session type and “current client = default client” for unauthenticated users; that is the first point where API or client code needs a concrete client scope for guests.
- **App shell and layout** (three-section: menu bar, sidebar, content).  
  Sidebar: **Dashboard** (default), then **Create New**, then **Search**. Create New and Search can be placeholders or open empty modals until object model exists. Works for Guest and authenticated users.
- **Mobile-responsive shell** (and baseline responsive rules).  
  Everything you build later should fit this.
- **Persistent user area** (placeholder or “Guest” until auth exists).  
  Establishes where Account/App settings and Logout will live (username dropdown); for Guest, can show “Sign in” or “Continue as guest” as appropriate.
- **App / Client branding** (top-left of menu bar): App name always visible; optional client name/icon when tenancy exists. Design so it can later move to top of sidebar with menu items below.

**Why first:** Recruiters and casual visitors see the product immediately without friction; auth and full tenancy then slot into the same shell.

**Phase 0 complete.** Implemented: shell, Dashboard, placeholder modals (Create New, Search), Settings (sidebar + sub-menu + placeholder pages), theme (persistence + Theme settings modal), footer (favicon, Resume, LinkedIn, Email), mobile (hamburger, slide-out sidebar, two-column settings view). Default client deferred to Phase 1.

### Phase 1: SaaS - Authentication

Between Phase 0 and the full Phase 1/2 SaaS work, there is an **API‑first slice** that stands up the backend and wires portfolio‑visible features to it.

#### Phase 1A.5: API productization baseline (multi-client frontend readiness)

- **Goal:** Ensure the API can be consumed by multiple frontends (current web client + future iOS/other clients) without backend redesign.
- **Versioning strategy:** Introduce and document API versioning (for example `/api/v1/...`) with a clear deprecation policy for breaking changes.
- **Contract consistency:** Standardize response envelopes and error contracts across endpoints (code, message, optional details, correlation/request id).
- **OpenAPI lifecycle:** Keep OpenAPI current, publish the generated spec as an artifact, and use it as the source for client integration and typed client generation.
- **Auth foundation:** Implement token-based auth/authorization suitable for native and web clients; define role/permission scopes for protected endpoints.
- **Operational guardrails:** Add request correlation IDs, rate limiting policy, and baseline API observability (structured logs, health/readiness checks, and error-rate visibility).
- **Write resiliency:** Add idempotency guidance for retry-prone writes where duplicate submissions are possible from unstable networks.
- **Idempotency keys (client + server):** Standardize idempotency key handling for non-idempotent writes (for example `POST /api/contact` and future create/generate actions). Frontends should generate and send an idempotency key per user intent; backend should persist key + request fingerprint + response metadata with a TTL window and return the original successful response for safe retries.
- **List endpoint conventions:** Standardize pagination/filter/sort patterns so mobile and web clients can consume lists predictably.
- **Definition of done for new endpoints:** DTO contract, repository-backed persistence, validation, tests, docs update, and OpenAPI update in the same change.

#### Phase 1A: Core API + contact + visitor metrics

- **Backend API (existing `server/Api` project):** Use the existing .NET Web API project as the primary backend surface. Extend the SQLite‑backed `AppDbContext` with entities for **contact messages** and **visitor metrics** so this phase reuses infrastructure that will later grow into tenancy and SaaS features.
- **Contact form endpoint:** Add a `POST /api/contact` endpoint that receives validated contact submissions (first name, last name, email, company/project, message, timestamps). Persist submissions in the database and optionally send an email notification (e.g. via SES/SendGrid/SMTP). Treat email as best‑effort: **persist first**, then attempt to send.
- **Visitor metrics endpoints:** Add lightweight metrics for the portfolio/profile page, via endpoints such as `POST /api/metrics/visit` (log a visit for a given route, e.g. `/`) and `GET /api/metrics/summary` (return simple, privacy‑friendly counts or aggregates for use in a visitor counter widget). Start with per‑route totals or per‑day counts; later phases can evolve this into fuller analytics.
- **Forward‑compatible data model:** When modelling contact messages and metrics, include fields that will make sense under later **multi‑tenancy** (e.g. a future `ClientId` and optional `UserId`), even if they are null or always set to a single default client in this phase. This keeps the schema compatible with Phase 2 without blocking you today.
- **CORS and security posture:** Keep endpoints unauthenticated but constrained: strong input validation, IP‑based rate limiting for contact and metrics writes, and a CORS policy that only allows the SPA origins (localhost + deployed CloudFront domain). All secrets (DB connection, email provider keys) live in environment variables rather than client code.
- **Deployment target:** Deploy the existing API project to **AWS Elastic Beanstalk** as the first real backend environment (e.g. `justingritten-api-dev`). Configure environment variables for database and email, and verify that the SPA can reach the EB URL over HTTPS.
- **Client wiring – Contact form:** Update the portfolio `ContactCard` to send submissions to `POST /api/contact` via a small API client helper. Reflect submission states in the UI (`idle` → `submitting` → `success`/`error`), while keeping the “email me directly” instructions as a fallback when the API is unavailable.
- **Client wiring – Visitor counter:** Add a small visitor counter on the profile/landing page that calls `POST /api/metrics/visit` on first load (debounced) and displays counts from `GET /api/metrics/summary`. If the API fails, the widget should degrade gracefully (e.g. hide itself or show a subtle “metrics unavailable” message).
- **Status:** Core API slice is **shipped**; **Clerk** for `/saas` + **JWT validation** on protected routes is **shipped** ([ADR 0010](decisions/0010-clerk-saas-authentication.md)). **Phase 2** (tenancy APIs + hub UX) is the **current focus** for SaaS demo depth.
- **Current checkpoint (April 2026):** Contact + metrics + EB deploy + Clerk + `GET /api/v1/me` + forced redirect to **`/saas/post-sign-in`** (workspace hub shell before dashboard). Tenancy entities and hub wiring are in progress per [ADR 0011](decisions/0011-multi-tenant-clients-and-workspace-hub.md).

##### Email follow-up TODOs (capture for next pass)

- Add **Resend template IDs** for contact notifications (move from inline text body to template-driven payload).
- Add **verification email templates** in Resend for upcoming auth work (email verification and password reset).
- Implement auth-side **email verification flow** with single-use tokens, expiry, and resend cooldown/rate limits.
- Add a provider-agnostic **template mapping strategy** so `Resend`/future `Ses` implementations use the same application-level email intents.
- Add integration tests for provider selection via `EMAIL_PROVIDER` in `Program.cs` composition root.

- **Guest session:** Support **Guest** as an explicit session type (no credentials; optional token or session cookie for “current client = default client”). Guest uses the **default client** for all scoped data; rate limits (e.g. doc gen) by IP. Provide a way to **upgrade** to full user (sign up / log in) when the visitor wants to dig deeper.
- **SaaS authentication (done for demo path):** **Clerk** on `/saas` with **`ClerkProvider`**, **`/saas/post-sign-in`** as post-auth hub (not auto-dashboard), and **API JWT** validation for Clerk session tokens — see [ADR 0010](decisions/0010-clerk-saas-authentication.md).
- **Username/password login** (first-party API login, optional later): Only if you add a non-Clerk path; would need login endpoint, token storage, ADR + `docs/security.md`.
- **Account Settings** (user info, address) and **Application Settings** (theme) + **Logout** in the username dropdown.  
  Reuse shell from Phase 0.
- **Theme (Application Settings):** Full Radix theming (dark/light, colours, fonts, etc.) editable and **persisting between sessions** (e.g. CSS variables + localStorage or API). ADR for theme approach.
- **Roles (foundation):** Introduce **SaaS roles** (e.g. User, Support, Admin) and **client roles** (e.g. per-client roles for permissions). Auth and API must know role for impersonation and support CRUD later.
- **Login path trigger (post-login):** **Done (shell):** Clerk sign-in always lands on **`/saas/post-sign-in`** first. **In progress (data):** Hub loads **memberships, invitations, preferences** from tenancy API ([ADR 0011](decisions/0011-multi-tenant-clients-and-workspace-hub.md)); Create Client wizard and accept/decline complete the flow.
- **Email verification** (optional): e.g. “Verify email” flow with token in link; document in ADR.
- **Third-party login** (Google, then optionally Facebook): OAuth/OpenID; document in ADR and security.
- **Hosted auth vendors (locked):** **Clerk** implemented for SaaS; **Supabase Auth** remains documented fallback—see [ADR 0009](decisions/0009-auth-observability-and-infra-choices.md).

**Phase 1 SaaS auth checkpoint:** Clerk + JWT + post-sign-in hub route are **complete** for the portfolio demo. Remaining Phase 1 items (guest session typing, first-party credentials, email verification, full roles matrix) can proceed in parallel with Phase 2 tenancy or stay queued.

**Why this order:** Auth is required for “per user” and “per client” features; roles early so tenancy and support features can gate correctly; dropdown and theme make the app feel complete.

### Phase 2: SaaS - Tenancy (clients)

- **Client (tenant) entity** and API (create client, memberships, invitations, user workspace preferences).  
  ADR: [0011-multi-tenant-clients-and-workspace-hub.md](decisions/0011-multi-tenant-clients-and-workspace-hub.md).
- **Post-sign-in workspace hub (`/saas/post-sign-in`):** Full-screen **launcher** (not only a small modal): **pending invitations** (accept/decline), **your clients** (open dashboard, **set/clear default client**), **Create Client** → **Client Creation wizard** (modal or stepped UI). Same hub for first-time and returning users so nothing is “silent auto-enter.”
- **Default client + optional skip:** Persist per Clerk user (API): **default client id** and **skip hub when default is available**. If skip is on and default resolves, user may go **straight to that client’s dashboard** after sign-in; otherwise **always show the hub** (including when the user has **exactly one** membership—no forced auto-redirect).
- **Login path flows (aligned with hub):**  
  - **First-time / no client:** Hub shows **Create Client**; wizard completes → **dashboard of new client**. **Pending invitation** on hub → **accept** or **decline** → then choose client if needed.  
  - **Returning user:** Hub lists **memberships** and **invitations**; user **opens** a client or relies on **default + skip** preference. **Multiple clients:** pick client or default; **menu bar switch client** when >1 membership (see below).
- **Current client context:** App always has a **current Client** for the logged-in user. All data and UI (sidebar, dashboard, search, etc.) are **scoped to current client**. Store current client in session/state; APIs receive client context (e.g. header or claim).
- **Multi-client and switch client:** If user is a member of **multiple clients**, provide a **switch-client** control (e.g. client name/icon in menu bar or sidebar). On switch, **permissions and application access update** to that client and the user’s **role in that client** (e.g. Manager in one, Associate in another).
- **Multi-client membership — menu bar:** To the **right of the client logo**, show a **Switch client** control when the user has **more than one** client they can access.
- **Authorization on data access:** **Validate user permissions for current client and role before any data is returned or action allowed** (API and, where needed, UI). No data access without passing this check.
- **Shared data per client:** head office, user groups, permissions (model + API + UI where needed). Client roles drive what each user can do within the client.
- **Client admin:** feature flags per client (enable/disable features); letterhead/footer for document generation.  
  Can start with DB + API; doc gen UI can follow in a later phase.
- **Client default theme:** Optional persistent theme per client applied to all users of that client (override or default for Application Settings).
- **Support impersonation (emulate user):** Support staff can “become” a specific user (session/context switch) to reproduce issues and assist. Audit this action.
- **Support data manipulation:** Support-only API surfaces (or elevated permissions) for CRUD on entities that normal client users cannot access (e.g. fix bad data, restore records). Document in ADR and security.
- **Soft delete (data model):** All relevant entities use **IsDeleted** boolean; no physical delete. APIs and search exclude deleted unless **IncludeDeleted** (or equivalent) is passed. Support/Admin can see or restore deleted when needed.
- **Audit log (within client):** When data is manipulated, append to a **client-accessible audit log** (e.g. “12:34 Aug 1st – Shanda updated Matter 56. Added new item 123”). Expose via API and UI so client users can view activity for their client.
- **Document generation (template + microserver):** Upload template PDF with placeholders (e.g. [DATE], [NAME], [ADDRESS]); **microserver** fills data on Generate; client letterhead/footer apply. Rate limit: e.g. **3 generations per day** per User (or per IP for Guest). Nice-to-have: “Request additional generations” → email for approval (refine when realized).
- **Document packages (scheduled / bulk):** Client **Admin/Manager** can define a **package** of documents to generate in one go (e.g. on **Matter Closed**). Package available to client users from within Doc Gen; runs as **scheduled/background job** so user doesn’t generate each doc individually.
- **Version / revision history:** Object changes **auditable**; **revision history** visible (view previous versions, diff where useful). Implement for key entities as they’re defined.
- **File validation:** When applicable (template uploads, document uploads)—type, size, optional virus scan.
- **Email notifications:** Ability to send emails for events. **User notification preferences** templated by **Client Admin/Managers** (client defines which notification types/options exist; each user sets their own choices).

**Why after auth:** You need users and roles before “users under a client,” impersonation, support-only CRUD, client-scoped audit, and doc packages.

### Phase 3: SaaS - Realtime and notifications

- **WebSocket** (server endpoint + client connection; auth-aware).  
  ADR for tech choice (e.g. SignalR on .NET).
- **Support messaging** (to user or to all users of a client) over WebSocket.
- **Notifications:**  
  - Small alerts (toast) and notification icon + history (stored notifications, delivered via WebSocket or poll).  
  - Full-page modal for confirmations (e.g. “Accept charge?” before file generation).
- **Global search (modal):** **Search** in sidebar opens a modal with table and filters. **Client users:** results scoped to their client. **Support:** can search across clients. Implement once object model and tenancy are clear.
- **Create New (modal wizard):** **Create New** in sidebar opens a modal wizard to start object creation; wire to your object types when defined.
- **Dashboard activity + “Ready at a Glance”:** Recently edited matters; metrics such as Matters Opened/Closed (day/week/month/year), Documents Generated, and other object activity as you define them.
- **Test results (dashboard widget):** One of the offered dashboard visualizations: **Test results** — show pass/fail count, coverage percentage, and when the last run was (e.g. "Last run: after merge to main"). Data comes from a small **CI-generated summary file** (see Section 5b). Can be implemented **earlier** as a portfolio demo (e.g. with or just after Phase 1) since it only needs the deploy pipeline to run tests and emit the summary; no tenancy required.
- **Configurable dashboard:** **Client** can use Default Dashboard or **toggle on/off** offered components. **Users** of that client see the client default but **can edit their own** dashboard (personal override).
- **Offline / graceful degradation:** When API or WebSocket is unavailable, **banner or theme shift** and **header or other text** to convey connection status to the user.

**Why after tenancy:** “All users of a client” and “support staff” concepts depend on clients and roles; search, create, and dashboard need object model.

### Phase 4: SaaS - Polish and extra features

- **Onboarding tour:** “Click next” through highlighted sections of the UI; implement once the features to highlight are defined.
- Any **billing/charge** UX (e.g. “accept charge” modal) integrated with real backend or clearly demo-only.
- **Branding placement:** If you move client name/icon from menu bar to **top of sidebar** (menu items below), do it in this phase so the shell is stable.
- **Bulk actions:** Add multi-select and bulk actions wherever applicable (lists, tables).
- **Shell cleanup (technical):** Remove or rewire legacy **`AppShell.tsx`** and the **`Components` barrel export** if still unused—portfolio uses **`GlobalLayout`**, SaaS uses **`SaasAppShell`**. Update **`ComponentsIndex.test`** and docs when deleted. Tracked in **`docs/sitemap.md`** under legacy shell; do not rely on chat memory alone.

### Phase 5: SaaS - Later / learning-focused

- **Portfolio “Sign in” (marketing CTA, far future):** Optional link or button on the **profile / `GlobalLayout`** path that sends visitors to **`/saas`** (or a dedicated sign-in route)—**not** required for Clerk (SaaS-scoped auth is enough). Revisit only if you want returning users to discover SaaS login from the landing shell without opening the SaaS tab first.
- **Help widget → AI chat:** AI API chat that references your documentation. Later-phase target; important for you as a learning feature (first time wiring an AI API in SaaS). Document approach in ADR when you start.
- **2FA:** Optional two-factor authentication; nice to have for later. Not in scope for current phases.
- **Configurable fields:** Revisit once objects are defined; client-defined custom fields on objects.
- **API keys:** Not planned at this stage; possibly never. Omit from implementation unless you decide otherwise.

---

## API multi-client readiness checklist (living)

Use this checklist when evaluating if a new frontend client can integrate quickly:

- [ ] Endpoint contracts are DTO-based and documented.
- [ ] No EF entities are exposed directly in API responses.
- [ ] Versioning/deprecation impact is considered before changing contracts.
- [ ] Error responses follow one shared schema.
- [ ] OpenAPI is updated and available for client teams.
- [ ] Auth/authorization requirements are explicit per endpoint.
- [ ] Rate limiting and abuse controls are defined for write endpoints.
- [ ] Non-idempotent write endpoints define idempotency key behavior (header name, TTL window, conflict semantics, replay response behavior).
- [ ] Pagination/filter/sort behavior is consistent for list endpoints.
- [ ] Endpoint has automated tests for success + validation + failure paths.

---

## 4. Ideas and suggestions (from this discussion)

- **App / Client branding:** Top-left = app name always visible, or app + client name/icon. Design the shell so branding can later live at the **top of the sidebar** with menu items on the next row—no need to commit to one place yet.
- **Roles (two levels):** (1) **Client roles** – permissions and feature access for users within a client. (2) **SaaS roles** – User, Support, Admin. Support gets impersonation + elevated CRUD; Admin gets full control. Model both in the DB and in auth (e.g. claims) so APIs can authorize correctly.
- **Impersonation:** When Support “emulates” a user, log the event (who impersonated whom, when) for audit. Consider a clear UI indicator (“You are viewing as [User]”) and an easy “Exit” to return to support context.
- **Support CRUD:** Expose support-only or role-gated endpoints (or same endpoints with elevated permission checks) for fixing data. Document in `docs/security.md` and an ADR; avoid exposing these to the normal client bundle (e.g. route guard or separate support UI).
- **Theme:** Use Radix theming (e.g. theme tokens, dark/light, accent, typography) and persist via localStorage and/or API. Client default theme can be stored on the tenant and applied when user has no personal override (or as default for new users).
- **Guest and default client:** Treat “no auth” as Guest; assign a single **default client** ID for all guest sessions so the app has a consistent “current client” from day one. Dashboard, search, and doc gen can all be scoped to that client for guests; rate limiting (e.g. doc gen) by IP. Later, “Sign in” or “Create account” upgrades the session to a full user with normal login paths.
- **Login path and current client:** Implement the path trigger (cold vs invited) and current-client context early in Phase 2 so every subsequent feature (dashboard, search, doc gen) is scoped to “current client” and respects role. Authorization checks on the API (and guarded routes/UI) should run for every data request.
- **Deployment:** Auth and API mean you’ll eventually host the .NET API (e.g. separate subdomain). The first choice will be **AWS Elastic Beanstalk** for the .NET API, with a **fallback/alternative** of **Lambda + API Gateway (.NET serverless)** if that proves a better fit. When you decide and implement this, add an ADR and update `docs/deployment.md` and `docs/security.md` (CORS, auth in production, and contact-form email delivery).
- **Demo vs production:** For portfolio, consider which flows are “live” (e.g. real email) vs “demo” (e.g. magic link in dev) and document that in ADR or roadmap so recruiters understand what’s implemented vs simulated.

---

## 5. Other feature ideas

### 5a. Already reflected above

- **Guest login (default entry)** → Stated goals + Phase 0 (Guest as default; default client) + Phase 1 (Guest session, upgrade path to sign up / log in). All guests use same default client; rate limits e.g. by IP.
- **Login path trigger** → Stated goals + Phase 1 (Clerk → `/saas/post-sign-in` hub shell) + Phase 2 (hub data: memberships, invites, preferences; wizard; optional default + skip).
- **Client Creation wizard** → Phase 2 (from hub **Create Client**; land on new client dashboard).
- **Client invitation flow** → Phase 2 (accept/decline on hub → role + permissions).
- **Returning user: choose client** → Phase 2 (hub + default client preference; optional skip-hub; **not** mandatory auto-redirect for single client).
- **Returning user: new invitation** → Phase 2 (option to accept pending invitation, then choose which client to open).
- **Current client context + switch client + per-client role** → Phase 2 (current client in state; switch UI; permissions update by client/role).
- **Authorization on data access** → Phase 2 (validate permissions before any data/action).
- **Audit log** → Stated goals + Phase 2 (client-accessible log).
- **Document generation** → Template PDF + microserver + rate limiting in Phase 2.
- **Document packages** → Phase 2 (Admin/Manager define package; bulk generate e.g. on Matter Closed; scheduled job).
- **Global search + Create New** → Sidebar + Phase 3 (modal wizard, search modal scoped by role).
- **Bulk actions** → “When applicable”; Phase 4.
- **Soft delete** → IsDeleted + IncludeDeleted in data model; Phase 2.
- **Rate limiting** → Doc gen (3/day, request more); Phase 2.
- **Version / revision history** → Phase 2 (auditable object changes; visible revision history).
- **Dashboard activity + “Ready at a Glance”** → Phase 3 (recent matters, metrics: Matters Opened/Closed, Docs Generated, etc.).
- **Configurable dashboard** → Phase 3 (client default + toggle components; user can edit own).
- **File validation** → When applicable in doc gen and upload flows.
- **Email notifications** → Phase 2 (emails sent; user preferences templated by Client Admin/Managers).
- **Offline / graceful degradation** → Phase 3 (banner or theme + header/text for status).
- **Configurable fields** → Revisit when objects defined; Phase 5 / when relevant.
- **2FA** → Phase 5 / later; nice to have.
- **API keys** → Not planned; possibly never.
- **Onboarding tour** → Phase 4; implement once features are defined.
- **Help widget / AI chat** → Phase 5 (later; learning feature).

### 5b. Test results dashboard widget (data source)

For the **Test results** dashboard visualization (coverage + last run), the app needs a small, machine-readable summary. Do **not** check in the full `client/coverage` folder.

**Recommended approach:** In the **deploy workflow** (or a step that runs on every merge to `main`), run client tests with coverage (e.g. `npm run test:coverage`), then produce a **summary file** (e.g. Vitest `json-summary` reporter → `coverage/coverage-summary.json`, or a small custom file with `{ passed, failed, total, coveragePct, timestamp, sha }`). Write that file into `client/dist` (e.g. `client/dist/test-results.json`) **before** the S3 upload step, so it is deployed with the site. The dashboard fetches `/test-results.json` and displays it. “Last run” then means *the test run that produced the current deploy* (e.g. last merge to main).

**Alternative:** Have CI (on push to main or on merge) run tests, generate the same summary, and **commit** it to the repo (e.g. `client/public/test-results.json`) so the next build includes it. Simpler deploy (no test step in deploy), but adds commit-from-CI and possible noise in history; the deployed site would show “last run” as of the last commit that updated that file.

When you implement the widget, add a short note to `docs/deployment.md` (e.g. “Deploy workflow runs tests and writes `test-results.json` into dist”) and optionally an ADR if you want to lock in the format or location.

### 5c. Ideas for the future (not soon)

Prioritized in the same “later” area; add to feature list and phases when you choose to do them.

- **Keyboard shortcuts and accessibility:** Shortcuts for main actions (e.g. “G then D” for Dashboard); ARIA and focus management. Not anytime soon.
- **Localization readiness:** Structure copy for i18n (e.g. keys, one locale) even if only shipping English. Same priority band as keyboard shortcuts.
- **Export:** CSV/Excel (or PDF) export for lists and reports. Add when you have list views that benefit from it.
- **Visitor metrics (backend-based):** Simple, privacy-friendly visitor metrics for the profile page using your own backend (e.g. API + SQLite) instead of third-party trackers. Revisit once the API is deployed and you want lightweight analytics.

### 5d. Ten suggestions — decisions and status

1. **Version / revision history** – **Yes.** Object changes auditable; clear revision history visible (view previous, diff). In feature list and Phase 2.
2. **Dashboard activity / “Ready at a Glance”** – **Yes.** Recently edited matters; metrics e.g. Matters Opened/Closed (day/week/month/year), Documents Generated, other object activity as defined. In feature list and Phase 3.
3. **File validation** – **Yes, when applicable.** Type, size, optional virus scan for templates and uploads. In feature list; apply in doc gen and upload flows.
4. **Scheduled jobs / document packages** – **Yes.** Doc gen: define a **package** of documents to generate in bulk (e.g. on Matter Closed). Client Admin/Manager define packages; available in Doc Gen. Runs as scheduled/background job. In feature list and Phase 2.
5. **Email notifications** – **Yes.** Emails sent for events. **Preferences per user**, but **templated by Client Admin/Managers** (client defines which options exist; user chooses). In feature list and Phase 2.
6. **Configurable fields** – **Yes, revisit when objects are defined.** Clients define custom fields on objects; add once object model is clear. In feature list; Phase 5 / when relevant.
7. **Configurable dashboard** – **Yes.** Client uses default or toggles offered components; users see client default and **can edit their own** dashboard. In feature list and Phase 3.
8. **Two-factor authentication (2FA)** – **Yes, nice to have for later.** In feature list; Phase 5 / later. Not in current scope.
9. **API keys** – **Not at this stage; possibly never.** Omit from implementation unless you decide otherwise.
10. **Offline / graceful degradation** – **Yes.** Banner or theme shift plus header or other text to convey connection status. In feature list and Phase 3.

---

## 6. Updating this doc

- **When you add or drop a feature:** Update Section 2 (feature list) and the phase in Section 3.
- **When you change order:** Adjust Section 3 and briefly note why (e.g. “Moved X before Y so we can demo Z”).
- **When you lock in a decision:** Add an ADR in `docs/decisions/` and point to it from here if it affects the roadmap (e.g. “See 0004-authentication-approach.md”).

## 7. Locked stack choices (reference)

These are decided for the portfolio phase; details and rationale live in [ADR 0009: Authentication, observability, metrics, and deferred infra](decisions/0009-auth-observability-and-infra-choices.md).

| Topic | Choice |
|-------|--------|
| **Hosted authentication** | **Clerk** (primary; SaaS + `GET /api/v1/me` — see [ADR 0010](decisions/0010-clerk-saas-authentication.md)); **Supabase Auth** (backup if Clerk is replaced) |
| **Error / APM monitoring** | **AWS structured logging + CloudWatch** on EB; no Sentry (or similar paid SaaS) at current scope |
| **Visitor / product metrics** | **First-party** `/api/metrics/...` only ([ADR 0008](decisions/0008-metrics-overview-period-endpoint.md)) |
| **Redis / Upstash** | **Not used** until a concrete need (e.g. multi-instance, shared rate limits, realtime scale-out) |

---

*Last updated: 2026-04-02. This roadmap is a living document; implementation order may change as you iterate.*
