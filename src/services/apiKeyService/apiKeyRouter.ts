import apiKeyController from "@/services/apiKeyService/apiKeyController";
import { Router } from "express";

const router = Router();

router.get("/ping", (req, res, next) => res.json("pong"));
router.post("/create", apiKeyController.createApiKey);

export default router;
