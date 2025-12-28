# 📊 Codebase Audit Report: AkaTech IT Solution

> **Generated on**: 2025-12-27
> **Auditor**: AI Engineering Auditor (v2.1)
> **Target**: Admin Dashboard & Client Portal System

---

## 🗺️ 1. Project Overview & Logical Architecture

- **Primary Goal**: Provide a centralized platform for managing client projects, invoices, and support tickets ("AkaTech IT Solution").
- **Architecture**:
  - **Frontend**: React (Vite) Single Page Application (SPA).
  - **Backend**: Node.js (Express) monolithic server.
  - **Database**: PostgreSQL (managed via Drizzle ORM).
  - **Real-time**: Socket.IO (installed, partially implemented).
- **Key User Journeys**:
  - **Admin**: Login → Dashboard → Manage Clients/Invoices → Monitor System Status.
  - **Client**: Login (Google/Email) → View Project Status → Pay Invoices → Request Support.
- **Core Domain Concepts**:
  - `User`: Admin or Client roles (Google OAuth integration).
  - `Invoice`: Generated PDFs, tracking payment status.
  - `Project`: Milestone tracking and status updates.

---

## 🌳 2. File Structure (Annotated Tree)

```text
├── server/
│   ├── server.cjs          # ⚠️ Monolithic entry point (API + Socket.IO + Auth)
│   ├── dal.cjs             # ✅ Data Access Layer (Drizzle ORM)
│   ├── emailService.cjs    # ✅ Decoupled email logic (Nodemailer)
│   └── db/                 # Database migrations
├── src/
│   ├── components/
│   │   ├── admin/          # Admin-specific views
│   │   │   ├── AdminLayout.jsx  # ⚠️ Contains hardcoded auto-login logic
│   │   │   └── AdminClients.jsx # ✅ Includes invoice generation modal
│   │   ├── client/         # Client-specific views
│   │   └── shared/
│   │       └── ConnectionStatus.jsx # Network status indicator
│   ├── hooks/
│   │   └── useSyncStatus.jsx # ✅ Real-time sync status simulation
│   ├── lib/
│   │   ├── auth.ts         # Auth utilities
│   │   └── data.jsx        # ⚠️ Mixed mock/static data
│   ├── pages/              # Route components
│   └── App.jsx             # Main router configuration
├── package.json            # ✅ Validated dependencies
└── .env                    # Environment variables (Git-ignored)
```

---

## 🚨 3. Issue Log (Prioritized)

### 🔴 Critical Risks

| File                                   | Issue                                                                     | Recommendation                                                         |
| :------------------------------------- | :------------------------------------------------------------------------ | :--------------------------------------------------------------------- |
| `server/server.cjs`                    | **Hardcoded Secret Key**: `SECRET_KEY` is hardcoded on line 37.           | **IMMEDIATE**: Move to `process.env.JWT_SECRET` and rotate keys.       |
| `src/components/admin/AdminLayout.jsx` | **Exposed Credentials**: Hardcoded `admin/admin123` login in `useEffect`. | **IMMEDIATE**: Remove auto-login logic. Require manual authentication. |
| `server/server.cjs`                    | **Permissive CORS**: `origin: "*"` allows any domain to connect.          | Restrict to specific frontend domains in production.                   |

### 🟠 High Priority

| File                          | Issue                                                                                 | Recommendation                                                              |
| :---------------------------- | :------------------------------------------------------------------------------------ | :-------------------------------------------------------------------------- |
| `src/hooks/useSyncStatus.jsx` | **Simulated Logic**: Sync status uses `Math.random()` instead of real backend events. | Integrate with `socket.io-client` to listen for real `sync_update` events.  |
| `server/server.cjs`           | **Monolithic Structure**: All routes defined in one file (~200+ lines).               | Refactor routes into `server/routes/*.js` (e.g., `auth.js`, `invoices.js`). |
| `src/lib/data.jsx`            | **Mock Data Dependency**: Frontend relies heavily on static/mock data.                | Complete migration to API calls for all dynamic content.                    |

### 🟡 Medium Priority / Enhancements

| File                                    | Issue                                                | Recommendation                                                                     |
| :-------------------------------------- | :--------------------------------------------------- | :--------------------------------------------------------------------------------- |
| `src/components/admin/AdminClients.jsx` | **Form Validation**: Basic HTML5 validation used.    | Adopt `zod` + `react-hook-form` for robust schema validation.                      |
| `src/index.css`                         | **Global Styles**: Custom scrollbar logic is global. | Consider scoping to specific containers via utility classes (Partially addressed). |

---

## 💡 4. Strategic Recommendations

### Phase 1: Security & Stabilization (Immediate)

- **Objective**: Secure the platform for real data.
- **Tasks**:
  1.  Implement `dotenv` for all secrets (DB_URL, JWT_SECRET, GOOGLE_ID).
  2.  Remove all mock data and "simulated" hooks.
  3.  Set up GitHub Actions for CI (Linting + Testing).

