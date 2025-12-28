// Vercel Serverless Function Entry Point
// This bridges Vercel's serverless environment to the Express app
const app = require("../server/server.cjs");

module.exports = app;
