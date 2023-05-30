import { Installer } from "../Installer";

class Pacman extends Installer {
    constructor() {
        super("pacman", {
            installArg: "-S",
            syncArg: "-Syu",
            noConfirmArg: "--noconfirm",
        });
    }

    install(args: string[]): void {
        super.install(["--needed", ...args]);
    }
}

export default Pacman;
