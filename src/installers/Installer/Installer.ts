import { spawn } from "../../utils/spawn";

class Installer {
    protected name;
    protected syncArg;
    protected installArg;
    protected noConfirmArg;
    protected needSuperUser;

    constructor(
        name: string,
        installArg: string,
        syncArg?: string,
        noConfirmArg?: string,
        needSuperUser?: boolean
    ) {
        this.name = name;
        this.installArg = installArg;
        this.syncArg = syncArg ?? "";
        this.noConfirmArg = noConfirmArg ?? "";
        this.needSuperUser = needSuperUser ?? true;
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
            this.needSuperUser
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
            this.needSuperUser
        );
    }
}

export default Installer;
