const express = require("express");
const client = require("prom-client");
const app = express();
app.use(express.json());

// --- Prometheus metrics setup ---
const register = new client.Registry();
client.collectDefaultMetrics({ register }); // CPU, memory, event loop, etc.

const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
});
register.registerMetric(httpRequestDuration);

app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on("finish", () => {
    end({ method: req.method, route: req.path, status_code: res.statusCode });
  });
  next();
});

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});
// --- end metrics setup ---

// In-memory store - simple enough to have no external dependency,
// so this repo focuses purely on the container/K8s layer.
let notes = [];
let nextId = 1;
app.get("/health", (req, res) => {
  res.json({ status: "ok", pod: process.env.HOSTNAME || "local" });
});
app.get("/notes", (req, res) => {
  res.json(notes);
});
app.post("/notes", (req, res) => {
  const note = { id: nextId++, text: req.body.text || "" };
  notes.push(note);
  res.status(201).json(note);
});

// Intentional failure-simulation route - exists purely to generate
// realistic error-rate data for the observability dashboard.
app.get("/error-test", (req, res) => {
  if (Math.random() < 0.3) {
    res.status(500).json({ error: "Simulated internal server error" });
  } else {
    res.json({ status: "ok, no error this time" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`k8s-demo-api listening on port ${port}`);
});