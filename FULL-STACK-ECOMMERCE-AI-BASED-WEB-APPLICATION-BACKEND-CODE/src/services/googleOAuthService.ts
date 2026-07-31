import { OAuth2Client } from "google-auth-library";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { database } from "../database/db.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { IUser } from "../types/index.js";

export interface GoogleProfile {
  googleId: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

export const getGoogleClient = (): OAuth2Client => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new ErrorHandler("Google sign-in is not configured on the server.", 500);
  }
  return new OAuth2Client(clientId, clientSecret, redirectUri);
};

/** Builds the Google consent-screen URL for the redirect flow. */
export const buildGoogleAuthUrl = (state: string): string => {
  const client = getGoogleClient();
  return client.generateAuthUrl({
    access_type: "online",
    scope: ["openid", "email", "profile"],
    state,
    prompt: "select_account",
  });
};

/** Exchanges the authorization code and returns the verified Google profile. */
export const getGoogleProfile = async (code: string): Promise<GoogleProfile> => {
  const client = getGoogleClient();
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);
  if (!tokens.id_token) {
    throw new ErrorHandler("Google returned no identity token.", 400);
  }
  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.GOOGLE_CLIENT_ID!,
  });
  const payload = ticket.getPayload();
  if (!payload || !payload.email) {
    throw new ErrorHandler("Google did not return a valid profile.", 400);
  }
  return {
    googleId: payload.sub ?? "",
    email: payload.email,
    name: payload.name || payload.email.split("@")[0],
    avatarUrl: payload.picture,
  };
};

/**
 * Finds the user by google_id, links an existing account by email, or creates
 * a new account with an unguessable password (password login stays disabled).
 */
export const findOrCreateGoogleUser = async (profile: GoogleProfile): Promise<IUser> => {
  const avatar = profile.avatarUrl ? { url: profile.avatarUrl } : null;

  const byGoogle = await database.query<IUser>(
    "SELECT * FROM users WHERE google_id = $1 LIMIT 1",
    [profile.googleId]
  );
  if (byGoogle.rows[0]) return byGoogle.rows[0];

  const byEmail = await database.query<IUser>(
    "SELECT * FROM users WHERE email = $1 LIMIT 1",
    [profile.email]
  );
  if (byEmail.rows[0]) {
    const linked = await database.query<IUser>(
      "UPDATE users SET google_id = $1, avatar = COALESCE(avatar, $2) WHERE id = $3 RETURNING *",
      [profile.googleId, avatar, byEmail.rows[0].id]
    );
    return linked.rows[0];
  }

  const randomPassword = crypto.randomBytes(32).toString("hex");
  const hashedPassword = await bcrypt.hash(randomPassword, 10);
  const created = await database.query<IUser>(
    "INSERT INTO users (name, email, password, google_id, avatar) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [profile.name, profile.email, hashedPassword, profile.googleId, avatar]
  );
  return created.rows[0];
};
