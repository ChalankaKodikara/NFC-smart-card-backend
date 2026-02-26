import mongoose, { Schema, Document, Model } from "mongoose";

/* ===========================
   INTERFACES
=========================== */

export interface IPersonal {
  name?: string;
  slogan?: string;
  bio?: string;
  profileImage?: string;
}

export interface IContact {
  email?: string;
  phone?: string;
  location?: string;
}

export interface ISocialLink {
  platform: string;
  url: string;
}

export interface IExperience {
  position: string;
  company: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
  logo?: string;
}

export interface ICustomSection {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  images: string[];
}

export interface IProfile extends Document {
  tenantId: mongoose.Types.ObjectId; // 🔥 LINK TO TENANT
  userId: mongoose.Types.ObjectId; // 🔥 OWNER USER
  slug: string; // PUBLIC PROFILE SLUG
  personal: IPersonal;
  contact: IContact;
  social: {
    links: ISocialLink[];
  };
  experiences: IExperience[];
  customSections: ICustomSection[];
  createdAt: Date;
  updatedAt: Date;
}

/* ===========================
   SUB-SCHEMAS
=========================== */

const PersonalSchema = new Schema(
  {
    name: { type: String, default: "" },
    slogan: { type: String, default: "" },
    bio: { type: String, default: "" },
    profileImage: { type: String, default: "" },
  },
  { _id: false },
);

const ContactSchema = new Schema(
  {
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    location: { type: String, default: "" },
  },
  { _id: false },
);

const SocialLinkSchema = new Schema(
  {
    platform: { type: String, required: true },
    url: { type: String, required: true },
  },
  { _id: false },
);

const ExperienceSchema = new Schema(
  {
    position: { type: String, required: true },
    company: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String },
    isCurrent: { type: Boolean, default: false },
    description: { type: String, default: "" },
    logo: { type: String, default: "" },
  },
  { _id: false },
);

const CustomSectionSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: { type: String, default: "" },
    description: { type: String, default: "" },
    images: { type: [String], default: [] },
  },
  { _id: false },
);

/* ===========================
   MAIN SCHEMA
=========================== */

const profileSchema = new Schema<IProfile>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    personal: {
      type: PersonalSchema,
      default: {},
    },

    contact: {
      type: ContactSchema,
      default: {},
    },

    social: {
      links: {
        type: [SocialLinkSchema],
        default: [],
      },
    },

    experiences: {
      type: [ExperienceSchema],
      default: [],
    },

    customSections: {
      type: [CustomSectionSchema],
      default: [],
    },
  },
  { timestamps: true },
);

/* ===========================
   SAFE EXPORT
=========================== */

let Profile: Model<IProfile>;

if (mongoose.models.Profile) {
  Profile = mongoose.models.Profile as Model<IProfile>;
} else {
  Profile = mongoose.model<IProfile>("Profile", profileSchema);
}

export default Profile;
