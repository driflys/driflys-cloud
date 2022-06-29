import * as functions from "firebase-functions";

import db from "../config/firebase";

// utils
import { upload } from "../utils/cloudinary";
import inject from "../utils/inject";
import { screenshotCanvas } from "../utils/screenshot";

export const takeCertificateScreenshot = async ({
  userId,
  templateId,
  certificate,
}: {
  userId: string;
  templateId: string;
  certificate: any;
}) => {
  const templateSnapshot = await db
    .collection("templates")
    .doc(templateId)
    .get();
  if (!templateSnapshot.exists) throw new Error("Template not found");
  const template: any = templateSnapshot.data()?.content;
  const injectedTemplate = inject(template, certificate);
  const { pdf, png } = await screenshotCanvas({
    zoom: 2,
    renderContent: injectedTemplate,
    outputs: ["pdf", "jpeg"],
  });
  functions.logger.info(`Took screenshot for ${certificate.id}`);
  const imgRes = await upload({
    path: `users/${userId}/certificates/${certificate.id}/image-${certificate.id}`,
    buffer: png as Buffer,
  });
  const pdfRes = await upload({
    path: `users/${userId}/certificates/${certificate.id}/pdf-${certificate.id}`,
    buffer: pdf as Buffer,
  });
  functions.logger.info(`Uploaded screenshot to Cloudinary`);

  return {
    image: imgRes.secure_url,
    pdf: pdfRes.secure_url,
  };
};

export const takeTemplateScreenshot = async ({
  templateId,
  name,
  content,
  userId,
}: {
  templateId: string;
  name: string;
  content: any;
  userId: string;
}) => {
  // take the screenshot
  const { png } = await screenshotCanvas({
    outputs: ["png"],
    renderContent: JSON.parse(content),
  });

  // upload the template image to the cloudinary
  const res = await upload({
    path: `users/${userId}/templates/${name}`,
    buffer: png as Buffer,
  });

  // update the db with the template image url
  await db.collection("templates").doc(templateId).update({
    image: res?.secure_url,
  });
};
