import { Router } from "express";
import { getAlbum } from "../../common";

const router = Router();

router.route("/album").get(getAlbum);

export default router;