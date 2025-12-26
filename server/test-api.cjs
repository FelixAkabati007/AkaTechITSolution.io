const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const BASE_URL = process.env.VITE_API_URL || "http://localhost:3001/api";

async function testApi() {
  console.log("Starting API Tests...");

  try {
    // 1. Signup
    const email = `test-api-${Date.now()}@example.com`;
    const password = "password123";
    console.log(`\n1. Testing Signup for ${email}...`);

    const signupRes = await fetch(`${BASE_URL}/signup/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        finalData: {
          name: "API Test User",
          password,
          selectedPackage: "Starter",
          companyName: "Test Corp",
        },
      }),
    });

    if (!signupRes.ok) {
      const err = await signupRes.text();
      throw new Error(`Signup failed: ${signupRes.status} ${err}`);
    }

    const signupData = await signupRes.json();
    console.log("Signup success:", signupData.user.email);
    const token = signupData.token;

    // 2. Get Profile (Auth check)
    console.log("\n2. Testing Get Profile...");
    const profileRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!profileRes.ok) {
      const err = await profileRes.text();
      throw new Error(`Get Profile failed: ${profileRes.status} ${err}`);
    }
    const profile = await profileRes.json();
    console.log("Profile fetched:", profile.user?.email);

    // 3. Create Subscription (should have been created during signup, but let's list them)
    console.log("\n3. Testing Get Subscriptions...");
    const subsRes = await fetch(`${BASE_URL}/subscriptions`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!subsRes.ok) {
      const err = await subsRes.text();
      throw new Error(`Get Subscriptions failed: ${subsRes.status} ${err}`);
    }
    const subs = await subsRes.json();
    console.log(`Subscriptions fetched: ${subs.data.length}`);
    if (subs.data.length === 0)
      throw new Error("No subscription created during signup!");

    // 4. Test Notifications
    console.log("\n4. Testing Notifications...");
    const notifRes = await fetch(`${BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const notifs = await notifRes.json();
    console.log(`Notifications fetched: ${notifs.length}`);

    // 5. Test Tickets
    console.log("\n5. Testing Tickets...");
    // Create Ticket
    const ticketRes = await fetch(`${BASE_URL}/tickets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: "Test Ticket",
        message: "This is a test ticket",
        priority: "high",
        userEmail: email,
        userName: "API Test User",
      }),
    });

    if (!ticketRes.ok) {
      const err = await ticketRes.text();
      throw new Error(`Create Ticket failed: ${ticketRes.status} ${err}`);
    }
    console.log("Ticket created.");

    // Get Tickets
    const getTicketsRes = await fetch(
      `${BASE_URL}/client/tickets?email=${email}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!getTicketsRes.ok) {
      const err = await getTicketsRes.text();
      throw new Error(`Get Tickets failed: ${getTicketsRes.status} ${err}`);
    }
    const tickets = await getTicketsRes.json();
    console.log(`Tickets fetched: ${tickets.length}`);
    if (tickets.length === 0) throw new Error("Ticket not found!");
    if (tickets[0].subject !== "Test Ticket")
      throw new Error("Ticket subject mismatch!");

    console.log("\n✅ API Tests Passed!");
  } catch (error) {
    console.error("\n❌ API Test Failed:", error);
    process.exit(1);
  }
}

testApi();
