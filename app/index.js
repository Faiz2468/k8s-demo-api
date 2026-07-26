const express = require("express");
const app = express();
app.use(express.json());

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

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`k8s-demo-api listening on port ${port}`);
});
