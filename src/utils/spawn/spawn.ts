import util from "util";
import { exec, ExecException } from "child_process";
import { TSpawn } from "./spawn.types";
import { print } from "../message";
import { config } from "../../config";
import { FailFastError } from "../errors/FailFast";
import timers from "timers/promises";

const { superUserCommand, failFast, secondsToWaitOnFail } = config;

const handleArgs = (args: string | string[]) => {
    if (Array.isArray(args)) {
        return args.join(" ");
    } else {
        return args;
    }
};

const spawn: TSpawn = async (
    name,
    args = [],
    silent = false,
    super_user = false
) => {
    const execAsPromise = util.promisify(exec);

    try {
        let command = `${name} ${handleArgs(args)}`;

        if (super_user) {
            command = `${superUserCommand} ${command}`;
        }

        const childProcess = await execAsPromise(command);

        if (!silent) {
            console.log(childProcess.stdout);
        }

        return { output: childProcess.stdout, exitCode: 0 };
    } catch (error) {
        let output = "";
        let exitCode = 1;

        if (error instanceof Error) {
            print.error(`Error spawning process: ${error}`);
            print.error(
                `Process called with: ${name} and args: [${handleArgs(args)}]`
            );
            output = (error as ExecException).message;
            exitCode = (error as ExecException).code ?? 1;
        }

        if (failFast) {
            process.exitCode = 1;
            throw new FailFastError();
        }

        print.info(
            "Stopping program execution temporarily for user evaluation."
        );

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

        return { output, exitCode };
    }
};

export default spawn;
