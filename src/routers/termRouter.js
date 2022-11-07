import express from "express";
import { payment, terms, privacy } from "../controllers/termController";

const termRouter = express.Router();

termRouter.get("/", terms);
termRouter.get("/payment", payment);
termRouter.get("/privacy", privacy)

export default termRouter;