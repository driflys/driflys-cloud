// if the server was started in dev mode, then the below code block will execute
// and load values from .env file
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

export const env = {
  PORT: process.env.PORT || "5001",
  VERSION: process.env.VERSION || "v1",

  GOOGLE_APPLICATION_CREDENTIALS:
    process.env.GOOGLE_APPLICATION_CREDENTIALS || "",

  CLOUDINARY_URL: process.env.CLOUDINARY_URL || "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",

  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || "",
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || "",
  AWS_REGION: process.env.AWS_REGION || "",

  RABBITMQ_HOST: process.env.RABBITMQ_HOST || "localhost",
  RABBITMQ_PORT: process.env.RABBITMQ_PORT || "5672",
  RABBITMQ_USERNAME: process.env.RABBITMQ_USERNAME || "",
  RABBITMQ_PASSWORD: process.env.RABBITMQ_PASSWORD || "",

  LANDING_BASE_URL: process.env.LANDING_BASE_URL || "http://localhost:3002",
  APP_BASE_URL: process.env.APP_BASE_URL || "http://localhost:3000",
  BUILDER_BASE_URL: process.env.BUILDER_BASE_URL || "http://localhost:3001",
  API_BASE_URL: process.env.API_BASE_URL || "http://localhost:5000",
  JOB_SERVER_BASE_URL:
    process.env.JOB_SERVER_BASE_URL || "http://localhost:5001",

  SLACK_WEBHOOK_PRE_LAUNCH_URL: process.env.SLACK_WEBHOOK_PRE_LAUNCH_URL || "",
  SLACK_WEBHOOK_LAUNCH_URL: process.env.SLACK_WEBHOOK_LAUNCH_URL || "",
};
