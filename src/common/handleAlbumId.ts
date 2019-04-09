import { ObjectID } from "mongodb";

export default function(id: string | number) {
    let _id: number | ObjectID;
    if (id == "1" || id == "2") {
        _id = +id;
    } else {
        _id = new ObjectID(id);
    }
    return _id;
}