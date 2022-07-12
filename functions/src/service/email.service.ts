import * as fs from "fs";

import {
  EmailConfigSets,
  EmailModes,
  EmailProps,
  EmailTemplates,
  EmailTemplateType,
  SimpleEmailProps,
  TemplateEmailProps,
} from "../types/Email";

import * as AWS from "aws-sdk";
import { PromiseResult } from "aws-sdk/lib/request";
import * as Handlebars from "handlebars";

const FROM_EMAIL = "no-reply@contact.driflys.com";
const REPLY_TO = "contact@driflys.com";

AWS.config.loadFromPath("aws-config.json");

export const sendEmail = async ({ mode, props }: EmailProps) => {
  if (mode === EmailModes.SIMPLE)
    return await sendSimpleEmail(props as SimpleEmailProps);
  return await sendTemplateEmail(props as TemplateEmailProps);
};

export const sendSimpleEmail = async (props: SimpleEmailProps) => {
  const params = {
    Destination: {
      ToAddresses: props.receivers,
    },
    Message: {
      Body: {
        Text: {
          Charset: "UTF-8",
          Data: props.body,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: props.subject,
      },
    },
    Source: `${props.fromName || "Driflys"} <${FROM_EMAIL}>`,
  };

  const ses = new AWS.SES({ apiVersion: "2010-12-01" });
  const res = await ses.sendEmail(params).promise();
  return res;
};

const sendTemplateEmail = async (
  props: TemplateEmailProps
): Promise<PromiseResult<AWS.SES.SendTemplatedEmailResponse, AWS.AWSError>> => {
  const params = {
    Destination: {
      ToAddresses: props.receivers,
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: getInjectedEmailTemplate(props.template, props.params),
        },
        Text: {
          Charset: "UTF-8",
          Data: props.params?.body ?? "This is the body in text format.",
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: props.params?.subject ?? "Driflys",
      },
    },
    ConfigurationSetName:
      props.configSet ?? EmailConfigSets.DRIFLYS_OTHER_EMAIL_CONFIG_SET,
    ReplyToAddresses: [REPLY_TO],
    Source: `${props.fromName || "Driflys"} <${FROM_EMAIL}>`,
  };
  const ses = new AWS.SES({ apiVersion: "2010-12-01" });
  const res = await ses.sendEmail(params).promise();
  return res;
};

const getInjectedEmailTemplate = (
  template: EmailTemplateType,
  data: any
): string => {
  let fileName: string;

  switch (template) {
    case EmailTemplates.CERTIFICATE_EMAIL:
      fileName = "emailTemplates/CertificateEmail.html";
      break;

    case EmailTemplates.GENERAL_PURPOSE_EMAIL:
      fileName = "emailTemplates/GeneralPurposeEmail.html";
      break;

    case EmailTemplates.VERIFICATION_EMAIL:
      fileName = "emailTemplates/GeneralPurposeEmail.html";
      break;

    default:
      throw new Error("Invalid email template");
  }

  const file = fs.readFileSync(fileName, "utf-8").toString();
  const handlebars = Handlebars.compile(file);
  const output = handlebars(data);
  return output;
};
