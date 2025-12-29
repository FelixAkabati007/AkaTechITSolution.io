# Automated Test Coverage — Setup & Current Status

## Configuration
- Tool: Vitest with @vitest/coverage-v8
- Config: [vitest.config.js](file:///d:/AkaTech_IT_Solution/vitest.config.js)
- Reports: HTML, text, json-summary

## Latest Run Summary
- Suites: 5
- Tests: 20 (2 passed, 18 failed)
- Status: Coverage generation blocked by failing tests

## Action Items
- Provide SyncStatusProvider in tests rendering context
- Ensure React is available in tests (configured via global React in setup)
- Resolve alias imports in tests (configured in vitest config)

## How to Generate Coverage
- Command: `npx vitest --coverage --run`
- Output: `coverage/` (HTML), console (text), `coverage/coverage-summary.json`

Once failing tests are addressed, coverage reports will be produced automatically in both web and text formats.
