import { Installer } from "../Installer";

class Aur extends Installer {
    constructor() {
        super(Installer.NAME.AUR, {
            installArg: "-S",
            syncArg: "-Sua",
            noConfirmArg: "--noconfirm",
            superUser: false,
        });
    }
}

export default Aur;
