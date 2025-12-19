# Cookie Management System

## Overview
The AkaTech IT Solutions website includes a comprehensive cookie management system designed to comply with GDPR and other privacy regulations. This system includes user consent management, secure cookie handling, and an administrative interface for monitoring and control.

## Components

### 1. Cookie Consent Banner (`src/components/ui/CookieConsent.jsx`)
- **Features**:
  - Displays automatically for new visitors.
  - Allows users to Accept All, Reject All, or Customize preferences.
  - Stores preferences in `localStorage`.
  - Animates in/out using Framer Motion.
- **Categories**:
  - **Essential**: Strictly necessary (always active).
  - **Analytics**: Performance tracking (optional).
  - **Marketing**: Ad targeting (optional).

### 2. Cookie Utilities (`src/lib/cookieUtils.js`)
- **Functions**:
  - `setCookie(name, value, days, options)`: Sets cookies with Secure/SameSite defaults.
  - `getCookie(name)`: Retrieves cookie values.
  - `eraseCookie(name)`: Deletes cookies.
  - `saveCookiePreferences(prefs)`: Persists user choices.
  - `getAuditLog()`: Retrieves activity logs.

### 3. Admin Dashboard Integration (`src/components/admin/AdminSettings.jsx`)
- **Features**:
  - **Toggle Secure Mode**: Enforce HttpOnly/Secure flags (simulation).
  - **Policy Version**: Update the tracked version of the cookie policy.
  - **Audit Log**: View recent cookie-related actions (Set, Erase, Consent Update).

## Security Measures
- **Secure Flag**: Automatically applied to cookies when on HTTPS.
- **SameSite**: Defaults to 'Lax' to prevent CSRF.
- **Audit Logging**: All cookie mutations are logged for compliance auditing.

## Performance
- **Lazy Loading**: The consent banner is lightweight and loaded with the main app bundle, but logic is deferred until mount.
- **Storage**: Audit logs are capped at 100 entries to prevent localStorage bloat.

## Testing
- Unit tests cover all utility functions to ensure correct setting, getting, and erasing of cookies.
- Run tests via `npm test`.
