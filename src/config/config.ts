import os from "os";
import path from "path";

const programPath = `${os.homedir()}/.dotfiles/ts-node-arch-installer`;

export default {
    /**
     * Determines if the program should run sanity checks on startup.
     * Some of these checks don't make sense if the user is in a fresh install.
     * Thus, this option should be 'True' only if the user intends to create new packages.
     * Tests after creating packages interactively will still be run.
     */
    devMode: false,
    /** How verbose the program should be. true = more verbose. */
    verbose: false,
    /** Halt the program as soon as any error happens. */
    failFast: false,
    /** The default package installer. */
    defaultInstaller: "pacman",
    /** The AUR helper to use. */
    AURHelper: "paru",
    /** Path to autostart file. */
    autoStartPath: `${os.homedir()}/.autostart`,
    /** Default timeout when an error occurs so that the user is made aware of it. */
    secondsToWaitOnFail: 30,
    /** Command to use for privilege escalation. */
    superUserCommand: "sudo",
    /** Path to this program's main folder. */
    programPath,
    /** Path to this program's package data. */
    dataPath: path.join(programPath, "data", "groups"),
    /** Log errors, comments and other info into a file. */
    useLog: true,
    /** Path to the logfile that will be used if useLog = true. */
    logPath: path.join(programPath, "data", "install.log"),
};
