import express from "express";
import {
  deletePhoto,
  getEdit,
  postEdit,
  handleWatch,
  getUpload,
  postUpload,
} from "../controllers/photoController";
import {
  protectorMiddleware,
  uploadFiles,
  adminOnlyMiddleware,
} from "../middlewares";

const photoRouter = express.Router();

photoRouter
  .route("/upload")
  .all(protectorMiddleware, adminOnlyMiddleware)
  .get(getUpload)
  .post(uploadFiles.single("main"), postUpload);
photoRouter.get("/:id([0-9a-f]{24})", handleWatch);
photoRouter
  .route("/:id([0-9a-f]{24})/edit")
  .all(protectorMiddleware, adminOnlyMiddleware)
  .get(getEdit)
  .post(uploadFiles.single("main"), postEdit);
photoRouter
  .route("/:id([0-9a-f]{24})/delete")
  .all(protectorMiddleware, adminOnlyMiddleware)
  .get(deletePhoto);

export default photoRouter;
