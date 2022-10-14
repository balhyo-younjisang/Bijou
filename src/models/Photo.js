import mongoose from "mongoose";

const photoSchema = new mongoose.Schema({
  title: String,
  description: String,
  hashtags: [{ type: String }],
  price: Number,
});

const Photo = mongoose.model("Photo", photoSchema);
export default Photo;
