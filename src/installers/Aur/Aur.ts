import { Installer } from "../Installer";

class Aur extends Installer {
    constructor() {
        super("paru", {
            installArg: "-S",
            syncArg: "-Sua",
            noConfirmArg: "--noconfirm",
            superUser: false,
        });
    }
}

export default Aur;
