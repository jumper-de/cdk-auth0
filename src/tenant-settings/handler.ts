import type { CdkCustomResourceEvent } from "aws-lambda";
import { ManagementClient } from "auth0";

import type { ENV } from "./../lambda-base";
import { getSecretValue } from "./../get-secret-value";

declare global {
  namespace NodeJS {
    interface ProcessEnv extends ENV {}
  }
}

export async function handler(event: CdkCustomResourceEvent) {
  const auth0Api = JSON.parse(
    await getSecretValue(
      event.ResourceProperties.secretName,
      process.env.PARAMETERS_SECRETS_EXTENSION_HTTP_PORT,
      process.env.AWS_SESSION_TOKEN,
    ),
  );

  const auth0 = new ManagementClient({
    domain: auth0Api.domain,
    clientId: auth0Api.clientId,
    clientSecret: auth0Api.clientSecret,
  });

  switch (event.RequestType) {
    case "Create": {
      await auth0.tenants.updateSettings({
        friendly_name: event.ResourceProperties.friendlyName,
        picture_url: event.ResourceProperties.pictureUrl,
        support_email: event.ResourceProperties.supportEmail,
        support_url: event.ResourceProperties.supportUrl,
        allowed_logout_urls: event.ResourceProperties.allowedLogoutUrls,
        session_lifetime: Number(event.ResourceProperties.sessionLifetime),
        idle_session_lifetime: Number(
          event.ResourceProperties.idleSessionLifetime,
        ),
      });

      return {
        PhysicalResourceId: "tenantSettings",
      };
    }
    case "Update": {
      await auth0.tenants.updateSettings({
        friendly_name: event.ResourceProperties.friendlyName,
        picture_url: event.ResourceProperties.pictureUrl,
        support_email: event.ResourceProperties.supportEmail,
        support_url: event.ResourceProperties.supportUrl,
        allowed_logout_urls: event.ResourceProperties.allowedLogoutUrls,
        session_lifetime: Number(event.ResourceProperties.sessionLifetime),
        idle_session_lifetime: Number(
          event.ResourceProperties.idleSessionLifetime,
        ),
      });

      return {
        PhysicalResourceId: event.PhysicalResourceId,
      };
    }
    case "Delete": {
      return {
        PhysicalResourceId: event.PhysicalResourceId,
      };
    }
    default: {
      throw new Error("Invalid request type");
    }
  }
}
