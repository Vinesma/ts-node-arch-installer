import { Installer } from "../Installer";

class Aur extends Installer {
    constructor() {
        super("paru", "-S", "-Sua", "--noconfirm");
    }
}

export default Aur;
