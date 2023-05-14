import fs from "node:fs";
import os from "node:os";
import { print } from "../../utils/message";

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

    mkdir() {
        try {
            fs.mkdir(this.destination_path, { recursive: true }, error => {
                if (error) {
                    throw error;
                }

                print.simple(`Created directory: ${this.destination_path}`);
            });
        } catch (error) {
            if (this.isErrNoException(error)) {
                print.error(error.message);
            }
        }
    }
}
