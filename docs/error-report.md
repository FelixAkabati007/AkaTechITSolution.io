# AkaTech IT Solution — Static Code Analysis Report

## Summary
- Scope: src, server, AkaTech_Components
- Findings grouped by type with severity and fixes

## Critical Security
- Storing JWT in localStorage
  - Files: [App.jsx](file:///d:/AkaTech_IT_Solution/src/App.jsx#L112-L113), [App.jsx](file:///d:/AkaTech_IT_Solution/src/App.jsx#L158-L159), [SignupWizard.jsx](file:///d:/AkaTech_IT_Solution/src/components/client/SignupWizard.jsx#L690-L700)
  - Type: Security
  - Severity: High
  - Risk: Vulnerable to XSS token theft
  - Fix: Use httpOnly, secure cookies set by server; avoid client-side storage of session tokens

- Unsalted SHA-256 password hashing for email registration
  - File: [server.cjs](file:///d:/AkaTech_IT_Solution/server/server.cjs#L368-L377)
  - Type: Security
  - Severity: High
  - Risk: Weak hashing; susceptible to offline attacks
  - Fix: Use bcrypt (10–12 rounds) or Argon2; unify with change-password flow already using bcrypt

- Non-cryptographic “encrypt” (Base64) for sensitive fields
  - Files: [server.cjs](file:///d:/AkaTech_IT_Solution/server/server.cjs#L109-L118), [server.cjs](file:///d:/AkaTech_IT_Solution/server/server.cjs#L433-L446), [server.cjs](file:///d:/AkaTech_IT_Solution/server/server.cjs#L499-L506)
  - Type: Security
  - Severity: Medium-High
  - Risk: Base64 is reversible; does not protect data at rest
  - Fix: Use AES-GCM with a managed key; store IV per record; rotate keys periodically

- .env contains plaintext database credentials
  - File: [.env](file:///d:/AkaTech_IT_Solution/.env#L2)
  - Type: Security
  - Severity: Medium
  - Risk: Secrets exposure if env is leaked
  - Fix: Move secrets to a secure manager (Vault/Cloud provider secrets); rotate credentials; limit DB user privileges

## Authentication & Authorization
- Google OAuth client usage
  - Files: [App.jsx](file:///d:/AkaTech_IT_Solution/src/App.jsx), [SignupWizard.jsx](file:///d:/AkaTech_IT_Solution/src/components/client/SignupWizard.jsx#L151-L193), [server.cjs](file:///d:/AkaTech_IT_Solution/server/server.cjs#L176-L298)
  - Type: Logic/Runtime
  - Severity: Medium
  - Notes: Frontend uses GoogleLogin button; server verifies ID/Access token correctly. Ensure GoogleOAuthProvider has client_id set via env and avoid passing undefined props.
  - Fix: Keep locale defined (done); prefer ID token flow; add CSRF protection on auth endpoints

## API & Data Handling
- Inconsistent amount type (string vs number)
  - Files: [server.cjs](file:///d:/AkaTech_IT_Solution/server/server.cjs#L492-L506), [ClientBilling.jsx](file:///d:/AkaTech_IT_Solution/src/components/client/ClientBilling.jsx#L80-L90)
  - Type: Logic
  - Severity: Low-Medium
  - Risk: Formatting and arithmetic errors
  - Fix: Persist amounts as integers (minor units); format on display

- Project options endpoint missing (fixed)
  - Files: [server.cjs](file:///d:/AkaTech_IT_Solution/server/server.cjs#L448-L456), [SignupWizard.jsx](file:///d:/AkaTech_IT_Solution/src/components/client/SignupWizard.jsx#L535-L551), [ClientBilling.jsx](file:///d:/AkaTech_IT_Solution/src/components/client/ClientBilling.jsx#L104-L116)
  - Type: Runtime
  - Severity: Medium
  - Fix: Implemented GET /api/projects/options returning PROJECT_TYPES

## Payment UX & PCI
- Collecting full card details client-side state
  - File: [ClientBilling.jsx](file:///d:/AkaTech_IT_Solution/src/components/client/ClientBilling.jsx#L29-L35)
  - Type: Security/Compliance
  - Severity: Medium
  - Risk: PCI obligations if transmitted or stored
  - Fix: Avoid handling raw card data; use redirect-based payment or tokenized SDK; prefer MoMo/Bank transfer paths already supported

- Payment locking for requested invoices
  - Files: [server.cjs](file:///d:/AkaTech_IT_Solution/server/server.cjs), [ClientBilling.jsx](file:///d:/AkaTech_IT_Solution/src/components/client/ClientBilling.jsx)
  - Type: Logic
  - Severity: Medium
  - Status: Server-side check added; client should also disable Pay Now for “Requested”

## Performance & Reliability
- Repeated fetch without caching
  - Files: multiple components (Admin/Client)
  - Type: Performance
  - Severity: Low-Medium
  - Fix: Add client-side caching and invalidation (implemented for project list); debounce searches; batch socket-driven refreshes

- Socket event listeners clean-up
  - Files: [ClientBilling.jsx](file:///d:/AkaTech_IT_Solution/src/components/client/ClientBilling.jsx#L137-L146), [SignupWizard.jsx](file:///d:/AkaTech_IT_Solution/src/components/client/SignupWizard.jsx#L553-L564)
  - Type: Reliability
  - Severity: Low
  - Status: Proper off() clean-up present

## Accessibility & UX
- Ensure buttons/inputs have accessible labels and focus states
  - Files: Onboarding components
  - Type: Accessibility
  - Severity: Low
  - Fix: Use aria-labels for icon-only buttons; maintain visible focus; provide alt text for images/videos

## Recommendations
- Token: Switch to httpOnly cookie sessions
- Passwords: Migrate all hashing to bcrypt; enforce minimum complexity
- Encryption: Replace Base64 with AES-GCM
- Amounts: Store minor units (integer)
- Logging: Reduce console.* in production; use a structured logger
- Rate limiting: Different limits per sensitive route (auth, payments)

