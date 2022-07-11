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

export enum EmailTemplateLogoSizes {
  SMALL = "SMALL",
  MEDIUM = "MEDIUM",
  LARGE = "LARGE",
}

export type EmailTemplateLogoSize = keyof typeof EmailTemplateLogoSizes;

export interface EmailProps {
  mode: EmailMode;
  props: SimpleEmailProps | TemplateEmailProps;
}

export interface SimpleEmailProps {
  fromName: string;
  subject: string;
  body: string;
  receivers: string[];
  configSet?: EmailConfigSet;
}

export interface TemplateEmailProps {
  fromName: string;
  receivers: string[];
  template: EmailTemplateType;
  configSet?: EmailConfigSet;
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

export enum EmailConfigSets {
  DRIFLYS_CERTIFICATE_EMAIL_CONFIG_SET = "DriflysCertificateEmailConfigSet",
  DRIFLYS_OTHER_EMAIL_CONFIG_SET = "DriflysOtherEmailConfigSet",
}
export type EmailConfigSet =
  | EmailConfigSets.DRIFLYS_CERTIFICATE_EMAIL_CONFIG_SET
  | EmailConfigSets.DRIFLYS_OTHER_EMAIL_CONFIG_SET;
