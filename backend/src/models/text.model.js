import mongoose, { Schema } from "mongoose";

const textSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    inputText: {
      type: String,
      required: true,
      trim: true,
    },
    correctedText: {
      type: String,
      trim: true,
    },
    suggestions: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Text = mongoose.model("Text", textSchema);
