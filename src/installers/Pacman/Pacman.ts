import { Installer } from "../Installer";

class Pacman extends Installer {
    constructor() {
        super(Installer.NAME.PACMAN, {
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
