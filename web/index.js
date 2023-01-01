// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import shopify from "./shopify.js";
import GDPRWebhookHandlers from "./gdpr.js";
import mongoose from "mongoose";
import applyNonAuthPublicEndpoints from "./endpoints/applyNonAuthPublicEndpoints.js";
import applyPublicEndpoints from "./endpoints/applyPublicEndpoints.js";
import applyAuthenticatedEndpoints from "./endpoints/applyAuthenticatedEndpoints.js";

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", false);

    await mongoose.connect('mongodb://localhost:27017/', {
      dbName: "MoodleShopifyApp",
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("DB CONNECTED")
  } catch (error) {
    console.log('mongodb connection failed');
  }
};

connectDB();

const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT, 10);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;


const app = express();

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: GDPRWebhookHandlers })
);

applyNonAuthPublicEndpoints(app);

// All endpoints after this point will require an active session
app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());

applyPublicEndpoints(app);

applyAuthenticatedEndpoints(app);

app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.listen(PORT);