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
  /**
   * The amount of time a session will stay valid
   * @default 30 days
   */
  readonly sessionLifetime?: Duration;
  /**
   * The amount of time a session can be inactive before the user must log in again
   * @default 3 days
   */
  readonly idleSessionLifetime?: Duration;
}

/**
 * @category Constructs
 */
export class TenantSettings extends CustomResource {
  constructor(scope: Construct, id: string, props: TenantSettingsProps) {
    const sessionLifetime = props.sessionLifetime?.toHours() || 336;
    const idleSessionLifetime = props.idleSessionLifetime?.toHours() || 72;

    if (sessionLifetime > 336) {
      throw new Error("sessionLifetime can't exceed 336 hours");
    }

    if (idleSessionLifetime > 72) {
      throw new Error("idleSessionLifetime can't exceed 72 hours");
    }

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
        sessionLifetime: props.sessionLifetime?.toHours() || 336,
        idleSessionLifetime: props.idleSessionLifetime?.toHours() || 72,
      },
    });
  }
}
