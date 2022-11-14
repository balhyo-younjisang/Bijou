import multer from "multer";
import User from "./models/User";
import Photo from "./models/Photo";

export const localsMiddleware = (req, res, next) => {
  res.locals.siteName = "Bijou";
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.loggedInUser = req.session.user;
  next();
};

export const protectorMiddleware = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    req.flash("error", "Not authorized");
    return res.redirect("/login");
  }
};

export const publicOnlyMiddleware = (req, res, next) => {
  if (!req.session.loggedIn) {
    return next();
  } else {
    req.flash("error", "Not authorized");
    return res.redirect("/");
  }
};


export const uploadFiles = multer({ dest: "uploads/" });

export const adminOnlyMiddleware = (req, res, next) => {
  if (res.locals.loggedIn) {
    if (req.session.user.name === 'Admin' && req.session.user.email === process.env.ADMIN_EMAIL) {
      res.locals.isAdmin = true;
    }
    else {
      res.locals.isAdmin = false;
    }
  }
  //console.log(res.locals.isAdmin);
  next();
};

export const buyOnlyMiddleware = async (req, res, next) => {
  const { _id } = req.session.user;
  const { id } = req.params;
  const user = await User.findById({ _id });
  const photo = await Photo.findById(id);
  console.log(user, photo);
  if (user.buylist.find(element => element === photo.title)) {
    next();
  } else {
    return res.status(404).render("404", { pageTitle: "Page not found." })
  }
}