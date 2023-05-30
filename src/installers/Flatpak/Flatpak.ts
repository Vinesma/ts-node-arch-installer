import { Installer } from "../Installer";

class Flatpak extends Installer {
    constructor() {
        super(Installer.NAME.FLATPAK, {
            installArg: "install",
            noConfirmArg: "--assumeyes",
            superUser: false,
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sync(args?: string[]): void {
        return;
    }
}

export default Flatpak;
