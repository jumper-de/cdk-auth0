import { Construct } from "constructs";
import { CustomResource, Duration } from "aws-cdk-lib";

import { Auth0Props } from "../auth0-props";
import { Provider } from "./provider";

export interface TenantSettingsProps extends Auth0Props {
  readonly friendlyName?: string;
  readonly pictureUrl?: string;
  readonly supportEmail?: string;
  readonly supportUrl?: string;
  readonly allowedLogoutUrls?: string[];
  readonly sessionLifetime?: Duration;
  readonly idleSessionLifetime?: Duration;
}

/**
 * @category Constructs
 */
export class TenantSettings extends CustomResource {
  constructor(scope: Construct, id: string, props: TenantSettingsProps) {
    super(scope, id, {
      resourceType: "Custom::Auth0Action",
      serviceToken: Provider.getOrCreate(scope, props.apiSecret),
      properties: {
        secretName: props.apiSecret.secretName,
        friendlyName: props.friendlyName,
        pictureUrl: props.pictureUrl,
        supportEmail: props.supportEmail,
        supportUrl: props.supportUrl,
        allowedLogoutUrls: props.allowedLogoutUrls,
        sessionLifetime: props.sessionLifetime?.toHours() || 72,
        idleSessionLifetime: props.idleSessionLifetime?.toHours() || 168,
      },
    });
  }
}
