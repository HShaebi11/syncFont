import { passkey } from "@better-auth/passkey";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import {
  getAppOrigin,
  getAuthBaseUrl,
  getMarketingOrigin,
  getPasskeyRpId,
  isProductionAuth,
} from "@typefolio/core/auth/config";
import { getDb } from "@typefolio/core/db";
import {
  authAccount,
  authPasskey,
  authSession,
  authUser,
  authVerification,
} from "@typefolio/core/db/schema-auth";
import {
  sendResetPasswordEmail,
  sendVerifyEmail,
  sendWelcomeThanksEmail,
} from "@typefolio/core/send-emails";
import { deleteAllUserData } from "@typefolio/core/user-data";
import { ensureSubscriptionRow } from "@typefolio/core/entitlements";
import { getOrCreateUserLibrary } from "@typefolio/core/storage";

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim().replace(/^['"]|['"]$/g, "");
  if (!value) {
    throw new Error(`Missing ${name}`);
  }
  return value;
}

const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

export const auth = betterAuth({
  baseURL: getAuthBaseUrl(),
  secret: requiredEnv("BETTER_AUTH_SECRET"),
  trustedOrigins: [getAuthBaseUrl(), getAppOrigin(), getMarketingOrigin()],
  advanced: {
    useSecureCookies: isProductionAuth(),
  },
  database: drizzleAdapter(getDb(), {
    provider: "pg",
    schema: {
      user: authUser,
      session: authSession,
      account: authAccount,
      verification: authVerification,
      passkey: authPasskey,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendResetPasswordEmail({ to: user.email, resetUrl: url });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerifyEmail({ to: user.email, verifyUrl: url });
    },
    afterEmailVerification: async (user) => {
      await sendWelcomeThanksEmail({ to: user.email, name: user.name });
    },
  },
  socialProviders:
    googleClientId && googleClientSecret
      ? {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          },
        }
      : undefined,
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await ensureSubscriptionRow(user.id);
          await getOrCreateUserLibrary(user.id);
          if (user.emailVerified) {
            await sendWelcomeThanksEmail({ to: user.email, name: user.name });
          }
        },
      },
    },
  },
  user: {
    deleteUser: {
      enabled: true,
      beforeDelete: async (user) => {
        await deleteAllUserData(user.id);
      },
    },
  },
  plugins: [
    passkey({
      rpID: getPasskeyRpId(),
      rpName: "Typefolio",
      origin: getAuthBaseUrl(),
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
