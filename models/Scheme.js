import mongoose from "mongoose";

const SchemeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    schemeName: { type: String, required: true },
    category: { type: String, required: true },
    ministry: { type: String, required: true },
    state: { type: String, required: true },
    targetGroups: [{ type: String }],
    eligibility: { type: String },
    benefits: { type: String },
    documentsRequired: [{ type: String }],
    applyLink: { type: String },
    description: { type: String },
    languageSupport: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.models.Scheme || mongoose.model("Scheme", SchemeSchema);





