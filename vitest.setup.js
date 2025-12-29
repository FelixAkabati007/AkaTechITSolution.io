import "@testing-library/jest-dom/vitest";
import * as React from "react";
globalThis.React = React;
import { vi } from "vitest";
vi.mock("@components/ui/SyncStatusProvider", () => {
  return {
    useSyncStatus: () => ({ socket: null, status: "offline" }),
  };
});
vi.mock("@react-oauth/google", () => {
  const React = globalThis.React;
  return {
    GoogleLogin: (props) =>
      React.createElement("span", { "data-testid": "google-login" }),
    GoogleOAuthProvider: ({ children }) =>
      React.createElement(React.Fragment, null, children),
  };
});
