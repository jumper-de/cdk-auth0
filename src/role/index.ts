import { CustomResource, Names } from "aws-cdk-lib";
import { Provider } from "./provider";
import { Auth0Props } from "../auth0-props";
import { Construct } from "constructs";

export interface RoleProps extends Auth0Props {
  /**
   * Name of the role.
   */
  readonly name?: string;
  /**
   * Description of the role
   */
  readonly description?: string;
}

export class Role extends CustomResource {
  public readonly roleId = this.getAttString('roleId');

  constructor(scope: Construct, id: string, props: RoleProps) {
    super(scope, id, {
      resourceType: "Custom::Auth0Client",
      serviceToken: Provider.getOrCreate(scope, props.apiSecret),
      properties: {
        secretName: props.apiSecret.secretName,
        name: props.name ||
          `${Names.uniqueResourceName(scope, {
            maxLength: 127 - id.length,
            allowedSpecialCharacters: "-",
            separator: "-",
          })}-${id}`,
        description: props.description
      }
    });
  }
}