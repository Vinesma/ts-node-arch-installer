import { print } from "../message";
import { config } from "../../config";
import timers from "timers/promises";

const { secondsToWaitOnFail } = config;

export default async function haltForUser() {
    print.info("Stopping program execution temporarily for user evaluation.");

    const timeSplitInto = 3;
    const timeSlice = Math.floor(secondsToWaitOnFail / timeSplitInto);

    for (let index = 0; index < timeSplitInto; index++) {
        print.info(
            `Program will continue in ${
                secondsToWaitOnFail - timeSlice * index
            } seconds...`
        );
        await timers.setTimeout(1000 * timeSlice);
    }
}
