const express = require("express");
const fs = require("fs");
const { MongoClient } = require("mongodb");
const { createClient } = require("redis");

const app = express();
const PORT = process.env.PORT || 5000;

const MONGO_HOST = process.env.MONGO_HOST || "mongodb";
const MONGO_PORT = process.env.MONGO_PORT || "27017";
const MONGO_USERNAME = process.env.MONGO_USERNAME || "admin";
const MONGO_PASSWORD_FILE =
  process.env.MONGO_PASSWORD_FILE || "/run/secrets/mongo_password";

const REDIS_HOST = process.env.REDIS_HOST || "redis";
const REDIS_PORT = process.env.REDIS_PORT || "6379";

app.use(express.json());

let mongoClient;
let db;
let redisClient;

async function connectMongo() {
  const password = fs.readFileSync(MONGO_PASSWORD_FILE, "utf8").trim();

  const mongoUri =
    `mongodb://${encodeURIComponent(MONGO_USERNAME)}:` +
    `${encodeURIComponent(password)}@${MONGO_HOST}:${MONGO_PORT}/` +
    `?authSource=admin`;

  mongoClient = new MongoClient(mongoUri);

  await mongoClient.connect();

  db = mongoClient.db("multi_service_app");

  console.log("Connected to MongoDB");
}

async function connectRedis() {
  redisClient = createClient({
    socket: {
      host: REDIS_HOST,
      port: Number(REDIS_PORT),
    },
  });

  redisClient.on("error", (error) => {
    console.error("Redis error:", error);
  });

  await redisClient.connect();

  console.log("Connected to Redis");
}

app.get("/health", async (req, res) => {
  try {
    await db.command({ ping: 1 });
    await redisClient.ping();

    res.status(200).json({
      status: "healthy",
      service: "api",
      mongodb: "connected",
      redis: "connected",
    });
  } catch (error) {
    console.error("Health check failed:", error);

    res.status(503).json({
      status: "unhealthy",
      service: "api",
      mongodb: "unavailable",
      redis: "unavailable",
    });
  }
});

app.get("/message", async (req, res) => {
  try {
    const collection = db.collection("messages");

    const document = {
      message: "Hello from Multi-Service Application!",
      service: "node-express-api",
      createdAt: new Date(),
    };

    const result = await collection.insertOne(document);

    await redisClient.set("last_message", document.message, {
      EX: 300,
    });

    res.status(200).json({
      message: document.message,
      service: document.service,
      mongodb: {
        status: "stored",
        insertedId: result.insertedId,
      },
      redis: {
        status: "stored",
        key: "last_message",
      },
    });
  } catch (error) {
    console.error("Message endpoint failed:", error);

    res.status(500).json({
      error: "Failed to process message",
    });
  }
});

async function startServer() {
  try {
    await connectMongo();
    await connectRedis();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`API running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start API:", error);
    process.exit(1);
  }
}

startServer();
