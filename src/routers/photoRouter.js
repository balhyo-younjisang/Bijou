import express from "express";
import {
  handleDelete,
  handleEdit,
  handleWatch,
  getUpload,
  postUpload,
} from "../controllers/photoController";

const photoRouter = express.Router();

photoRouter.route("/upload").get(getUpload).post(postUpload);
photoRouter.get("/:id(\\d+)", handleWatch);
photoRouter.get("/:id(\\d+)/edit", handleEdit);
photoRouter.get("/:id(\\d+)/delete", handleDelete);

export default photoRouter;
