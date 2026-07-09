import { postgresPool } from "../config/postgres";
import { CreateGoogleUserInput, User } from "./user.types";

const mapPostgresUser = (row: Record<string, unknown>): User => {
  return {
    id: String(row.id),
    email: String(row.email),
    name: row.name ? String(row.name) : null,
    avatarUrl: row.avatar_url ? String(row.avatar_url) : null,
    emailVerified: Boolean(row.email_verified),
    createdAt: row.created_at as Date,
    updatedAt: row.updated_at as Date,
  };
};

export const findPostgresUserByGoogleId = async (
  googleId: string,
): Promise<User | null> => {
  console.log("[PostgreSQL User Model] Finding user by Google ID", {
    googleId,
  });

  const result = await postgresPool.query(
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

  console.log("[PostgreSQL User Model] User lookup completed", {
    found: result.rows.length > 0,
  });

  if (!result.rows[0]) {
    return null;
  }

  return mapPostgresUser(result.rows[0]);
};

export const createPostgresUserWithGoogleAccount = async (
  data: CreateGoogleUserInput,
): Promise<User> => {
  console.log("[PostgreSQL User Model] Creating user with Google account", {
    email: data.email,
    googleId: data.googleId,
  });

  const client = await postgresPool.connect();

  try {
    console.log("[PostgreSQL User Model] Starting database transaction");

    await client.query("BEGIN");

    const userResult = await client.query(
      `
      INSERT INTO users (email, name, avatar_url, email_verified)
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

    console.log("[PostgreSQL User Model] User upserted", {
      userId: user.id,
      email: user.email,
    });

    await client.query(
      `
      INSERT INTO oauth_accounts (user_id, provider, provider_user_id, email)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (provider, provider_user_id)
      DO NOTHING
      `,
      [user.id, "google", data.googleId, data.email],
    );

    await client.query("COMMIT");

    console.log("[PostgreSQL User Model] Database transaction committed");

    return mapPostgresUser(user);
  } catch (error) {
    console.error("[PostgreSQL User Model] Database transaction failed", error);

    await client.query("ROLLBACK");
    throw error;
  } finally {
    console.log("[PostgreSQL User Model] Releasing database client");
    client.release();
  }
};
