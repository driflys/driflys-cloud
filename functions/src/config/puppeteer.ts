import * as puppeteer from "puppeteer";
import { Browser } from "puppeteer";

interface BrowserProps {
  width?: number;
  height?: number;
}

let browser: Browser;
const getBrowser = async ({
  width = 800,
  height = 500,
}: BrowserProps): Promise<Browser> => {
  if (!browser)
    browser = await puppeteer.launch({
      headless: true,
      args: ["--disable-dev-shm-usage", "--no-sandbox", "--disable-gpu"],
      defaultViewport: { width, height },
    });
  return browser;
};

export default getBrowser;
