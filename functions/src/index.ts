import * as functions from "firebase-functions";

import { sendEmail } from "./email.service";
import { EmailModes, EmailTemplates } from "./types/Email";

import * as cors from "cors";
import { sendMessage } from "./slack.service";

const corsHandler = cors({ origin: true });

const EMAIL = "driflys@gmail.com";

export const status = functions.https.onRequest((request, response) => {
  corsHandler(request, response, () => {
    if (request.method !== "GET") {
      response.status(404).send();
      return;
    }
    response.status(200).send("Up & Running...");
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
          `🙋‍♂️ ${feedback.firstName}(${feedback.email}) contacted Driflys. See contact@driflys.com for more info.`
        );

        functions.logger.info(
          "Successfully sent the contact us thank you email",
          { structuredData: true }
        );
        response.json(feedback);
      } catch (err) {
        await sendMessage(
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
        response.status(500).send(err);
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
        await sendMessage(`✨ New connection from ${email}`);

        functions.logger.info(
          "Successfully sent the connecting with us thank you email",
          { structuredData: true }
        );
        response.send();
      } catch (err) {
        await sendMessage(
          `🔴 ${email} failed to connect with Driflys.\nError: ${err}`
        );
        functions.logger.error(
          "Error occurred while sending the connecting with us thank you email",
          { structuredData: true }
        );
        response.status(500).send(err);
      }
    });
  }
);
