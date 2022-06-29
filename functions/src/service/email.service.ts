import {
  EmailModes,
  EmailProps,
  SimpleEmailProps,
  TemplateEmailProps,
} from "../types/Email";

import * as AWS from "aws-sdk";
import { PromiseResult } from "aws-sdk/lib/request";

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
  // console.log("Sent Simple Email", res);
  return res;
};

const sendTemplateEmail = async (
  props: TemplateEmailProps
): Promise<PromiseResult<AWS.SES.SendTemplatedEmailResponse, AWS.AWSError>> => {
  const obj = {
    Destination: {
      ToAddresses: props.receivers,
    },
    Source: `${props.fromName || "Driflys"} <${FROM_EMAIL}>`,
    Template: props.template,
    TemplateData: JSON.stringify(props.params),
    ConfigurationSetName: "DriflysEmailConfigSet",
    ReplyToAddresses: [REPLY_TO],
  };
  const ses = new AWS.SES({ apiVersion: "2010-12-01" });
  const res = await ses.sendTemplatedEmail(obj).promise();
  return res;
};
