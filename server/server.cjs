const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");
const path = require("path");
const xss = require("xss");
const crypto = require("crypto");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // In production, restrict this
    methods: ["GET", "POST"],
  },
});

const PORT = 3001;
const SECRET_KEY = "akatech-super-secret-key-change-in-prod";
const DB_FILE = path.join(__dirname, "db.json");

// --- Middleware ---
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());

// Rate Limiter
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per windowMs
  message: { error: "Too many requests, please try again later." },
});
app.use("/api/", limiter);

// --- Database Helper ---
const getDb = () => {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(
      DB_FILE,
      JSON.stringify(
        { messages: [], projects: [], tickets: [], invoices: [] },
        null,
        2
      )
    );
  }
  const db = JSON.parse(fs.readFileSync(DB_FILE));
  if (!db.projects) db.projects = [];
  if (!db.tickets) db.tickets = [];
  if (!db.invoices) db.invoices = [];
  return db;
};

const saveDb = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// --- Encryption Helper (Simple for Demo) ---
const encrypt = (text) => {
  // In a real app, use crypto with a proper key/iv.
  // For this demo, we'll base64 encode to simulate "storage format"
  return Buffer.from(text).toString("base64");
};

const decrypt = (text) => {
  return Buffer.from(text, "base64").toString("utf8");
};

// --- Auth Middleware ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- Routes ---

// 1. Client Message Submission
app.post("/api/client-messages", (req, res) => {
  const { name, email, subject, message } = req.body;

  // Validation
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }

  // Profanity Filter (Simple list)
  const badWords = ["spam", "junk", "badword"]; // Expand as needed
  const containsProfanity = badWords.some((word) =>
    message.toLowerCase().includes(word)
  );
  if (containsProfanity) {
    return res
      .status(400)
      .json({ error: "Message contains inappropriate content." });
  }

  // Length Check
  if (message.length < 1 || message.length > 1000) {
    return res
      .status(400)
      .json({ error: "Message must be between 1 and 1000 characters." });
  }

  // Sanitization
  const sanitizedMessage = xss(message);

  // Create Message Object
  const newMessage = {
    id: crypto.randomUUID(),
    name: xss(name),
    email: xss(email),
    subject: xss(subject),
    content: encrypt(sanitizedMessage), // Encrypt content
    timestamp: new Date().toISOString(),
    status: "unread",
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  };

  // Save to DB
  const db = getDb();
  db.messages.push(newMessage);
  saveDb(db);

  // Notify Admin via Socket
  io.emit("new_message", { ...newMessage, content: sanitizedMessage }); // Send decrypted content to admin

  res.status(201).json({ message: "Message sent successfully." });
});

// 1b. Project Request Submission
app.post("/api/projects", (req, res) => {
  const { name, email, company, plan, notes } = req.body;

  if (!name || !email || !plan) {
    return res
      .status(400)
      .json({ error: "Name, email, and plan are required." });
  }

  const newProject = {
    id: crypto.randomUUID(),
    name: xss(name),
    email: xss(email),
    company: xss(company || ""),
    plan: xss(plan),
    notes: encrypt(xss(notes || "")),
    timestamp: new Date().toISOString(),
    status: "pending", // pending, approved, in-progress, completed, rejected
    ip: req.ip,
  };

  const db = getDb();
  db.projects.push(newProject);
  saveDb(db);

  io.emit("new_project", { ...newProject, notes: xss(notes || "") });
  res.status(201).json({ message: "Project request received." });
});

// 1c. Support Ticket Submission
app.post("/api/tickets", (req, res) => {
  const { subject, message, priority, userEmail, userName } = req.body;

  if (!subject || !message || !userEmail) {
    return res
      .status(400)
      .json({ error: "Subject, message, and email are required." });
  }

  const newTicket = {
    id: crypto.randomUUID(),
    subject: xss(subject),
    message: encrypt(xss(message)),
    priority: xss(priority || "medium"),
    userEmail: xss(userEmail),
    userName: xss(userName || "User"),
    timestamp: new Date().toISOString(),
    status: "open", // open, in-progress, resolved, closed
    responses: [],
  };

  const db = getDb();
  db.tickets.push(newTicket);
  saveDb(db);

  io.emit("new_ticket", { ...newTicket, message: xss(message) });
  res.status(201).json({ message: "Support ticket created." });
});

