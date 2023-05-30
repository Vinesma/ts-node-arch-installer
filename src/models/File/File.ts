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
    public source_path;
    /** The path to where the file should go/be linked to */
    public destination_path;
    /** Text that the file should store, can be empty */
    public text;
    /** Should this file be symlinked source -> destination? If false it will be copied */
    private createSymlink;
    /** If the file needs superuser permissions to be linked/copied to its destination */
    private superUser;
    /** Any comments that should be shown to the user after this file is installed */
    public comments;
    /** Absolute path to file, created by concatenating destination path + filename */
    public absolute_path;
    public absolute_path_source;

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
        this.destination_path = this.handleHomePath(destination_path);
        this.source_path = this.handleHomePath(source_path);
        this.comments = comments;
        this.text = text ?? "";
        this.createSymlink = createSymlink ?? false;
        this.superUser = superUser ?? false;

        this.absolute_path = path.join(this.destination_path, this.name);
        this.absolute_path_source = path.join(this.source_path, this.name);
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
            fs.mkdirSync(this.destination_path, { recursive: true });

            print.simple(`Created directory: ${this.destination_path}`);
        } catch (error) {
            print.error(
                `There was a problem creating a directory at: ${this.destination_path}`
            );

            this.handleFileError(error);
        }
    }

    touch() {
        try {
            fs.writeFileSync(this.absolute_path, this.text);

            print.simple(`Created file: ${this.name} at ${this.absolute_path}`);
        } catch (error) {
            print.error(
                `There was a problem creating the file: ${this.name} at: ${this.absolute_path}`
            );

            this.handleFileError(error);
        }
    }

    copy() {
        try {
            if (!this.source_path) {
                print.error(
                    `${this.name} has no source from which to copy from.`
                );

                this.handleFileError();
                return;
            }

            if (this.superUser) {
                spawn(
                    "cp",
                    `-v -- ${this.absolute_path_source} ${this.absolute_path}`,
                    undefined,
                    undefined,
                    true
                );
            } else {
                fs.copyFileSync(this.absolute_path_source, this.absolute_path);
            }
        } catch (error) {
            print.error(
                `There was a problem while copying: ${this.absolute_path_source} to: ${this.absolute_path}`
            );

            this.handleFileError(error);
        }
    }

    link() {
        try {
            if (!this.source_path) {
                print.error(
                    `${this.name} has no source from which to link from.`
                );

                this.handleFileError();
                return;
            }

            if (this.superUser) {
                spawn(
                    "ln",
                    `-sfv -- ${this.absolute_path_source} ${this.absolute_path}`,
                    undefined,
                    undefined,
                    true
                );
            } else {
                fs.symlinkSync(this.absolute_path_source, this.absolute_path);
            }
        } catch (error) {
            if (this.isErrNoException(error) && error.code === "EEXIST") {
                print.error(
                    `Cannot link, file already exists at destination. Attempting to remove existing file...`
                );

                try {
                    fs.unlinkSync(this.absolute_path);
                    print.simple(`Removed: ${this.absolute_path}`);
                    this.link();
                } catch (error) {
                    this.handleFileError(error);
                }
            } else {
                print.error(
                    `There was a problem while linking: ${this.absolute_path_source} to: ${this.absolute_path}`
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
        } else if (this.source_path) {
            this.copy();
        } else {
            this.touch();
        }

        this.showComments();
    }
}
