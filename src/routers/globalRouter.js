import express from "express";
import { handleHome } from "../controllers/globalController";
import { getJoin, postJoin, login } from "../controllers/userController";

const globalRouter = express.Router();

globalRouter.get("/", handleHome);
globalRouter.route("/join").get(getJoin).post(postJoin);
globalRouter.get("/login", login);

export default globalRouter;
