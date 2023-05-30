import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { print } from "../../utils/message";
import { config } from "../../config";
import { FailFastError } from "../../utils/errors/FailFast";
import { haltForUser } from "../../utils/haltForUser";
import { spawn } from "../../utils/spawn";

export default class File {
    /** The file's name with extension */
    public name;
    /** The path to where the file is stored */
    public sourcePath;
    /** The path to where the file should go/be linked to */
    public destinationPath;
    /** Text that the file should store, can be empty */
    public text;
    /** Should this file be symlinked source -> destination? If false it will be copied */
    private createSymlink;
    /** If the file needs superuser permissions to be linked/copied to its destination */
    private superUser;
    /** Any comments that should be shown to the user after this file is installed */
    public comments;
    /** Absolute path to file, created by concatenating destination path + filename */
    public absolutePathDestination;
    /** Absolute path to source file, created by concatenating source path + filename */
    public absolutePathSource;

    private USER_HOME = os.homedir();

    constructor(
        name: string,
        destination_path: string,
        text?: string,
        source_path?: string,
        createSymlink?: boolean,
        superUser?: boolean,
        comments: Array<string> = []
    ) {
        this.name = name;
        this.destinationPath = this.handleHomePath(destination_path);
        this.sourcePath = this.handleHomePath(source_path);
        this.comments = comments;
        this.text = text ?? "";
        this.createSymlink = createSymlink ?? false;
        this.superUser = superUser ?? false;

        this.absolutePathDestination = path.join(
            this.destinationPath,
            this.name
        );
        this.absolutePathSource = path.join(this.sourcePath, this.name);
    }

    private handleHomePath(rawPath?: string) {
        if (rawPath) {
            return rawPath.replace("~", this.USER_HOME);
        }
        return "";
    }

    private isErrNoException(
        error: unknown | NodeJS.ErrnoException
    ): error is NodeJS.ErrnoException {
        return (
            "errno" in (error as NodeJS.ErrnoException) &&
            "code" in (error as NodeJS.ErrnoException) &&
            "path" in (error as NodeJS.ErrnoException) &&
            "syscall" in (error as NodeJS.ErrnoException)
        );
    }

    private handleFileError(error?: unknown) {
        if (error && this.isErrNoException(error)) {
            print.error(error.message);
        }

        if (config.failFast) {
            process.exitCode = 1;
            throw new FailFastError();
        }

        haltForUser();
    }

    mkdir() {
        try {
            fs.mkdirSync(this.destinationPath, { recursive: true });

            print.simple(`Created directory: ${this.destinationPath}`);
        } catch (error) {
            print.error(
                `There was a problem creating a directory at: ${this.destinationPath}`
            );

            this.handleFileError(error);
        }
    }

    touch() {
        try {
            fs.writeFileSync(this.absolutePathDestination, this.text);

            print.simple(
                `Created file: ${this.name} at ${this.absolutePathDestination}`
            );
        } catch (error) {
            print.error(
                `There was a problem creating the file: ${this.name} at: ${this.absolutePathDestination}`
            );

            this.handleFileError(error);
        }
    }

    copy() {
        try {
            if (!this.sourcePath) {
                print.error(
                    `${this.name} has no source from which to copy from.`
                );

                this.handleFileError();
                return;
            }

            if (this.superUser) {
                spawn(
                    "cp",
                    `-v -- ${this.absolutePathSource} ${this.absolutePathDestination}`,
                    undefined,
                    undefined,
                    true
                );
            } else {
                fs.copyFileSync(
                    this.absolutePathSource,
                    this.absolutePathDestination
                );
            }
        } catch (error) {
            print.error(
                `There was a problem while copying: ${this.absolutePathSource} to: ${this.absolutePathDestination}`
            );

            this.handleFileError(error);
        }
    }

    link() {
        try {
            if (!this.sourcePath) {
                print.error(
                    `${this.name} has no source from which to link from.`
                );

                this.handleFileError();
                return;
            }

            if (this.superUser) {
                spawn(
                    "ln",
                    `-sfv -- ${this.absolutePathSource} ${this.absolutePathDestination}`,
                    undefined,
                    undefined,
                    true
                );
            } else {
                fs.symlinkSync(
                    this.absolutePathSource,
                    this.absolutePathDestination
                );
            }
        } catch (error) {
            if (this.isErrNoException(error) && error.code === "EEXIST") {
                print.error(
                    `Cannot link, file already exists at destination. Attempting to remove existing file...`
                );

                try {
                    fs.unlinkSync(this.absolutePathDestination);
                    print.simple(`Removed: ${this.absolutePathDestination}`);
                    this.link();
                } catch (error) {
                    this.handleFileError(error);
                }
            } else {
                print.error(
                    `There was a problem while linking: ${this.absolutePathSource} to: ${this.absolutePathDestination}`
                );

                this.handleFileError(error);
            }
        }
    }

    showComments() {
        this.comments.forEach((comment, index) => {
            if (index === 0) {
                print.heading(`[${this.name}]`);
            }
            print.info(comment);
        });
    }

    configure() {
        this.mkdir();

        if (this.createSymlink) {
            this.link();
        } else if (this.sourcePath) {
            this.copy();
        } else {
            this.touch();
        }

        this.showComments();
    }
}
