import Photo from "../models/Photo";
import User from "../models/User";
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
  const mainphotoUrl = photo.mainphotoUrl;
  const bigphotoUrl = photo.bigphotoUrl;
  const photosUrl = photo.photosUrl;
  try {
    fs.unlinkSync(mainphotoUrl)
  } catch (error) {
    if (error.code == 'ENOENT') {
      console.log("파일 삭제 Error 발생");
    }
  }
  try {
    fs.unlinkSync(bigphotoUrl)
  } catch (error) {
    if (error.code == 'ENOENT') {
      console.log("파일 삭제 Error 발생");
    }
  }
  try {
    fs.unlinkSync(photosUrl)
  } catch (error) {
    if (error.code == 'ENOENT') {
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
  const photo = await Photo.exists({ _id: id })
  const photoData = await Photo.findById(photo._id);
  if (!photo) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  if (files) {
    await sharp(files['main'][0].path).resize({ width: 400, height: 500 }).toFile(`${files['main'][0].path}_resize.jpg`);
    await sharp(files['main'][0].path).resize({ width: 1000, height: 1200 }).toFile(`${files['main'][0].path}_big.jpg`);
    fs.rename(files['photos'][0].path, `${files['photos'][0].path}.zip`, function (err) {
      if (err) throw err;
    })
    try {
      fs.unlinkSync(files['main'][0].path);
      fs.unlinkSync(photoData.mainphotoUrl);
      fs.unlinkSync(photoData.bigphotoUrl);
      fs.unlinkSync(photoData.photosUrl);
    } catch (error) {
      if (error.code == 'ENOENT') {
        console.log("파일 삭제 Error 발생");
      }
    }
  }
  await Photo.findByIdAndUpdate(photo._id, {
    mainphotoUrl: files['main'][0].path + '_resize.jpg',
    bigphotoUrl: files['main'][0].path + '_big.jpg',
    photosUrl: files['photos'][0].path + '.zip',
    title,
    description,
    hashtags: Photo.formatHashtags(hashtags),
    price,
  });
  return res.redirect(`/`);
};

export const deletePhoto = async (req, res) => {
  const { id } = req.params;
  const photo = await Photo.exists({ _id: id });
  const photoData = await Photo.findById(photo._id);
  const fileUrl = photoData.mainphotoUrl;
  const bigFileUrl = photoData.bigphotoUrl;
  const zipFileUrl = photoData.photosUrl;
  console.log(photoData);
  if (res.locals.isAdmin) {
    try {
      fs.unlinkSync(fileUrl)
      fs.unlinkSync(bigFileUrl)
      fs.unlinkSync(zipFileUrl)
    } catch (error) {
      if (error.code == 'ENOENT') {
        console.log("파일 삭제 Error 발생");
      }
    }
    await Photo.findByIdAndDelete(id);
    return res.redirect("/");
  }
  else {
    return res.status(404).render("404", { pageTitle: "Page not found" });
  }
};

export const handleWatch = async (req, res) => {
  try {
    const { _id } = req.session.user;
    const { id } = req.params;

    const photo = await Photo.findById(id);
    const user = await User.findById(_id);
    if (photo) {
      return res.render("watch", { pageTitle: photo.title, photo, user });
    }
    return res.status(404).render("404", { pageTitle: "Page not found." });
  } catch (e) {
    req.flash("error", "로그인 후 이용해주세요");
    return res.redirect("/login");
  }

};

export const getUpload = async (req, res) => {
  return res.render("upload", { pageTitle: "Upload Photo" });
};

export const postUpload = async (req, res) => {
  const {
    body: { title, description, hashtags, price, mainphotoUrl },
    files,
  } = req;
  //console.log(files);
  // let imagePath = `${file.path}`
  //console.log(files['main'][0].path)

  await sharp(files['main'][0].path).resize({ width: 400, height: 500 }).toFile(`${files['main'][0].path}_resize.jpg`);
  await sharp(files['main'][0].path).resize({ width: 1000, height: 1200 }).toFile(`${files['main'][0].path}_big.jpg`);
  fs.rename(files['photos'][0].path, `${files['photos'][0].path}.zip`, function (err) {
    if (err) throw err;
  })
  try {
    fs.unlinkSync(files['main'][0].path)
  } catch (error) {
    if (error.code == 'ENOENT') {
      console.log("파일 삭제 Error 발생");
    }
  }
  try {
    await Photo.create({
      mainphotoUrl: files['main'][0].path + '_resize.jpg',
      bigphotoUrl: files['main'][0].path + '_big.jpg',
      photosUrl: files['photos'][0].path + '.zip',
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

export const getDownloadPhotos = async (req, res) => {
  const { id } = req.params;
  const photo = await Photo.exists({ _id: id });
  const photoData = await Photo.findById(photo._id);
  const fileName = `${photoData.photosUrl}`;
  res.download(fileName);
}