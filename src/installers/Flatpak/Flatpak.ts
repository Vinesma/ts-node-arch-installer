import { Installer } from "../Installer";

class Flatpak extends Installer {
    constructor() {
        super("flatpak", "install", "", "--assumeyes");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sync(args?: string[]): void {
        return;
    }
}

export default Flatpak;