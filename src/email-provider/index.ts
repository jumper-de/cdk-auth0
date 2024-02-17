import { Construct } from "constructs";
import { CustomResource } from "aws-cdk-lib";

import { Auth0Props } from "../auth0-props";
import { Provider } from "./provider";

export interface CredentialsProps {
  readonly accessKeyId: string;
  readonly secretAccessKey: string;
  readonly region: string;
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
  readonly credentials: CredentialsProps;
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
