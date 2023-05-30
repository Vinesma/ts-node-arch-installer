import { config } from "../../config";
import { spawn } from "../../utils/spawn";

export default class Installer {
    protected name;
    protected syncArg;
    protected installArg;
    protected noConfirmArg;
    protected superUser;

    static NAME = {
        AUR: config.AURHelper,
        PACMAN: config.defaultInstaller,
        FLATPAK: "flatpak",
        PIP: "pip",
    };

    constructor(
        name: string,
        options: {
            installArg: string;
            syncArg?: string;
            noConfirmArg?: string;
            superUser?: boolean;
        }
    ) {
        this.name = name;
        this.installArg = options.installArg;
        this.syncArg = options?.syncArg ?? "";
        this.noConfirmArg = options?.noConfirmArg ?? "";
        this.superUser = options?.superUser ?? true;
    }

    /**
     * Sync repositories and install packages passed as arguments
     * @param args List of packages to install
     * @returns
     */
    sync(args: string[] = []) {
        spawn(
            this.name,
            [this.noConfirmArg, this.syncArg, ...args],
            false,
            false,
            this.superUser
        );
    }

    /**
     * Install packages
     * @param args List of packages to install
     * @returns
     */
    install(args: string[]) {
        spawn(
            this.name,
            [this.noConfirmArg, this.installArg, ...args],
            false,
            false,
            this.superUser
        );
    }
}
