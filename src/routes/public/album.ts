import { Router } from "express";
import {
    getAlbums,
    getImages
} from "../../common";

const router = Router();

router.get("/album", getAlbums);
router.get("/image", getImages);

export default router;