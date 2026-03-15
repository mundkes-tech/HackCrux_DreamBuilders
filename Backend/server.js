import app from "./app.js";
import { connectDB, disconnectDB } from "./config/db.js";
import { createServer } from "http";
import { setupCopilotWs } from "./modules/copilot/copilot.ws.js";
import "dotenv/config.js";

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();

    const httpServer = createServer(app);
    setupCopilotWs(httpServer);

    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log(`Copilot WebSocket: ws://localhost:${PORT}/ws/copilot`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\nShutting down gracefully...");
  await disconnectDB();
  process.exit(0);
});

startServer();
