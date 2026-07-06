import { pool } from "../../config/connectDB";
import { GoogleUser, User } from "./user.types";

type CreateGoogleUserInput = Required<Pick<GoogleUser, "googleId" | "email">> &
  GoogleUser;

export const findUserByGoogleId = async (
  googleId: string,
): Promise<User | null> => {
  console.log("[User Repository] Finding user by Google ID", { googleId });

  const result = await pool.query(
    `
        SELECT users.*
        FROM users
        JOIN oauth_accounts 
        ON oauth_accounts.user_id = users.id
        WHERE oauth_accounts.provider = $1 
        AND oauth_accounts.provider_user_id = $2
        `,
    ["google", googleId],
  );

  console.log("[User Repository] User lookup completed", {
    found: result.rows.length > 0,
  });

  return result.rows[0] || null;
};

export const createUserWithGoogleAccount = async (
  data: CreateGoogleUserInput,
): Promise<User> => {
  console.log("[User Repository] Creating user with Google account", {
    email: data.email,
    googleId: data.googleId,
  });

  const client = await pool.connect();
  try {
    console.log("[User Repository] Starting database transaction");

    await client.query("BEGIN");

    const userResult = await client.query(
      `
            INSERT INTO users (email, name,avatar_url, email_verified)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (email)
            DO UPDATE SET 
                name = EXCLUDED.name,
                avatar_url = EXCLUDED.avatar_url,
                email_verified = EXCLUDED.email_verified,
                updated_at = NOW()
            RETURNING *   
            `,
      [
        data.email,
        data.name || null,
        data.avatarUrl || null,
        data.emailVerified || false,
      ],
    );

    const user = userResult.rows[0];

    console.log("[User Repository] User upserted", {
      userId: user.id,
      email: user.email,
    });

    await client.query(
      `
            INSERT INTO oauth_accounts (user_id, provider, provider_user_id, email)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (provider, provider_user_id) DO NOTHING
            `,
      [user.id, "google", data.googleId, data.email],
    );

    await client.query("COMMIT");

    console.log("[User Repository] Database transaction committed");

    return user;
  } catch (error) {
    console.error("[User Repository] Database transaction failed", error);

    await client.query("ROLLBACK");
    throw error;
  } finally {
    console.log("[User Repository] Releasing database client");

    client.release();
  }
};
