import getBrowser from "../config/puppeteer";

const defaultProps = {
  width: 800,
  height: 500,
  zoom: 1,
};

const getHtml = ({
  width = 800,
  height = 500,
}: {
  width?: number;
  height?: number;
}) => {
  return `
  <html>
  <head>
  <style>
  * {
    margin: 0;
    padding: 0
  }
  
  body {
    width: ${width};
    height: ${height};
  }
  </style>
  </head>
  <body>
  <canvas id="canvas"></canvas>
  </body>
  </html>
  `;
};

interface ScreenshotProps {
  zoom?: number;
  renderContent: any;
  outputs?: string[];
}

export const screenshotCanvas = async ({
  zoom = defaultProps.zoom,
  outputs = ["pdf", "png"],
  renderContent,
}: ScreenshotProps) => {
  const scaledWidth = defaultProps.width * zoom;
  const scaledHeight = defaultProps.height * zoom;

  const browser = await getBrowser({
    width: scaledWidth,
    height: scaledHeight,
  });
  const page = await browser.newPage();
  await page.setContent(getHtml({ width: scaledWidth, height: scaledHeight }));
  await page.setViewport({
    isLandscape: false,
    deviceScaleFactor: zoom,
    width: scaledWidth,
    height: scaledHeight,
  });
  await page.addScriptTag({
    url: "https://cdnjs.cloudflare.com/ajax/libs/fabric.js/521/fabric.min.js",
  });
  await page.evaluate(
    (renderContent: any, width: any, height: any, zoom: any) => {
      // @ts-ignore
      const canvas = new fabric.Canvas("canvas", {
        width: 800,
        height: 500,
      });
      canvas.setZoom(zoom);
      canvas.setWidth(width);
      canvas.setHeight(height);
      canvas.loadFromJSON(renderContent, () => {
        canvas.renderAll();
      });
    },
    renderContent,
    scaledWidth,
    scaledHeight,
    zoom
  );
  await page.waitForNetworkIdle({ idleTime: 100 });
  let pdf, png, jpeg, webp;
  if (outputs.includes("png")) {
    png = await page.screenshot({
      type: "png",
      clip: {
        x: 0,
        y: 0,
        width: scaledWidth,
        height: scaledHeight,
      },
    });
  }

  if (outputs.includes("jpeg")) {
    png = await page.screenshot({
      type: "jpeg",
      clip: {
        x: 0,
        y: 0,
        width: scaledWidth,
        height: scaledHeight,
      },
      quality: 30,
    });
  }

  if (outputs.includes("webp")) {
    png = await page.screenshot({
      type: "webp",
      clip: {
        x: 0,
        y: 0,
        width: scaledWidth,
        height: scaledHeight,
      },
    });
  }

  if (outputs.includes("pdf")) {
    pdf = await page.pdf({
      landscape: false,
      printBackground: true,
      width: scaledWidth,
      height: scaledHeight,
    });
  }
  await page.close();
  return { png, pdf, jpeg, webp };
};
