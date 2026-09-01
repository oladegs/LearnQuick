// Stores authenticated product feedback without trusting identity fields from the browser.
import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    category: {
      type: String,
      enum: ["General", "Feature request", "Bug", "UI/UX", "AI quality", "Other"],
      default: "General",
    },
    subject: { type: String, trim: true, maxlength: 120, default: "" },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    rating: { type: Number, required: true, min: 1, max: 5 },
    status: {
      type: String,
      enum: ["new", "reviewed", "planned", "resolved"],
      default: "new",
    },
  },
  { timestamps: true },
);

feedbackSchema.index({ userId: 1, createdAt: -1 });

const Feedback = mongoose.model("Feedback", feedbackSchema);

export default Feedback;
