import express from "express";
import AdminBro from "admin-bro";
import AdminBroExpress from "@admin-bro/express";
import AdminBroMongoose from "@admin-bro/mongoose";
import User from "./models/User";
import Photo from "./models/Photo";
import morgan from "morgan";
import session from "express-session";
import MongoStore from "connect-mongo";
import globalRouter from "./routers/globalRouter";
import photoRouter from "./routers/photoRouter";
import userRouter from "./routers/userRouter";
import { localsMiddleware } from "./middlewares";
import mongoose from "mongoose";
import flash from "express-flash"

const app = express();
const logger = morgan("dev");
AdminBro.registerAdapter(AdminBroMongoose);
const adminBro = new AdminBro({
  databases: [mongoose],
});
const ADMIN = {
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD,
};
const router = AdminBroExpress.buildAuthenticatedRouter(adminBro, {
  authenticate: async (email, password) => {
    if (ADMIN.password === password && ADMIN.email === email) {
      return ADMIN;
    }
    return null;
  },
  cookieName: "adminBro",
  cookiePassword: "qlwbqlwb",
});

app.set("view engine", "pug");
app.set("views", "src/views");

app.use(adminBro.options.rootPath, router);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger);
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
  })
);
app.use(flash());
app.use(localsMiddleware);
app.use("/uploads", express.static("uploads"));
app.use("/assets", express.static("assets"));
app.use("/", globalRouter);
app.use("/photos", photoRouter);
app.use("/users", userRouter);

export default app;
