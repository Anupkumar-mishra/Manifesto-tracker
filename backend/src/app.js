const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const promiseRoutes = require("./routes/promises.routes");
const partyRoutes = require("./routes/parties.routes");
const regionRoutes = require("./routes/regions.routes");
const governmentRoutes = require("./routes/governments.routes");
const chatRoutes = require("./routes/chat.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();

// Required for Render (fixes X-Forwarded-For error)
app.set("trust proxy", 1);

// CORS Configuration
app.use(
  cors({
    origin: [
      "https://manifesto-tracker-theta.vercel.app",
      "http://localhost:5173",
    ],
    credentials: true,
  })
);

app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", limiter);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Manifesto Tracker API is running",
  });
});

// Routes
app.use("/api/promises", promiseRoutes);
app.use("/api/parties", partyRoutes);
app.use("/api/regions", regionRoutes);
app.use("/api/governments", governmentRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/admin", adminRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    error: true,
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;
