import db from "./config/firebase";
import { upload } from "./utils/cloudinary";
import inject from "./utils/inject";
import { screenshotCanvas } from "./utils/screenshot";

export const takeCertificateScreenshots = async ({
  userId,
  templateId,
  certificates,
}: {
  userId: string;
  templateId: string;
  certificates: any[];
}) => {
  const templateSnapshot = await db
    .collection("templates")
    .doc(templateId)
    .get();
  if (!templateSnapshot) return;
  const template: any = templateSnapshot.data()?.content;

  const out: any[] = [];

  for (let i = 0; i < certificates?.length; i++) {
    const certificate = certificates[i];
    const injectedTemplate = inject(template, certificate);
    const { pdf, png } = await screenshotCanvas({
      zoom: 2,
      renderContent: injectedTemplate,
      outputs: ["pdf", "jpeg"],
    });
    const imgRes = await upload({
      path: `users/${userId}/certificates/${certificate.id}/image-${certificate.id}`,
      buffer: png as Buffer,
    });
    const pdfRes = await upload({
      path: `users/${userId}/certificates/${certificate.id}/pdf-${certificate.id}`,
      buffer: pdf as Buffer,
    });
    await db
      .collection("certificates")
      .doc(certificate.id)
      .update({
        media: {
          image: imgRes.secure_url,
          pdf: pdfRes.secure_url,
        },
      });
    out.push({
      certificateId: certificate.id,
      image: imgRes.secure_url,
      pdf: pdfRes.secure_url,
    });
  }
  return out;
};
