import mongoose from "mongoose";

const photoSchema = new mongoose.Schema({
  mainphotoUrl: { type: String },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  hashtags: [{ type: String, trim: true }],
  price: Number,
});

photoSchema.static("formatHashtags", function (hashtags) {
  return hashtags
    .split(",")
    .map((word) => (word.startsWith("#") ? word : `#${word}`));
});

const Photo = mongoose.model("Photo", photoSchema);
export default Photo;
