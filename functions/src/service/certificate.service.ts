import db from "../config/firebase";
import { FieldValue } from "firebase-admin/firestore";

import {
  EmailModes,
  EmailStatus,
  EmailTemplateLogoSize,
  EmailTemplateLogoSizes,
  EmailTemplates,
} from "../types/Email";
import { sendEmail } from "./email.service";

interface CertificateEmailProps {
  receiverEmail: string;
  emailTemplateId: string;
  certificateId: string;
}

interface UpdateCertificateProps {
  id: string;
  image: string;
  pdf: string;
  emailStatus: EmailStatus;
  messageId: string;
}

export const sendCertificateEmail = async ({
  receiverEmail,
  emailTemplateId,
  certificateId,
}: CertificateEmailProps) => {
  const emailTemplateSnap = await db
    .collection("emailTemplates")
    .doc(emailTemplateId)
    .get();
  if (!emailTemplateSnap.exists) throw new Error("Email template not found");
  const emailTemplate = emailTemplateSnap.data();

  return await sendEmail({
    mode: EmailModes.TEMPLATE,
    props: {
      fromName: emailTemplate?.fromName || "Driflys",
      template: EmailTemplates.CERTIFICATE_EMAIL,
      subject: "Driflys Certificate",
      body: emailTemplate?.body || "Hello,\nThis is your certificate",
      receivers: [receiverEmail],
      params: {
        subject: emailTemplate?.subject || "Driflys Certificate",
        title: emailTemplate?.title || "Here is your certificate",
        body: emailTemplate?.body || "Hello,\nThis is your certificate",
        certificate: {
          id: certificateId,
          url: {
            display: emailTemplate?.url?.display ? "initial" : "none",
            text: "https://driflys.com/certificates/" + certificateId,
          },
        },
        button: {
          text: emailTemplate?.button?.text || "View",
          color: emailTemplate?.button?.color || "#1D4ED8",
        },
        brand: {
          name: emailTemplate?.brand?.name || "Driflys",
          logo: {
            src:
              emailTemplate?.brand?.logo?.src ||
              "https://res.cloudinary.com/driflys/image/upload/v1651332442/logos/Logo_Horizontal_-_No_Slogan.png",
            width: getEmailTemplateLogoSize(emailTemplate?.brand?.logo?.size)
              .width,
            height: getEmailTemplateLogoSize(emailTemplate?.brand?.logo?.size)
              .height,
          },
          address: emailTemplate?.brand?.address || "Matale, Sri Lanka",
        },
      },
    },
  });
};

export const updateCertificate = async ({
  id,
  image,
  pdf,
  emailStatus,
  messageId,
}: UpdateCertificateProps) => {
  const snap = await db.collection("certificates").doc(id).get();
  if (!snap.exists) throw new Error("Certificate does not exist");
  const certificate = snap.data();

  const trace = {
    status: emailStatus,
    timestamp: FieldValue.serverTimestamp(),
  };

  await db
    .collection("certificates")
    .doc(id)
    .update({
      media: {
        image,
        pdf,
      },
      email: {
        messageId: messageId,
        status: emailStatus,
        traces: [trace, ...certificate?.email?.traces],
      },
    });
};

export const updateCertificateEmailStatus = async (props: any) => {
  if (props.Type === "Notification") {
    const msg = JSON.parse(props.Message);
    const messageId = msg.mail.messageId;

    let emailStatus: EmailStatus;
    let error: string = "";

    switch (msg.notificationType) {
      case "Delivery":
        emailStatus = EmailStatus.DELIVERED;
        break;

      case "Send":
        emailStatus = EmailStatus.SENT;
        break;

      case "Complaint":
        emailStatus = EmailStatus.ERROR;
        error = "Complaint";
        break;

      case "Bounce":
        emailStatus = EmailStatus.ERROR;
        error =
          "Email was not delivered to the receiver. Probably the email address doesn't exist, mail inbox of the receiver is full or email server outage.";
        break;

      default:
        emailStatus = EmailStatus.SENT;
        break;
    }

    const snapshot = await db
      .collection("certificates")
      .where("email.messageId", "==", messageId)
      .get();
    if (snapshot.empty || snapshot.docs.length === 0)
      throw new Error("Certificate does not exist");
    const certificateId = snapshot.docs[0].id;
    const certificate = snapshot.docs[0].data();

    // update the relevant fields in certificate doc
    await db
      .collection("certificates")
      .doc(certificateId)
      .update({
        email: {
          status: emailStatus,
          error: error,
          traces: [
            { status: emailStatus, timestamp: FieldValue.serverTimestamp() },
            ...certificate?.traces,
          ],
        },
      });
  }
};

const getEmailTemplateLogoSize = (
  size: EmailTemplateLogoSize
): { width: string; height: string } => {
  switch (size) {
    case EmailTemplateLogoSizes.SMALL:
      return { width: "80px", height: "40px" };
    case EmailTemplateLogoSizes.MEDIUM:
      return { width: "150px", height: "50px" };
    case EmailTemplateLogoSizes.LARGE:
      return { width: "250px", height: "80px" };
    default:
      return { width: "150px", height: "50px" };
  }
};