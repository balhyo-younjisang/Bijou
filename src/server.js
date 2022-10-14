import express from "express";
import morgan from "morgan";
import globalRouter from "./routers/globalRouter";
import photoRouter from "./routers/photoRouter";
import userRouter from "./routers/userRouter";

const app = express();
const logger = morgan("dev");

app.set("view engine", "pug");
app.set("views", "src/views");

app.use(express.urlencoded({ extended: true }));
app.use(logger);
app.use("/", globalRouter);
app.use("/photos", photoRouter);
app.use("/users", userRouter);

export default app;
