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

// Allowed Frontend Origins
const allowedOrigins = [
  "https://manifesto-tracker-theta.vercel.app",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without origin (Postman, curl, health checks)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", limiter);

// Health Check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Manifesto Tracker API is running",
  });
});

// API Routes
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
