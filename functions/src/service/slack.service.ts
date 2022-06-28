import axios from "axios";

require("dotenv").config();

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || "";

export const sendMessage = async (message: string) => {
  return await axios.post(SLACK_WEBHOOK_URL, { text: message });
};
