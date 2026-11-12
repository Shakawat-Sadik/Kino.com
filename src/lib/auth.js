import dns from "node:dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { jwt } from "better-auth/plugins/jwt";

const client = new MongoClient(process.env.AUTH_DB_URI);
const db = client.db("kino_main");

// Every place a user's email is copied outside the `user` collection. Email is
// the ownership key across the backend (seller listings, orders, payments,
// reviews), so a changed email must be rewritten everywhere or the user loses
// access to their own data.
const EMAIL_REFERENCES = [
  ["products", "sellerEmail"],
  ["orders", "sellerEmail"],
  ["orders", "sellerInfo.email"],
  ["orders", "buyerInfo.email"],
  ["payments", "sellerEmail"],
  ["payments", "buyerEmail"],
  ["reviews", "buyerEmail"],
];

async function propagateEmailChange(oldEmail, newEmail) {
  const results = await Promise.allSettled(
    EMAIL_REFERENCES.map(([collection, field]) =>
      db.collection(collection).updateMany({ [field]: oldEmail }, { $set: { [field]: newEmail } }),
    ),
  );
  // Best-effort, like the backend's profile snapshot propagation: the email
  // change itself already succeeded, so failures are logged, not thrown.
  results.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error(
        `[auth] email propagation failed for ${EMAIL_REFERENCES[i].join(".")} (${oldEmail} → ${newEmail}):`,
        r.reason?.message,
      );
    }
  });
}

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
      mapProfileToUser: () => ({
        role: "buyer",
        contact: "+880",
        location: { country: "Bangladesh" },
      }),
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
          // Prevent OAuth re-logins from overwriting fields seeded by mapProfileToUser.
          // These fields are managed by the Express PATCH /profile endpoint instead.
          const { role, contact, location, ...safeData } = data;
          return { data: safeData };
        },
        after: async (user, ctx) => {
          // /change-email updates the user found by the *session's* email, so
          // inside this hook the session still holds the pre-change address.
          const oldEmail = ctx?.context?.session?.user?.email;
          if (!oldEmail || !user?.email || oldEmail === user.email) return;
          await propagateEmailChange(oldEmail, user.email);
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
