import * as functions from "firebase-functions";

// service
import { sendEmail } from "./service/email.service";
import { sendMessage } from "./service/slack.service";
import {
  sendCertificateEmail,
  updateCertificate,
  updateCertificateEmailStatus,
} from "./service/certificate.service";
import {
  takeCertificateScreenshot,
  takeTemplateScreenshot,
} from "./service/screenshot.service";

import { EmailModes, EmailStatus, EmailTemplates } from "./types/Email";

import * as cors from "cors";
import { env } from "./constants/env";

const corsHandler = cors({ origin: true });

const EMAIL = "driflys@gmail.com";

export const status = functions.https.onRequest((request, response) => {
  corsHandler(request, response, () => {
    if (request.method !== "GET") {
      response.status(404).send();
      return;
    }
    return response.status(200).send("Up & Running...");
  });
});

export const sendContactUsEmail = functions.https.onRequest(
  async (request, response) => {
    corsHandler(request, response, async () => {
      if (request.method !== "POST") {
        response.status(404).send();
        return;
      }
      const feedback = request.body;
      try {
        if (!feedback?.email) {
          response.status(404).json({ error: "No email was found" });
          return;
        }
        await sendEmail({
          mode: EmailModes.SIMPLE,
          props: {
            fromName: "Driflys",
            subject: "Contact Us Feedback",
            receivers: [EMAIL],
            body: JSON.stringify(feedback, null, 2),
          },
        });

        await sendEmail({
          mode: EmailModes.TEMPLATE,
          props: {
            receivers: [feedback.email],
            fromName: "Driflys",
            template: EmailTemplates.GENERAL_PURPOSE_EMAIL,
            params: {
              subject: `Thank you ${
                feedback.firstName || feedback.lastName || ""
              } for contacting Driflys.`,
              title: "Thank you for contacting Driflys.",
              name: feedback.firstName || feedback.lastName || "",
              body: `Thank you for contacting Driflys. We wanted to let you know that we've received your message. 
            We appreciate the time you have taken to contact us.If you would like to add anything to the initial 
            message, you can go on. Feel free to reply to this email anytime.`,
            },
          },
        });

        // send a message to slack channel
        await sendMessage(
          env.SLACK_WEBHOOK_PRE_LAUNCH_URL,
          `🙋‍♂️ ${feedback.firstName}(${feedback.email}) contacted Driflys. See contact@driflys.com for more info.`
        );

        functions.logger.info(
          "Successfully sent the contact us thank you email",
          { structuredData: true }
        );
        return response.json(feedback);
      } catch (err) {
        await sendMessage(
          env.SLACK_WEBHOOK_PRE_LAUNCH_URL,
          `🔴 ${feedback.firstName}(${
            feedback.email
          }) failed to contact Driflys.\nFeedback: ${JSON.stringify(
            feedback,
            null,
            2
          )}\nError: ${err}`
        );

        functions.logger.error(
          "Error occurred while sending the contact us thank you email",
          { structuredData: true }
        );
        return response.status(500).send(err);
      }
    });
  }
);

export const sendConnectingWithUsEmail = functions.https.onRequest(
  async (request, response) => {
    corsHandler(request, response, async () => {
      if (request.method !== "POST") {
        response.status(404).send();
        return;
      }
      const email = request.query?.email as string;

      try {
        if (!email) {
          response.status(404).json({ error: "No email was found" });
          return;
        }

        await sendEmail({
          mode: EmailModes.SIMPLE,
          props: {
            fromName: "Driflys",
            subject: "Pre Launch - Notify",
            receivers: [EMAIL],
            body: email,
          },
        });

        await sendEmail({
          mode: EmailModes.TEMPLATE,
          props: {
            fromName: "Driflys",
            template: EmailTemplates.GENERAL_PURPOSE_EMAIL,
            subject: `You’re on the waiting list. Welcome to Driflys.`,
            receivers: [email],
            params: {
              subject: `You're on the list! Welcome to Driflys.`,
              title: "Thank you for connecting with us",
              name: "",
              body: `Thank you very much for connecting with us. We are so excited to have you with
        us at the beginning of our journey. We highly appreciate the interest you have 
        shown in our all new certificate platform.  
        We are planning to launch as soon as possible and you will be notified just in time.
        If you have any questions, feel free to reply to this email anytime.`,
            },
          },
        });

        // send a message to slack channel
        await sendMessage(
          env.SLACK_WEBHOOK_PRE_LAUNCH_URL,
          `✨ New connection from ${email}`
        );

        functions.logger.info(
          "Successfully sent the connecting with us thank you email",
          { structuredData: true }
        );
        return response.send();
      } catch (err) {
        await sendMessage(
          env.SLACK_WEBHOOK_PRE_LAUNCH_URL,
          `🔴 ${email} failed to connect with Driflys.\nError: ${err}`
        );
        functions.logger.error(
          "Error occurred while sending the connecting with us thank you email",
          { structuredData: true }
        );
        return response.status(500).send(err);
      }
    });
  }
);

