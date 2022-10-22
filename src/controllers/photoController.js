import Photo from "../models/Photo";

export const home = async (req, res) => {
  const photos = await Photo.find({});
  //console.log(photos);
  return res.render("home", { pageTitle: "Home", photos });
};

export const getEdit = async (req, res) => {
  const { id } = req.params;
  const photo = await Photo.findById(id);
  if (!photo) {
    return res.render("404", { pageTitle: "Video not found." });
  }
  return res.render("edit", { pageTitle: `Edit:${photo.title}`, photo });
};

export const postEdit = async (req, res) => {
  //console.log(req);
  const { id } = req.params;
  const { title, description, hashtags, price, main } = req.body;
  //console.log(req.body);
  const { file } = req;
  const photo = await Photo.exists({ _id: id });
  if (!photo) {
    return res.render("404", { pageTitle: "Video not found." });
  }
  await Photo.findByIdAndUpdate(id, {
    mainphotoUrl: file ? file.path : main,
    title,
    description,
    hashtags: Photo.formatHashtags(hashtags),
    price,
  });
  return res.redirect(`/`);
};

export const deletePhoto = async (req, res) => {
  const { id } = req.params;
  await Photo.findByIdAndDelete(id);
  return res.redirect("/");
};

export const handleWatch = async (req, res) => {
  const { id } = req.params;
  const photo = await Photo.findById(id);
  if (photo) {
    return res.render("watch", { pageTitle: photo.title, photo });
  }
  return res.render("404", { pageTitle: "Photo not found." });
};

export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "Upload Photo" });
};

export const postUpload = async (req, res) => {
  const {
    body: { title, description, hashtags, price, mainphotoUrl },
    file,
  } = req;
  //console.log(file);
  try {
    await Photo.create({
      mainphotoUrl: file.path,
      title,
      description,
      hashtags: Photo.formatHashtags(hashtags),
      price,
    });
    return res.redirect("/");
  } catch (error) {
    return res.render("upload", {
      pageTitle: "Upload Photo",
      errorMessage: error._message,
    });
  }
};

export const search = async (req, res) => {
  const { keyword } = req.query;
  let photos = [];
  if (keyword) {
    photos = await Photo.find({
      $or: [
        {
          title: {
            $regex: new RegExp(keyword, "i"),
          },
        },
        {
          hashtags: {
            $regex: new RegExp(`#${keyword}`, "i"),
          },
        },
      ],
    });
  }
  return res.render("search", { pageTitle: "Search", photos });
};
