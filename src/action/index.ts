import { Construct } from "constructs";
import { CustomResource, Names } from "aws-cdk-lib";
import { ISecret } from "aws-cdk-lib/aws-secretsmanager";

import { Auth0Props } from "../auth0-props";
import { Provider } from "./provider";

export interface ActionTriggerProps {
	/**
	 * An actions extensibility point.
	 */
	readonly id:
		| "post-login"
		| "credentials-exchange"
		| "login-post-identifier"
		| "signup-post-identifier"
		| "pre-user-registration"
		| "post-user-registration"
		| "post-change-password"
		| "send-phone-message"
		| "password-reset-post-challenge"
		| "custom-phone-provider"
		| "custom-email-provider"
		| "custom-token-exchange"
		| "event-stream"
		| "password-hash-migration";
	/**
	 * The version of a trigger.
	 */
	readonly version: "v1" | "v2" | "v3";
}

export interface ActionDependencyProps {
	/**
	 * The name of the npm module (e.g. lodash).
	 */
	readonly name: string;
	/**
	 *  The npm module version (e.g. 4.17.1).
	 */
	readonly version: string;
	/**
	 * An optional value used primarily for private npm registries.
	 */
	readonly registryUrl?: string;
}

export interface ActionSecretSourceProps {
	/**
	 * An [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/) secret
	 * to source the value from. The secret must hold a JSON object; the value
	 * of the `field` key is read at deploy time and stored in Auth0.
	 *
	 * The value is resolved once during deployment. If the secret rotates
	 * afterwards, Auth0 keeps the previously deployed value until the next
	 * deployment.
	 */
	readonly secret: ISecret;
	/**
	 * The key within the JSON `secret` whose value will be used.
	 */
	readonly jsonField?: string;
}

export interface ActionSecretProps {
	/**
	 * The name of the particular secret (e.g. `API_KEY`).
	 */
	readonly name: string;
	/**
	 * The plaintext value of the particular secret (e.g. `secret123`).
	 *
	 * @default - sourced from `fromSecret`
	 */
	readonly value: string | ActionSecretSourceProps;
}

export interface ActionProps extends Auth0Props {
	/**
	 * The name of an action.
	 * @default generated name
	 */
	readonly name?: string;
	/**
	 * The list of triggers that this action supports.
	 * At this time, an action can only target a single trigger at a time.
	 */
	readonly supportedTriggers: Array<ActionTriggerProps>;
	/**
	 * The source code of the action.
	 */
	readonly code: string;
	/**
	 * The list of third party npm modules, and their versions,
	 * that this action depends on.
	 */
	readonly dependencies?: Array<ActionDependencyProps>;
	/**
	 * The Node runtime
	 * @default `"node22"`
	 */
	readonly runtime?: "node18" | "node18-actions" | "node22";
	/**
	 * The list of secrets that are included in an action or a version of an action
	 */
	readonly secrets?: Array<ActionSecretProps>;
}

/**
 * @category Constructs
 */
export class Action extends CustomResource {
	public readonly supportedTriggers;
	public readonly actionId = this.getAttString("actionId");

	constructor(scope: Construct, id: string, props: ActionProps) {
		const referencedSecrets = (props.secrets || [])
			.map((v) => v.value)
			.filter((s) => typeof s !== "string")
			.map((v) => v.secret);

		super(scope, id, {
			resourceType: "Custom::Auth0Action",
			serviceToken: Provider.getOrCreate(
				scope,
				props.apiSecret,
				referencedSecrets,
			),
			properties: {
				secretName: props.apiSecret.secretName,
				name:
					props.name ||
					`${Names.uniqueResourceName(scope, {
						maxLength: 127 - id.length,
						allowedSpecialCharacters: "-",
						separator: "-",
					})}-${id}`,
				code: props.code,
				dependencies: props.dependencies,
				supportedTriggers: props.supportedTriggers,
				runtime: props.runtime || "node22",
				secrets: props.secrets?.map((s) => {
					if (typeof s.value === "string") {
						return {
							name: s.name,
							value: s.value,
						};
					} else {
						return {
							name: s.name,
							secretArn: s.value.secret.secretArn,
							jsonField: s.value.jsonField,
						};
					}
				}),
			},
		});

		this.supportedTriggers = props.supportedTriggers;
	}
}
