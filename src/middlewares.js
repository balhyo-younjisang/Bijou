import multer from "multer";

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
  if (req.session.email === undefined || req.session.user.email !== process.env.ADMIN_EMAIL) {
    res.locals.isAdmin= false;
    //console.log(res.locals);
  } else {
    res.locals.isAdmin = true;
    //console.log(res.locals);
    //req.flash("error", "Not authorized");
    //return res.redirect("/");
  }
  next();
};
