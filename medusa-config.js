const dotenv = require("dotenv");

let ENV_FILE_NAME = "";
switch (process.env.NODE_ENV) {
  case "production":
    ENV_FILE_NAME = ".env.production";
    break;
  case "staging":
    ENV_FILE_NAME = ".env.staging";
    break;
  case "test":
    ENV_FILE_NAME = ".env.test";
    break;
  case "development":
  default:
    ENV_FILE_NAME = ".env";
    break;
}

try {
  dotenv.config({ path: process.cwd() + "/" + ENV_FILE_NAME });
} catch (e) {}

// CORS when consuming Medusa from admin
const ADMIN_CORS =
  process.env.ADMIN_CORS || "http://localhost:7000,http://localhost:7001";

// CORS to avoid issues when consuming Medusa from a client
const STORE_CORS = process.env.STORE_CORS || "http://localhost:8000";

const DATABASE_TYPE = process.env.DATABASE_TYPE || "sqlite";
const DATABASE_URL =
  process.env.DATABASE_URL || "postgres://localhost/medusa-store";
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

const plugins = [
  `medusa-fulfillment-manual`,
  `medusa-payment-manual`,
  {
    resolve: "@medusajs/admin",
    options: {
      path: "backend",
      autoRebuild: true,
      // outDirCopied: "admin-build",
    },
  },
  // {
  //   resolve: `medusa-file-minio`,
  //   options: {
  //     endpoint: process.env.MINIO_ENDPOINT,
  //     bucket: process.env.MINIO_BUCKET,
  //     access_key_id: process.env.MINIO_ACCESS_KEY,
  //     secret_access_key: process.env.MINIO_SECRET_KEY,
  //   },
  // },
  {
    resolve: `medusa-plugin-slack-notification`,
    options: {
      show_discount_code: true,
      slack_url: `https://hooks.slack.com/services/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`,
      admin_orders_url: `http://localhost:7001/a/orders`,
    },
  },
  {
    resolve: `medusa-payment-stripe`,
    options: {
      api_key: process.env.STRIPE_API_KEY,
      webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,
    },
  },
];

const modules = {
  eventBus: {
    resolve: "@medusajs/event-bus-redis",
    options: {
      redisUrl: REDIS_URL,
    },
  },
  cacheService: {
    resolve: "@medusajs/cache-redis",
    options: {
      redisUrl: REDIS_URL,
    },
  },
  inventoryService: {
    resolve: "@medusajs/inventory",
  },
  stockLocationService: {
    resolve: "@medusajs/stock-location",
  },
};

const projectConfig = {
  database_database: "./medusa-db.sql",
  jwtSecret: process.env.JWT_SECRET,
  cookieSecret: process.env.COOKIE_SECRET,
  redis_url: REDIS_URL,
  database_url: DATABASE_URL,
  database_type: DATABASE_TYPE,
  store_cors: STORE_CORS,
  admin_cors: ADMIN_CORS,
  database_extra:
    process.env.NODE_ENV !== "development"
      ? { ssl: { rejectUnauthorized: false } }
      : {},
};

if (DATABASE_URL && DATABASE_TYPE === "postgres") {
  delete projectConfig["database_database"];
}

module.exports = {
  projectConfig,
  plugins,
  modules,
  featureFlags: {
    product_categories: true,
  },
};
