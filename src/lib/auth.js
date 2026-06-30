import dns from "node:dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { jwt } from "better-auth/plugins/jwt";

const client = new MongoClient(process.env.AUTH_DB_URI);
const db = client.db("kino_main");

export const auth = betterAuth({
  baseURL: process.env.REMOTE_CLIENTSIDE_BETTER_AUTH_URL || process.env.BETTER_AUTH_URL,

  emailAndPassword: {
    enabled: true,
  },

  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
      requireLocalEmailVerified: false,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false, //required: false — keeps Google OAuth registration from breaking since Google sign-in doesn't send a role.
        defaultValue: "buyer",
        input: true,
      },
      location: {
        required: false, //required: false — keeps Google OAuth registration from breaking since Google sign-in doesn't send a role.
        defaultValue: {country: "Bangladesh"},
        input: true,
      },
      contact: {
        type: "string",
        required: false, //required: false — keeps Google OAuth registration from breaking since Google sign-in doesn't send a role.
        defaultValue: "+880",
        input: true,
      },
    },
    changeEmail: {
      enabled: true,
      updateEmailWithoutVerification: true,
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },

  database: mongodbAdapter(db, {
    // Optional: if you don't provide a client, database transactions won't be enabled.
    client,
  }),

  databaseHooks: {
    user: {
      update: {
        before: async (data) => {
          // Prevent OAuth re-logins from overwriting an existing role.
          // New users still receive defaultValue "buyer" via the create path.
          // Role changes are handled by the Express PATCH /profile endpoint.
          const { role, ...safeData } = data;
          return { data: safeData };
        },
      },
    },
  },

  session: {
    cookieCache: {
      enabled: true,
      maxAge: 7 * 24 * 60 * 60,
      strategy: "jwt",
    },
  },

  trustedOrigins: [
    "http://localhost:3000",
    "https://kinomarkt.vercel.app",
    "https://kinomarkt-behind-the-scene.vercel.app"
  ],

  plugins: [
    jwt({
      jwt: {
        expirationTime: "7d",
        definePayload: async ({ user }) => ({
          id: user?.id,
          email: user?.email,
          name: user?.name,
          role: user?.role,
        })
      }
    })
  ],
});
