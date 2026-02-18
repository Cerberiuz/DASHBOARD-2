const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const VIEW_PASSWORD = process.env.VIEW_PASSWORD || "1234";

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Auth endpoint
app.post("/auth", (req, res) => {
  const { password } = req.body;

  if (password === VIEW_PASSWORD) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