// 1d. Get Client Tickets (Public/Simple Auth for Demo)
app.get("/api/client/tickets", (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const db = getDb();
  const userTickets = db.tickets
    .filter((t) => t.userEmail === email)
    .map((t) => ({
      ...t,
      message: decrypt(t.message),
      responses: t.responses.map((r) => ({
        ...r,
        message: decrypt(r.message),
      })),
    }));

  res.json(userTickets);
});

// 1e. Get Client Projects
app.get("/api/client/projects", (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const db = getDb();
  const userProjects = db.projects
    .filter((p) => p.email === email)
    .map((p) => ({
      ...p,
      notes: decrypt(p.notes),
    }));

  res.json(userProjects);
});

// 1f. Client Reply to Ticket
app.patch("/api/client/tickets/:id", (req, res) => {
  const { id } = req.params;
  const { email, response } = req.body;

  if (!email || !response)
    return res.status(400).json({ error: "Email and response required" });

  const db = getDb();
  const ticketIndex = db.tickets.findIndex((t) => t.id === id);

  if (ticketIndex === -1)
    return res.status(404).json({ error: "Ticket not found" });

  // Verify ownership
  if (db.tickets[ticketIndex].userEmail !== email) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  // Add response
  const newResponse = {
    id: crypto.randomUUID(),
    sender: "client",
    message: encrypt(response),
    timestamp: new Date().toISOString(),
  };

  if (!db.tickets[ticketIndex].responses) {
    db.tickets[ticketIndex].responses = [];
  }
  db.tickets[ticketIndex].responses.push(newResponse);

  saveDb(db);

  // Return updated ticket
  const updatedTicket = { ...db.tickets[ticketIndex] };
  updatedTicket.message = decrypt(updatedTicket.message);
  updatedTicket.responses = updatedTicket.responses.map((r) => ({
    ...r,
    message: decrypt(r.message),
  }));

  io.emit("update_tickets", updatedTicket);
  res.json(updatedTicket);
});

// 2. Admin Login (Demo)
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  // Hardcoded for demo
  if (username === "admin" && password === "admin123") {
    const token = jwt.sign({ username: "admin", role: "admin" }, SECRET_KEY, {
      expiresIn: "1h",
    });
    res.json({ token });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

// 3. Get Data (Admin Only)
app.get("/api/messages", authenticateToken, (req, res) => {
  const db = getDb();
  const messages = db.messages.map((msg) => ({
    ...msg,
    content: decrypt(msg.content),
  }));
  res.json(messages);
});

app.get("/api/projects", authenticateToken, (req, res) => {
  const db = getDb();
  const projects = db.projects.map((p) => ({ ...p, notes: decrypt(p.notes) }));
  res.json(projects);
});

app.get("/api/tickets", authenticateToken, (req, res) => {
  const db = getDb();
  const tickets = db.tickets.map((t) => ({
    ...t,
    message: decrypt(t.message),
    responses: t.responses.map((r) => ({ ...r, message: decrypt(r.message) })),
  }));
  res.json(tickets);
});

// 4. Update Status (Generic)
app.patch("/api/:resource/:id", authenticateToken, (req, res) => {
  const { resource, id } = req.params;
  const { status, response } = req.body; // response is for tickets/messages

  const db = getDb();
  if (!db[resource])
    return res.status(404).json({ error: "Resource type not found" });

  const itemIndex = db[resource].findIndex((i) => i.id === id);
  if (itemIndex === -1)
    return res.status(404).json({ error: "Item not found" });

  if (status) db[resource][itemIndex].status = status;

  // If responding to a ticket
  if (resource === "tickets" && response) {
    db[resource][itemIndex].responses.push({
      id: crypto.randomUUID(),
      sender: "admin",
      message: encrypt(response),
      timestamp: new Date().toISOString(),
    });
  }

  saveDb(db);

  // Return the updated item (decrypted)
  const updatedItem = { ...db[resource][itemIndex] };
  if (updatedItem.content) updatedItem.content = decrypt(updatedItem.content);
  if (updatedItem.notes) updatedItem.notes = decrypt(updatedItem.notes);
  if (updatedItem.message) updatedItem.message = decrypt(updatedItem.message);
  if (updatedItem.responses)
    updatedItem.responses = updatedItem.responses.map((r) => ({
      ...r,
      message: decrypt(r.message),
    }));

  io.emit(`update_${resource}`, updatedItem); // Notify clients
  res.json(updatedItem);
});

// --- Socket.io ---
io.on("connection", (socket) => {
  console.log("Client connected");
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// --- Start Server ---
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
