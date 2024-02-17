import { Construct } from "constructs";
import { CustomResource } from "aws-cdk-lib";

import { Auth0Props } from "../auth0-props";
import { Provider } from "./provider";

export interface ActionTriggerProps {
  readonly id:
    | "post-login"
    | "credentials-exchange"
    | "pre-user-registration"
    | "post-user-registration"
    | "post-change-password"
    | "send-phone-message"
    | "iga-approval"
    | "iga-certification"
    | "iga-fulfillment-assignment"
    | "iga-fulfillment-execution"
    | "password-reset-post-challenge";
  readonly version: "v1" | "v2" | "v3";
}

export interface ActionDependencyProps {
  readonly name: string;
  readonly version: string;
  readonly registryUrl?: string;
}

export interface ActionSecretProps {
  readonly name: string;
  readonly value: string;
}

export interface ActionProps extends Auth0Props {
  readonly name: string;
  readonly code: string;
  readonly dependencies?: Array<ActionDependencyProps>;
  readonly supportedTriggers: Array<ActionTriggerProps>;
  readonly runtime: "node12" | "node16" | "node18";
  readonly secrets?: Array<ActionSecretProps>;
}

/**
 * @category Constructs
 */
export class Action extends CustomResource {
  public readonly supportedTriggers;
  public readonly actionId = this.getAttString("actionId");

  constructor(scope: Construct, id: string, props: ActionProps) {
    super(scope, id, {
      resourceType: "Custom::Auth0Action",
      serviceToken: Provider.getOrCreate(scope, props.apiSecret),
      properties: {
        secretName: props.apiSecret.secretName,
        name: props.name,
        code: props.code,
        dependencies: props.dependencies,
        supportedTriggers: props.supportedTriggers,
        runtime: props.runtime,
        secrets: props.secrets,
      },
    });

    this.supportedTriggers = props.supportedTriggers;
  }
}
