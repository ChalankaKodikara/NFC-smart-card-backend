import mongoose, { Document, Model, Schema } from "mongoose";

export enum Role {
  SUPER_ADMIN = "SUPER_ADMIN",
  CLIENT_ADMIN = "CLIENT_ADMIN",
}

export interface IUser extends Document {
  username: string;
  name?: string;
  email?: string;
  password: string;
  tenantId?: mongoose.Types.ObjectId | null;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    name: {
      type: String,
      trim: true,
      default: "",
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    password: {
      type: String,
      required: true,
    },

    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      default: null,
    },

    role: {
      type: String,
      enum: Object.values(Role),
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

/* SAFE EXPORT */
let User: Model<IUser>;

if (mongoose.models.User) {
  User = mongoose.models.User as Model<IUser>;
} else {
  User = mongoose.model<IUser>("User", userSchema);
}

export default User;
