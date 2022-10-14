import express from "express";
import {
  getJoin,
  postJoin,
  getChangePassword,
  postChangePassword,
} from "../controllers/userController";

const userRouter = express.Router();

export default userRouter;
