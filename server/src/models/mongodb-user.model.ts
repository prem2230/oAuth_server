import { Schema, model, models, Types } from "mongoose";
import { CreateGoogleUserInput, User } from "./user.types";

interface MongoUserDocument {
  _id: Types.ObjectId;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface MongoOAuthAccountDocument {
  userId: Types.ObjectId;
  provider: string;
  providerUserId: string;
  email: string;
}

const userSchema = new Schema<MongoUserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      default: null,
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const oauthAccountSchema = new Schema<MongoOAuthAccountDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    provider: {
      type: String,
      required: true,
    },
    providerUserId: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

oauthAccountSchema.index(
  {
    provider: 1,
    providerUserId: 1,
  },
  {
    unique: true,
  },
);

const MongoUserModel =
  models.User || model<MongoUserDocument>("User", userSchema);

const MongoOAuthAccountModel =
  models.OAuthAccount ||
  model<MongoOAuthAccountDocument>("OAuthAccount", oauthAccountSchema);

const mapMongoUser = (user: MongoUserDocument): User => {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name || null,
    avatarUrl: user.avatarUrl || null,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const findMongoUserByGoogleId = async (
  googleId: string,
): Promise<User | null> => {
  console.log("[MongoDB User Model] Finding user by Google ID", { googleId });

  const oauthAccount = await MongoOAuthAccountModel.findOne({
    provider: "google",
    providerUserId: googleId,
  });

  if (!oauthAccount) {
    console.log("[MongoDB User Model] OAuth account not found");
    return null;
  }

  const user = await MongoUserModel.findById(oauthAccount.userId);

  console.log("[MongoDB User Model] User lookup completed", {
    found: Boolean(user),
  });

  if (!user) {
    return null;
  }

  return mapMongoUser(user);
};

export const createMongoUserWithGoogleAccount = async (
  data: CreateGoogleUserInput,
): Promise<User> => {
  console.log("[MongoDB User Model] Creating user with Google account", {
    email: data.email,
    googleId: data.googleId,
  });

  const user = await MongoUserModel.findOneAndUpdate(
    {
      email: data.email,
    },
    {
      $set: {
        name: data.name || null,
        avatarUrl: data.avatarUrl || null,
        emailVerified: data.emailVerified || false,
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  );

  await MongoOAuthAccountModel.updateOne(
    {
      provider: "google",
      providerUserId: data.googleId,
    },
    {
      $setOnInsert: {
        userId: user._id,
        provider: "google",
        providerUserId: data.googleId,
        email: data.email,
      },
    },
    {
      upsert: true,
    },
  );

  console.log("[MongoDB User Model] User and OAuth account saved", {
    userId: user._id.toString(),
    email: user.email,
  });

  return mapMongoUser(user);
};
