import util from "util";
import { exec, ExecException } from "child_process";
import { TSpawn } from "./spawn.types";
import { print } from "../message";
import { config } from "../../config";
import { FailFastError } from "../errors/FailFast";

const { superUserCommand, failFast } = config;
const execAsPromise = util.promisify(exec);

const spawn: TSpawn = async (
    name,
    args = [],
    silent = false,
    super_user = false
) => {
    try {
        const childProcess = await execAsPromise(`${name} ${args.join(" ")}`);

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
                `Process called with: ${name} and args: [${args.join(" ")}]`
            );
            output = (error as ExecException).message;
            exitCode = (error as ExecException).code ?? 1;
        }

        if (failFast) {
            process.exitCode = 1;
            throw new FailFastError();
        }

        return { output, exitCode };
    }
};

export default spawn;
