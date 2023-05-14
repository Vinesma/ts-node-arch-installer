import { Installer } from "../Installer";

class Pacman extends Installer {
    constructor() {
        super("pacman", "-S", "-Syu", "--noconfirm");
    }

    install(args: string[]): void {
        super.install(["--needed", ...args]);
    }
}

export default Pacman;
