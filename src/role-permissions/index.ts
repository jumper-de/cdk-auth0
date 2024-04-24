import { CustomResource } from "aws-cdk-lib";
import { Construct } from "constructs";
import { Auth0Props } from "../auth0-props";
import { Provider } from "./provider";

export interface RolePermissionsProps extends Auth0Props{
  /**
   * ID of the role to add permissions to.
   */
  readonly roleId: string;
  /**
   * array of resource_server_identifier, permission_name pairs.
   */
  readonly permissions: Array<PermissionProps>;
}

export interface PermissionProps {
  /**
   * Resource server (API) identifier that this permission is for.
   */
  readonly resourceServerIdentifier: string;
  /**
   * Name of this permission.
   */
  readonly permissionName: string;
}

export class RolePermissions extends CustomResource {

  constructor(scope: Construct, id: string, props: RolePermissionsProps) {
    super(scope, id, {
      resourceType: "Custom::Auth0Client",
      serviceToken: Provider.getOrCreate(scope, props.apiSecret),
      properties: {
        secretName: props.apiSecret.secretName,
        roleId: props.roleId,
        permissions: props.permissions || []
      }
    });
  }
}