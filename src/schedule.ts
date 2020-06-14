import { CronJob } from "cron";
import { connectDb } from "./db";
import { ARTICLES } from "./db/collections";

function clearTodayViewed() {
    connectDb(async (db, client) => {
        try {
            await db.collection(ARTICLES)
                .update({}, { todayViewed: 0 });
        } catch (error) {

        }

        client.close();
    });
}

const task = new CronJob("0 0 0 * * *", () => {
    clearTodayViewed();

    console.log("task executed");
});

task.start();