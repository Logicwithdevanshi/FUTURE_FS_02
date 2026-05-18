// 1. Import libraries
const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");

// 2. Setup express app
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public")); // serve your index.html, css, js

// 3. MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",       // your MySQL username
  password: "USA&D2430",       // your MySQL password
  database: "crm_system"
});

db.connect(err => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("✅ Connected to MySQL");
});

// 4. API routes
app.get("/api/entries", (req, res) => {
  db.query("SELECT * FROM crm_entries", (err, results) => {
    if (err) res.status(500).send("Error fetching entries");
    else res.json(results);
  });
});

app.post("/api/entries", (req, res) => {
  const { name, email, phone, company, status, notes, followUp } = req.body;
  const sql = "INSERT INTO crm_entries (name,email,phone,company,status,notes,follow_up) VALUES (?,?,?,?,?,?,?)";
  db.query(sql, [name, email, phone, company, status, notes, followUp], (err) => {
    if (err) res.status(500).send("Error saving entry");
    else res.send("Entry added successfully!");
  });
});

app.delete("/api/entries/:id", (req, res) => {
  db.query("DELETE FROM crm_entries WHERE id=?", [req.params.id], (err) => {
    if (err) res.status(500).send("Error deleting entry");
    else res.send("Entry deleted successfully!");
  });
});

app.put("/api/entries/:id", (req, res) => {
  const { status, notes, followUp } = req.body;
  const sql = "UPDATE crm_entries SET status=?, notes=?, follow_up=? WHERE id=?";
  db.query(sql, [status, notes, followUp, req.params.id], (err) => {
    if (err) res.status(500).send("Error updating entry");
    else res.send("Entry updated successfully!");
  });
});

//5. Start server (last line)

app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});
