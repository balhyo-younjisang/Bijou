import Photo from "../models/Photo";
import sharp from "sharp";
import fs from "fs";

export const home = async (req, res) => {
  const photos = await Photo.find({});
  //console.log(photos);
  return res.render("home", { pageTitle: "Home", photos });
};

export const getEdit = async (req, res, next) => {
  const { id } = req.params;
  const photo = await Photo.findById(id);
  if (!photo) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  return res.render("edit", { pageTitle: `Edit:${photo.title}`, photo });
};

export const postEdit = async (req, res) => {
  const { id } = req.params;
  const { title, description, hashtags, price } = req.body;
  const { file } = req;
  const photo = await Photo.exists({_id:id})
  const photoData = await Photo.findById(photo._id);
  if (!photo) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  if(file) {
    await sharp(file.path).resize({width:400, height:500}).toFile(`${file.path}_resize`);
    try {
        fs.unlinkSync(file.path)
    } catch (error) {
      if(error.code == 'ENOENT'){
          console.log("파일 삭제 Error 발생");
      }
    }
  } 
  await Photo.findByIdAndUpdate(photo._id, {
    mainphotoUrl: file ? file.path + '_resize' : photoData.mainphotoUrl,
    title,
    description,
    hashtags: Photo.formatHashtags(hashtags),
    price,
  });
  return res.redirect(`/`);
};

export const deletePhoto = async (req, res) => {
  const { id } = req.params;
  const photo = await Photo.exists({_id: id});
  const photoData = await Photo.findById(photo._id);
  const fileUrl = photoData.mainphotoUrl;
  try {
    fs.unlinkSync(fileUrl)
  }  catch (error) { 
  if(error.code == 'ENOENT'){
      console.log("파일 삭제 Error 발생");
    }
  }
  await Photo.findByIdAndDelete(id);
  return res.redirect("/");
};

export const handleWatch = async (req, res) => {
  const { id } = req.params;
  const photo = await Photo.findById(id);
  if (photo) {
    return res.render("watch", { pageTitle: photo.title, photo });
  }
  return res.status(404).render("404", { pageTitle: "Photo not found." });
};

export const getUpload = async (req, res) => {
  return res.render("upload", { pageTitle: "Upload Photo" });
};

export const postUpload = async (req, res) => {
  const {
    body: { title, description, hashtags, price, mainphotoUrl },
    file,
  } = req;
  // let imagePath = `${file.path}`
  console.log(file.path)
  await sharp(file.path).resize({width:400, height:500}).toFile(`${file.path}_resize`);
  try {
      fs.unlinkSync(file.path)
  } catch (error) {
    if(error.code == 'ENOENT'){
        console.log("파일 삭제 Error 발생");
    }
  }
  try {
    await Photo.create({
      mainphotoUrl: file.path + '_resize',
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
