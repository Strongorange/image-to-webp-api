import queueRouter from "@/router/queueRouter";
import { Router } from "express";

const RootRouter = Router();

RootRouter.use("/queue", queueRouter);

export default RootRouter;
