import { Aur } from "../Aur";
import { Flatpak } from "../Flatpak";
import { Pacman } from "../Pacman";
import { Pip } from "../Pip";
import Installer from "../Installer/Installer";

export default class InstallerFactory {
    static create(installerName: keyof typeof Installer.NAME) {
        switch (installerName) {
            case "PACMAN":
                return new Pacman();
            case "AUR":
                return new Aur();
            case "FLATPAK":
                return new Flatpak();
            case "PIP":
                return new Pip();
            default:
                // eslint-disable-next-line no-case-declarations
                const _exhaustiveCheck: never = installerName;
                return _exhaustiveCheck;
        }
    }
}
