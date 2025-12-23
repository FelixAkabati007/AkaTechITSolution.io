// Test script for Subscription Management API
// Run with: node test-subscriptions.js

const fetch = global.fetch; // Built-in in Node 18+

const BASE_URL = "http://localhost:3001/api";
let token = "";
let subId = "";

const log = (msg, type = "info") => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${type.toUpperCase()}] ${msg}`);
};

const runTests = async () => {
  // Wait for server to start
  console.log("Waiting 5s for server...");
  await new Promise((resolve) => setTimeout(resolve, 5000));

  try {
    // 1. Login
    log("Logging in...");
    const loginRes = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "admin", password: "admin123" }),
    });

    if (!loginRes.ok) throw new Error("Login failed");
    const loginData = await loginRes.json();
    token = loginData.token;
    log("Login successful", "success");

    // 2. Create Subscription
    log("Creating subscription...");
    const createRes = await fetch(`${BASE_URL}/subscriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userName: "Test User",
        userEmail: "test@example.com",
        plan: "Premium",
        durationMonths: 12,
      }),
    });

    if (!createRes.ok) {
      const errText = await createRes.text();
      throw new Error(`Create failed: ${createRes.status} ${errText}`);
    }
    const createData = await createRes.json();
    subId = createData.id;
    log(`Subscription created: ${subId}`, "success");

    // 3. Get Subscriptions
    log("Fetching subscriptions...");
    const getRes = await fetch(`${BASE_URL}/subscriptions`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const getData = await getRes.json();
    if (getData.data.length === 0) throw new Error("No subscriptions found");
    log(`Fetched ${getData.total} subscriptions`, "success");

    // 4. Approve Subscription
    log("Approving subscription...");
    const approveRes = await fetch(
      `${BASE_URL}/subscriptions/${subId}/action`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: "approve" }),
      }
    );
    if (!approveRes.ok) throw new Error("Approve failed");
    const approveData = await approveRes.json();
    if (approveData.status !== "active")
      throw new Error("Status update failed");
    log("Subscription approved", "success");

    // 5. Extend Subscription
    log("Extending subscription...");
    const extendRes = await fetch(`${BASE_URL}/subscriptions/${subId}/action`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ action: "extend", details: { months: 6 } }),
    });
    if (!extendRes.ok) throw new Error("Extend failed");
    log("Subscription extended", "success");

    // 6. Check Audit Logs
    log("Checking audit logs...");
    const auditRes = await fetch(`${BASE_URL}/audit-logs`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const auditData = await auditRes.json();
    if (auditData.length === 0) throw new Error("No audit logs found");
    log("Audit logs verified", "success");

    // 7. Export CSV
    log("Testing export...");
    const exportRes = await fetch(`${BASE_URL}/subscriptions/export`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!exportRes.ok) throw new Error("Export failed");
    const csvText = await exportRes.text();
    if (!csvText.includes("userEmail")) throw new Error("Invalid CSV format");
    log("Export verified", "success");

    log("ALL TESTS PASSED", "success");
  } catch (err) {
    log(err.message, "error");
    process.exit(1);
  }
};

runTests();