export const sendTransactionEmail = functions.https.onRequest(
  async (request, response) => {
    corsHandler(request, response, async () => {
      if (request.method !== "POST") {
        response.status(404).send();
        return;
      }

      try {
        const transaction = request.body;
        const res = await sendEmail({
          mode: EmailModes.TEMPLATE,
          props: transaction,
        });
        functions.logger.info("Successfully sent the transaction email", {
          structuredData: true,
        });
        return response.status(200).json(res);
      } catch (err) {
        functions.logger.error(
          "Error occurred while sending the transaction email",
          { structuredData: true }
        );
        return response.status(500).send(err);
      }
    });
  }
);

export const triggerCertificateEmailWebhookAction = functions.https.onRequest(
  async (request, response) => {
    corsHandler(request, response, async () => {
      try {
        functions.logger.info(`AWS SES Webhook body: ${request.body}`);
        await updateCertificateEmailStatus(request.body);
        return response.status(200).send();
      } catch (err) {
        functions.logger.error(
          `An error occurred while executing the email webhook action: ${err}`
        );
        return response.status(500).json(err);
      }
    });
  }
);

// export const screenshotCertificates = functions
//   .runWith({ memory: "1GB" })
//   .https.onRequest(async (request, response) => {
//     corsHandler(request, response, async () => {
//       if (request.method !== "POST") {
//         response.status(404).send();
//         return;
//       }
//       try {
//         const { userId, templateId, certificates } = request.body;
//         functions.logger.info(`Request Body: ${JSON.stringify(request.body)}`);
//         const res = await takeCertificateScreenshots({
//           userId,
//           templateId,
//           certificates,
//         });
//         response.status(200).json(res);
//       } catch (err) {
//         functions.logger.error(
//           `An error occurred while taking screenshots: ${err}`
//         );
//         response.status(500).send(err);
//       }
//     });
//   });

export const onCertificateCreate = functions
  .runWith({ memory: "1GB" })
  .firestore.document("/certificates/{certificateId}")
  .onCreate(async (snap, context) => {
    try {
      const certificateId = context.params.certificateId;
      const _certificate = snap.data();
      const userId = _certificate.userId;
      const templateId = _certificate.templateId;
      const emailTemplateId = _certificate.emailTemplateId;
      const certificate = { id: certificateId, ..._certificate };

      // take certificate screenshot & upload to the file storage
      const screenshotRes = await takeCertificateScreenshot({
        userId,
        templateId,
        certificate,
      });

      // send certificate to the relevant receiver via email
      const emailRes = await sendCertificateEmail({
        receiverEmail: _certificate.receiver.email,
        emailTemplateId: emailTemplateId,
        certificateId: certificateId,
      });
      functions.logger.info(
        `Email sent for certificate Id '${certificateId}': ${JSON.stringify(
          emailRes
        )}`
      );

      // update the certificate status to "screenshot taken" and "email sent" if no error occurred
      await updateCertificate({
        id: certificateId,
        image: screenshotRes?.image,
        pdf: screenshotRes?.pdf,
        emailStatus: EmailStatus.SENT,
        messageId: emailRes.MessageId,
      });

      return;
    } catch (err) {
      functions.logger.error(
        `An error occurred while executing onCertificateCreate event: ${err}`
      );
      return err;
    }
  });

export const onTemplateCreate = functions
  .runWith({ memory: "1GB" })
  .firestore.document("/templates/{templateId}")
  .onCreate(async (snap, context) => {
    try {
      const templateId = context.params.templateId;
      const template = snap.data();
      const userId = template.userId;
      const name = template.name;
      const content = template.content;
      await takeTemplateScreenshot({ templateId, name, content, userId });
      return;
    } catch (err) {
      functions.logger.error(
        `An error occurred while taking screenshots on template: ${err}`
      );
      return err;
    }
  });

export const onUserCreate = functions.firestore
  .document("/users/{userId}")
  .onCreate(async (snap, context) => {
    try {
      const userId = context.params.userId;
      const user = snap.data();
      const oAuth = user.oAuth;

      if (!oAuth && !oAuth?.id) {
        // send verification email to the user
      } else {
        // send welcome email to the user
      }

      // send a slack message
      await sendMessage(
        env.SLACK_WEBHOOK_LAUNCH_URL,
        `✨ New user ${user?.email} signUp. See the email for more details.`
      );

      // send an email to me
      await sendEmail({
        mode: EmailModes.SIMPLE,
        props: {
          fromName: "Driflys",
          subject: "Driflys - New user sign up",
          receivers: [EMAIL],
          body: `New user ${user?.email} sign up.\n${JSON.stringify(
            {
              id: userId,
              firstName: user?.firstName,
              lastName: user?.lastName,
              email: user?.email,
              plan: user?.plan,
              planDuration: user?.planDuration,
            },
            null,
            2
          )}`,
        },
      });
      return;
    } catch (err) {
      functions.logger.error(
        `An error occurred while executing onUserCreate event: ${err}`
      );
      return err;
    }
  });

export const onSendEmail = functions.pubsub
  .topic("email_topic")
  .onPublish((message, context) => {
    const data = message.json;
    functions.logger.info(`Received message: ${JSON.stringify(data)}`);
    return;
  });
