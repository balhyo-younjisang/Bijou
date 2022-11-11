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
  //console.log(photo);
  const mainphotoUrl = photo.mainphotoUrl;
  const bigphotoUrl = photo.bigphotoUrl;
  const zipFileUrl = photo.zipFileUrl;
  try {
    fs.unlinkSync(mainphotoUrl)
  } catch (error) {
    if(error.code == 'ENOENT'){
        console.log("파일 삭제 Error 발생");
    }
  }
  try {
    fs.unlinkSync(bigphotoUrl)
  } catch (error) {
    if(error.code == 'ENOENT'){
        console.log("파일 삭제 Error 발생");
    }
  }
  try {
    fs.unlinkSync(zipFileUrl)
  } catch (error) {
    if(error.code == 'ENOENT'){
        console.log("파일 삭제 Error 발생");
    }
  }
  if (!photo) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  return res.render("edit", { pageTitle: `Edit:${photo.title}`, photo });
};

export const postEdit = async (req, res) => {
  const { id } = req.params;
  const { title, description, hashtags, price } = req.body;
  const { files } = req;
  const photo = await Photo.exists({_id:id})
  const photoData = await Photo.findById(photo._id);
  if (!photo) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  if(files) {
    await sharp(files['main'][0].path).resize({width:400, height:500}).toFile(`${files['main'][0].path}_resize`);
    await sharp(files['main'][0].path).resize({width:1000, height:1200}).toFile(`${files['main'][0].path}_big`);
    try {
        fs.unlinkSync(files['main'][0].path)
    } catch (error) {
      if(error.code == 'ENOENT'){
          console.log("파일 삭제 Error 발생");
      }
    }
  } 
  await Photo.findByIdAndUpdate(photo._id, {
    mainphotoUrl: files ? files['main'][0].path + '_resize' : photoData.mainphotoUrl,
    bigphotoUrl: files ? files['main'][0].path + '_big': photoData.bigphotoUrl,
    photosUrl: files ? files['photos'][0].path : photoData.photosUrl,
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
  const bigFileUrl = photoData.bigphotoUrl;
  const zipFileUrl = photoData.photosUrl;
  if(res.locals.isAdmin) {
    try {
      fs.unlinkSync(fileUrl)
      fs.unlinkSync(bigFileUrl)
      fs.unlinkSync(zipFileUrl)
    }  catch (error) { 
    if(error.code == 'ENOENT'){
        console.log("파일 삭제 Error 발생");
      }
    }
    await Photo.findByIdAndDelete(id);
    return res.redirect("/");
  }
  else {
    return res.status(404).render("404", {pageTitle : "Page not found"});
  }
};

export const handleWatch = async (req, res) => {
  const { id } = req.params;
  const photo = await Photo.findById(id);
  if (photo) {
    return res.render("watch", { pageTitle: photo.title, photo });
  }
  return res.status(404).render("404", { pageTitle: "Page not found." });
};

export const getUpload = async (req, res) => {
  return res.render("upload", { pageTitle: "Upload Photo" });
};

export const postUpload = async (req, res) => {
  const {
    body: { title, description, hashtags, price, mainphotoUrl },
    files,
  } = req;
  // let imagePath = `${file.path}`
  console.log(files['main'][0].path)
  await sharp(files['main'][0].path).resize({width:400, height:500}).toFile(`${files['main'][0].path}_resize`);
  await sharp(files['main'][0].path).resize({width:1000, height:1200}).toFile(`${files['main'][0].path}_big`);
  try {
      fs.unlinkSync(files['main'][0].path)
  } catch (error) {
    if(error.code == 'ENOENT'){
        console.log("파일 삭제 Error 발생");
    }
  }
  try {
    await Photo.create({
      mainphotoUrl: files['main'][0].path + '_resize',
      bigphotoUrl: files['main'][0].path + '_big',
      photosUrl: files['photos'][0].path, 
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