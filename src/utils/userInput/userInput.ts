import readline from "readline/promises";
import { stdin as input, stdout as output } from "process";
import { QUESTION } from "../message/message.const";

export const getUserInput = async (text: string) => {
    const message = `${QUESTION}: ${text}\n`;
    const rl = readline.createInterface({ input, output });
    const response = await rl.question(message);
    rl.close();

    return response;
};
