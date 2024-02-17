import { Construct } from "constructs";
import { Duration } from "aws-cdk-lib";
import {
  Runtime,
  ParamsAndSecretsLayerVersion,
  ParamsAndSecretsVersions,
  Architecture,
} from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import type { ENV_DEFAULT } from "./../../environment";
import { join } from "path";

export interface ENV extends ENV_DEFAULT {
  PARAMETERS_SECRETS_EXTENSION_HTTP_PORT: string;
}

export class OnEventHandler extends NodejsFunction {
  constructor(scope: Construct, id: string) {
    super(scope, id, {
      entry: join(
        __dirname,
        "../../../src/resource-server/on-event-handler/handler.ts",
      ),
      runtime: Runtime.NODEJS_18_X,
      architecture: Architecture.ARM_64,
      timeout: Duration.seconds(10),
      logRetention: RetentionDays.ONE_WEEK,
      paramsAndSecrets: ParamsAndSecretsLayerVersion.fromVersion(
        ParamsAndSecretsVersions.V1_0_103,
      ),
      bundling: {
        minify: true,
        sourcesContent: false,
        externalModules: ["@aws-sdk"],
      },
    });
  }
}
