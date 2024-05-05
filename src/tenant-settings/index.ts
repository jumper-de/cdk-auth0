import { Construct } from "constructs";
import { CustomResource, Duration } from "aws-cdk-lib";

import { Auth0Props } from "../auth0-props";
import { Provider } from "./provider";

export interface ChangePasswordProps {
  /**
   * Whether to use the custom change password HTML (true) or the default Auth0 page (false).
   * @default false
   */
  readonly enabled?: boolean;
  /**
   * Custom change password HTML (Liquid syntax supported).
   */
  readonly html?: string;
}

export interface DeviceFlowProps {
  /**
   * Character set used to generate a User Code. Can be base20 or digits.
   * @default base20
   */
  readonly charset?: "base20" | "digits";
  /**
   * Mask used to format a generated User Code into a friendly, readable format.
   */
  readonly mask?: string;
}

export interface GuardianMfaPageProps {
  /**
   * Whether to use the custom Guardian HTML (true) or the default Auth0 page (false).
   * @default false
   */
  readonly enabled?: boolean;
  /**
   * Custom Guardian HTML (Liquid syntax is supported).
   */
  readonly html?: string;
}

export interface ErrorPageProps {
  /**
   * Custom Error HTML (Liquid syntax is supported).
   */
  readonly html?: string;
  /**
   * Whether to show the link to log as part of the default error page
   * (true) or not to show the link (false).
   * @default true
   */
  readonly showLogLink?: boolean;
  /**
   * URL to redirect to when an error occurs instead of showing the default error page.
   * @format absolute-uri-or-empty
   */
  readonly url?: string;
}

export interface FlagsProps {
  /**
   * Whether all current connections should be enabled when a new client (application) is created (true) or not (false).
   * @default true
   */
  readonly enableClientConnections?: boolean;
  /**
   * Whether the APIs section is enabled (true) or disabled (false).
   */
  readonly enableApisSection?: boolean;
  /**
   * Whether advanced API Authorization scenarios are enabled (true) or disabled (false).
   */
  readonly enablePipeline2?: boolean;
  /**
   * Whether third-party developers can dynamically register applications for your APIs (true) or not (false). This flag enables dynamic client registration.
   */
  readonly enableDynamicClientRegistration?: boolean;
  /**
   * Whether emails sent by Auth0 for change password, verification etc. should use your verified custom domain (true) or your auth0.com sub-domain (false). Affects all emails, links, and URLs. Email will fail if the custom domain is not verified.
   */
  readonly enableCustomDomainInEmails?: boolean;
  /**
   * Whether the public sign up process shows a user_exists error (true) or a generic error (false) if the user already exists.
   */
  readonly enableLegacyProfile?: boolean;
  /**
   * Whether users are prompted to confirm log in before SSO redirection (false) or are not prompted (true).
   */
  readonly enableSso?: boolean;
  /**
   * Whether classic Universal Login prompts include additional security headers to prevent clickjacking (true) or no safeguard (false).
   */
  readonly disableClickjackProtectionHeaders?: boolean;
  /**
   * Do not Publish Enterprise Connections Information with IdP domains on the lock configuration file.
   */
  readonly noDiscloseEnterpriseConnections?: boolean;
  /**
   * If true, SMS phone numbers will not be obfuscated in Management API GET calls.
   */
  readonly disableManagementApiSmsObfuscation?: boolean;
  /**
   * Enforce client authentication for passwordless start.
   */
  readonly enforceClientAuthenticationOnPasswordlessStart?: boolean;
  /**
   * Changes email_verified behavior for Azure AD/ADFS connections when enabled. Sets email_verified to false otherwise.
   */
  readonly trustAzureAdfsEmailVerifiedConnectionProperty?: boolean;
  /**
   * Enables the email verification flow during login for Azure AD and ADFS connections.
   */
  readonly enableAdfsWaadEmailVerification?: boolean;
  /**
   * Delete underlying grant when a Refresh Token is revoked via the Authentication API.
   */
  readonly revokeRefreshTokenGrant?: boolean;
  /**
   * Enables beta access to log streaming changes.
   */
  readonly dashboardLogStreamsNext?: boolean;
  /**
   * Enables new insights activity page view.
   */
  readonly dashboardInsightsView?: boolean;
  /**
   * Disables SAML fields map fix for bad mappings with repeated attributes.
   */
  readonly disableFieldsMapFix?: boolean;
  /**
   * Used to allow users to pick what factor to enroll of the available MFA factors.
   */
  readonly mfaShowFactorListOnEnrollment?: boolean;
}

export interface TenantSettingsProps extends Auth0Props {
  /**
   * Change Password page customization.
   */
  readonly changePassword?: ChangePasswordProps;
  /**
   * Device Flow configuration.
   */
  readonly deviceFlow?: DeviceFlowProps;
  /**
   * Guardian page customization.
   */
  readonly guardianMfaPage?: GuardianMfaPageProps;
  /**
   * Default audience for API Authorization.
   */
  readonly defaultAudience?: string;
  /**
   * Name of connection used for password grants at the /token endpoint. The
   * following connection types are supported: LDAP, AD, Database Connections,
   * Passwordless, Windows Azure Active Directory, ADFS.
   */
  readonly defaultDirectory?: string;
  /**
   * Error page customization.
   */
  readonly errorPage?: ErrorPageProps;
  /**
   * Flags used to change the behavior of this tenant.
   */
  readonly flags?: FlagsProps;
  /**
   * Friendly name for this tenant.
   */
  readonly friendlyName?: string;
  /**
   * URL of logo to be shown for this tenant (recommended size: 150x150).
   */
  readonly pictureUrl?: string;
  /**
   * End-user support email.
   */
  readonly supportEmail?: string;
  /**
   * End-user support url.
   */
  readonly supportUrl?: string;
  /**
   * URLs that are valid to redirect to after logout from Auth0.
   */
  readonly allowedLogoutUrls?: string[];
  /**
   * The amount of time a session will stay valid.
   * @default 30 days
   */
  readonly sessionLifetime?: Duration;
  /**
   * The amount of time a session can be inactive before the user must log in again.
   * @default 3 days
   */
  readonly idleSessionLifetime?: Duration;
  /**
   * length: <= length <= 8
   * Selected sandbox version for the extensibility environment.
   */
  readonly sandboxVersion?: string;
  /**
   * The default absolute redirection uri, must be https.
   * @format absolute-https-uri-or-empty
   */
  readonly defaultRedirectionUri?: string;
  /**
   * Supported locales for the user interface.
   */
  readonly enabledLocales?: string[];
  /**
   * Session cookie configuration.
   */
  readonly sessionCookie?: "persistent" | "non-persistent";
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
        changePassword: props.changePassword,
        deviceFlow: props.deviceFlow,
        guardianMfaPage: props.guardianMfaPage,
        defaultAudience: props.defaultAudience,
        defaultDirectory: props.defaultDirectory,
        errorPage: props.errorPage,
        flags: props.flags,
        friendlyName: props.friendlyName,
        pictureUrl: props.pictureUrl,
        supportEmail: props.supportEmail,
        supportUrl: props.supportUrl,
        allowedLogoutUrls: props.allowedLogoutUrls,
        sessionLifetime,
        idleSessionLifetime,
        sandboxVersion: props.sandboxVersion,
        defaultRedirectionUri: props.defaultRedirectionUri,
        enabledLocales: props.enabledLocales,
        sessionCookie: props.sessionCookie,
      },
    });
  }
}
