import {
    Router
} from "express";
import {getImages} from "../../common";

const router = Router();

router.route("/image")
    .get(getImages);

export default router;