import Photo from "../models/Photo";

export const home = async (req, res) => {
  const photos = await Photo.find({});
  return res.render("home", { pageTitle: "Home", photos: photos });
};

export const handleEdit = (req, res) => res.send("Edit photo");
export const handleDelete = (req, res) => res.send("Delete photo");
export const handleWatch = (req, res) => {
  const { id } = req.params;
  console.log("Show video", id);
  res.render("watch", { pageTitle: "Photo" });
};

export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "Upload Photo" });
};

export const postUpload = async (req, res) => {
  const { title, description, hashtags, price } = req.body;
  const photo = new Photo({
    title,
    description,
    hashtags: hashtags.split(",").map((word) => `#${word}`),
    price,
  });
  const dbPhoto = await photo.save();
  return res.redirect("/");
};
