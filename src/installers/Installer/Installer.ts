import { spawn } from "../../utils/spawn";

class Installer {
    protected name;
    protected syncArg;
    protected installArg;
    protected noConfirmArg;

    constructor(
        name: string,
        installArg: string,
        syncArg?: string,
        noConfirmArg?: string
    ) {
        this.name = name;
        this.installArg = installArg;
        this.syncArg = syncArg ?? "";
        this.noConfirmArg = noConfirmArg ?? "";
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
            true
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
            true
        );
    }
}

export default Installer;
