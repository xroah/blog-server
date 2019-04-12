import { ObjectID } from "mongodb";

export default function(id: string | number) {
    let _id: number | ObjectID;
    //1: article pictures
    //2: bing pictures
    //these two albums can not be removed
    if (id == "1" || id == "2") {
        _id = +id;
    } else {
        _id = new ObjectID(id);
    }
    return _id;
}