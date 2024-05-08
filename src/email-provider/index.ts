import { Construct } from "constructs";
import { CustomResource } from "aws-cdk-lib";

import { Auth0Props } from "../auth0-props";
import { Provider } from "./provider";

/**
 * Azure requires connectionString
 */
export interface AzureCredentialsProps {
  readonly credType: "azure_cs";
  readonly connectionString: string;
}

/**
 * mandrill and sendgrid requires api_key
 */
export interface APIKeyCredentialsProps {
  readonly credType: "apikey";
  readonly apiKey: string;
}

/**
 * mailgun requires api_key and domain. Optionally, set region to eu to use the Mailgun service hosted in Europe;
 * set to null otherwise. eu or null are the only valid values for region.
 */
export interface MailGunCredentialsProps {
  readonly credType: "mailgun";
  readonly apiKey: string;
  readonly domain: string;
  readonly region?: "eu";
}

/**
 * Microsoft365 requires tenantId, clientId, and clientSecret
 */
export interface Microsoft365CredentialsProps {
  readonly credType: "ms365";
  readonly tenantId: string;
  readonly clientId: string;
  readonly clientSecret: string;
}

/**
 * ses requires accessKeyId, secretAccessKey, and region
 */
export interface SESCredentialsProps {
  readonly credType: "ses";
  readonly accessKeyId: string;
  readonly secretAccessKey: string;
  readonly region: string;
}

/**
 * smtp requires smtp_host, smtp_port, smtp_user, and smtp_pass
 */
export interface SMTPCredentialsProps {
  readonly credType: "smtp";
  readonly smtpHost: Array<string>;
  readonly smtpPort: number;
  readonly smtpUser: string;
  readonly smtpPassword: string;
}

/**
 * sparkpost requires api_key. Optionally, set region to eu to use the SparkPost service hosted in Western Europe;
 * set to null to use the SparkPost service hosted in North America. eu or null are the only valid values for region.
 */
export interface SparkPostCredentialsProps {
  readonly credType: "sparkpost";
  readonly apiKey: string;
  readonly region?: "eu";
}

export interface EmailProviderProps extends Auth0Props {
  readonly name:
    | "mailgun"
    | "mandrill"
    | "sendgrid"
    | "ses"
    | "sparkpost"
    | "smtp"
    | "azure_cs"
    | "ms365";
  readonly defaultFromAddress: string;
  readonly credentials:
    | APIKeyCredentialsProps
    | AzureCredentialsProps
    | MailGunCredentialsProps
    | Microsoft365CredentialsProps
    | SESCredentialsProps
    | SMTPCredentialsProps
    | SparkPostCredentialsProps;
}

/**
 * @category Constructs
 */
export class EmailProvider extends CustomResource {
  constructor(scope: Construct, id: string, props: EmailProviderProps) {
    super(scope, id, {
      resourceType: "Custom::EmailProvider",
      serviceToken: Provider.getOrCreate(scope, props.apiSecret),
      properties: {
        secretName: props.apiSecret.secretName,
        name: props.name,
        defaultFromAddress: props.defaultFromAddress,
        credentials: props.credentials,
      },
    });
  }
}