### Phase 2: Architecture Refactor (Medium Term)

- **Objective**: Improve maintainability and scalability.
- **Tasks**:
  1.  Split `server.cjs` into `routes/`, `controllers/`, and `services/`.
  2.  Migrate `src/` to TypeScript (`.tsx`) for type safety.
  3.  Implement real Socket.IO events for dashboard updates.

### Phase 3: Feature Expansion (Future)

- **Objective**: Enhance client experience.
- **Tasks**:
  1.  Add "Pay Now" Stripe integration for Invoices.
  2.  Implement E2E testing with Playwright.
  3.  Deploy to Vercel (Frontend) + Railway/Render (Backend).

---

## 🛠️ 5. Troubleshooting Log

### Incident: Health Check Connection Abort (2025-12-27)

#### 1. Error Context & Symptoms

- **Error Log**: `[error] net::ERR_ABORTED http://localhost:5175/api/health`
- **Component**: `src/components/shared/ConnectionStatus.jsx`
- **Symptoms**: Console error indicating a failed network request during the connection heartbeat check. The application UI might erroneously show "Offline" status.

#### 2. Diagnostic Steps

1.  **Proxy Verification**: Checked `vite.config.js` to ensure `/api` requests are correctly proxied to `http://localhost:3001`. Configuration was found to be correct.
2.  **Server Status**: Verified backend server was running and accepting connections on port 3001 using `npm run start:server` logs.
3.  **Code Analysis**: Examined `ConnectionStatus.jsx`. Identified a race condition in the `useEffect` hook. The `checkConnection` function was `async`, causing the `AbortController` instance to be assigned to `activeController` _after_ the `await fetch()` call completed.
4.  **Root Cause Identification**: When the component unmounted (or re-rendered in Strict Mode) while a fetch was pending, the `cleanup` function tried to call `abort()` on `activeController`, which was still `null`. Consequently, the pending request was not aborted by the code, leading to unhandled browser-level cancellation errors (`net::ERR_ABORTED`) or state updates on unmounted components.

#### 3. Root Cause

- **Improper Async/Await Usage with AbortController**: The `AbortController` was not being returned synchronously, preventing the cleanup function from accessing it during the pending request state.

#### 4. Implemented Solution

- **Refactoring**: Modified `checkConnection` to be a synchronous function that immediately returns the `AbortController`.
- **IIFE**: Wrapped the async `fetch` logic inside an Immediately Invoked Function Expression (IIFE) within `checkConnection`.
- **Signal Handling**: Updated the `checkConnection` calls in `useEffect` to capture the controller immediately.

#### 5. Verification

- **Code Review**: Verified that `activeController` is assigned _before_ the asynchronous operation begins.
- **Behavior**: The component now correctly aborts pending requests on unmount, preventing `net::ERR_ABORTED` from causing unhandled side effects or state updates.

### Incident: Google Avatar ORB Blocking (2025-12-27)

#### 1. Error Context & Symptoms

- **Error Log**: `net::ERR_BLOCKED_BY_ORB https://lh3.googleusercontent.com/...`
- **Component**: `AkaTech_Components/ui/Avatar.jsx`
- **Symptoms**: Google user profile images were failing to load or causing console errors. A manual filter in the code was explicitly preventing `lh3.googleusercontent.com` URLs from rendering.

#### 2. Diagnostic Steps

1.  **Code Analysis**: Examined `Avatar.jsx` and found a conditional check: `!src.includes("lh3.googleusercontent.com")`.
2.  **Attribute Review**: Noticed the `<img>` tag included `crossOrigin="anonymous"`.
3.  **Root Cause Identification**: The previous developer had implemented a "fix" by simply blocking the problematic URLs instead of resolving the underlying CORS/ORB issue. The `crossOrigin="anonymous"` attribute forces a CORS check, which can trigger ORB (Opaque Response Blocking) if the server response doesn't perfectly match the expected CORS headers, even for public images.

#### 3. Root Cause

- **Strict CORS on Public Images**: Using `crossOrigin="anonymous"` on standard `<img>` tags for third-party resources (like Google Avatars) that don't strictly require it can lead to unnecessary blocking by the browser's ORB mechanism.
- **Incorrect Filtering**: The code explicitly filtered out the valid Google image domain to "suppress" the error.

#### 4. Implemented Solution

- **Remove Filter**: Removed the line blocking `lh3.googleusercontent.com`.
- **Relax CORS**: Removed the `crossOrigin="anonymous"` attribute from the `<img>` tag. This allows the browser to load the image as an opaque response (standard image embedding) without triggering strict CORS/ORB validation.

#### 5. Verification

- **Code Review**: Confirmed `Avatar.jsx` now accepts Google URLs and uses standard image loading.
- **Expected Behavior**: Google avatars should now load correctly without generating `net::ERR_BLOCKED_BY_ORB` errors.
