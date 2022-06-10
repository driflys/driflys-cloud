export enum EmailModes {
  SIMPLE = "SIMPLE",
  TEMPLATE = "TEMPLATE",
}

export type EmailMode = EmailModes.SIMPLE | EmailModes.TEMPLATE;

export enum EmailTemplates {
  CERTIFICATE_EMAIL = "CertificateEmail",
  VERIFICATION_EMAIL = "VerificationEmail",
  GENERAL_PURPOSE_EMAIL = "GeneralPurposeEmail",
}

export type EmailTemplateType =
  | EmailTemplates.CERTIFICATE_EMAIL
  | EmailTemplates.VERIFICATION_EMAIL
  | EmailTemplates.GENERAL_PURPOSE_EMAIL;

export interface EmailProps {
  mode: EmailMode;
  props: SimpleEmailProps | TemplateEmailProps;
}

export interface SimpleEmailProps {
  fromName: string;
  subject: string;
  body: string;
  receivers: string[];
}

export interface TemplateEmailProps {
  fromName: string;
  receivers: string[];
  template: EmailTemplateType;
  params?: {
    [key: string]: any;
  };
}

export interface BulkTemplateEmailProps {
  fromName: string;
  template: EmailTemplateType;
  default: any;
  versions: {
    receiver: string;
    params: {
      [key: string]: any;
    };
  }[];
}

export enum EmailStatus {
  PENDING = "PENDING",
  SENT = "SENT",
  DELIVERED = "DELIVERED",
  ERROR = "ERROR",
}
