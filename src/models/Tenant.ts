import mongoose, { Document, Model, Schema } from "mongoose";

export type TenantStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export interface ITenant extends Document {
  companyName: string;
  slug: string;
  status: TenantStatus;
  createdAt: Date;
  updatedAt: Date;
}

const tenantSchema = new Schema<ITenant>(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "SUSPENDED"],
      default: "ACTIVE",
    },
  },
  { timestamps: true },
);

/* SAFE EXPORT */
let Tenant: Model<ITenant>;

if (mongoose.models.Tenant) {
  Tenant = mongoose.models.Tenant as Model<ITenant>;
} else {
  Tenant = mongoose.model<ITenant>("Tenant", tenantSchema);
}

export default Tenant;
