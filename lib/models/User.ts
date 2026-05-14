import { Schema, models, model } from "mongoose";

const userSchema = new Schema(
  {
    clerkId: { type: String, required: true, unique: true, index: true },
    email: { type: String, default: "" },
    isPro: { type: Boolean, default: false },
    generationCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const User = models.User ?? model("User", userSchema);

export default User;
