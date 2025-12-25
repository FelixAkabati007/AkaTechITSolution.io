
try {
  console.log("Loading dal...");
  const dal = require("./server/dal.cjs");
  console.log("DAL loaded successfully");
} catch (error) {
  console.error("Error loading DAL:", error);
}

try {
  console.log("Loading server...");
  // We can't fully load server as it starts listening, but we can check syntax by requiring it 
  // if we modify it to export app instead of just running.
  // But for now, let's just see if this script runs.
} catch (error) {
  console.error("Error loading server:", error);
}
