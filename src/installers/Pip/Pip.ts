import { Installer } from "../Installer";

class Pip extends Installer {
    constructor() {
        super("pip", { installArg: "install", noConfirmArg: "--no-input" });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sync(args?: string[]): void {
        return;
    }
}

export default Pip;
