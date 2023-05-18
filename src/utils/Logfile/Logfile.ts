import fs from "fs";
import { config } from "../../config";
import { print } from "../message";

const { useLog, logPath } = config;

export default class Logfile {
    private descriptor;

    constructor() {
        if (!useLog) {
            return;
        }

        try {
            const fd = fs.openSync(logPath, "w");

            this.descriptor = fd;
        } catch (error) {
            throw Error("Failed to create log file.");
        }
    }

    private getTimestamp() {
        const date = new Date();
        return date.toLocaleTimeString("en-US");
    }

    write(text: string) {
        if (!this.descriptor) {
            return;
        }

        try {
            const logMessage = `\nLOG [${this.getTimestamp()}]: ${text}`;
            fs.writeSync(this.descriptor, logMessage);
        } catch (error) {
            print.error("Failed to write to logfile.");
        }
    }

    close() {
        if (!this.descriptor) {
            return;
        }

        fs.closeSync(this.descriptor);
    }
}
