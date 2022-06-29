import axios from "axios";

export const sendMessage = async (slackUrl: string, message: string) => {
  return await axios.post(slackUrl, { text: message });
};
