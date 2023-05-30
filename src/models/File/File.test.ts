import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import fs from "node:fs";
import os from "node:os";
import File from "./File";
import { config } from "../../config";
import { FailFastError } from "../../utils/errors/FailFast";
import { haltForUser } from "../../utils/haltForUser";
import { spawn } from "../../utils/spawn";

jest.mock("../../utils/haltForUser");
jest.mock("../../utils/spawn");

const mkdirMock = jest
    .spyOn(fs, "mkdirSync")
    .mockImplementation(path => path as string);
const writeFileMock = jest
    .spyOn(fs, "writeFileSync")
    .mockImplementation(jest.fn());
const copyFileMock = jest
    .spyOn(fs, "copyFileSync")
    .mockImplementation(jest.fn());
const symLinkMock = jest.spyOn(fs, "symlinkSync").mockImplementation(jest.fn());
const unlinkMock = jest.spyOn(fs, "unlinkSync").mockImplementation(jest.fn());
const logMock = jest.spyOn(console, "log").mockImplementation(jest.fn());
const errorMock = jest.spyOn(console, "error").mockImplementation(jest.fn());
const haltForUserMock = jest.mocked(haltForUser);
const spawnMock = jest.mocked(spawn);

const HOME = os.homedir();
const testFile = new File("test.txt", "~/Projects");

const createIsErrNoExceptionError = () => {
    const error: NodeJS.ErrnoException = new Error();
    error.errno = 1;
    error.code = "error code";
    error.path = "error path";
    error.syscall = "syscall";
    throw error;
};

describe("A file", () => {
    beforeEach(() => {
        jest.replaceProperty(config, "failFast", false);
    });

    it("should handle '~' in filepaths", () => {
        const expectedPath = `${HOME}/Projects`;

        expect(testFile.destinationPath).toBe(expectedPath);
    });

    it("should handle absolute paths", () => {
        const expectedPath = `${HOME}/Projects/test.txt`;

        expect(testFile.absolutePathDestination).toBe(expectedPath);
    });

    it("should handle source paths", () => {
        const testFileSource = new File(
            "test.txt",
            "~/Projects",
            undefined,
            "~/.hidden/projects"
        );
        const expectedPath = `${HOME}/.hidden/projects/test.txt`;

        expect(testFileSource.absolutePathSource).toBe(expectedPath);
    });

    describe("mkdir", () => {
        it("should make a directory at the proper path", () => {
            testFile.mkdir();

            expect(mkdirMock).toBeCalledTimes(1);
            expect(mkdirMock).toBeCalledWith(testFile.destinationPath, {
                recursive: true,
            });
            expect(logMock).toBeCalledTimes(1);
        });

        it("should error on fail", () => {
            mkdirMock.mockImplementation(createIsErrNoExceptionError);

            testFile.mkdir();

            expect(mkdirMock).toBeCalledTimes(1);
            expect(mkdirMock).toThrow();
            expect(errorMock).toBeCalledTimes(2);
            expect(haltForUserMock).toBeCalledTimes(1);
        });

        it("should fail fast on error when configured so", done => {
            mkdirMock.mockImplementation(() => {
                throw new Error();
            });
            jest.replaceProperty(config, "failFast", true);

            try {
                testFile.mkdir();
            } catch (error) {
                process.exitCode = 0;
                expect(error).toBeInstanceOf(FailFastError);
                expect(haltForUserMock).not.toBeCalled();
            } finally {
                done();
            }
        });
    });

    describe("touch", () => {
        it("should create a file and possibly write to it", () => {
            testFile.touch();

            expect(writeFileMock).toBeCalledTimes(1);
            expect(writeFileMock).toBeCalledWith(
                testFile.absolutePathDestination,
                testFile.text
            );
            expect(logMock).toBeCalledTimes(1);
        });

        it("should error on fail", () => {
            writeFileMock.mockImplementation(createIsErrNoExceptionError);

            testFile.touch();

            expect(writeFileMock).toBeCalledTimes(1);
            expect(writeFileMock).toThrow();
            expect(errorMock).toBeCalledTimes(2);
            expect(haltForUserMock).toBeCalledTimes(1);
        });

        it("should fail fast when configured to do so", done => {
            writeFileMock.mockImplementation(() => {
                throw new Error();
            });
            jest.replaceProperty(config, "failFast", true);

            try {
                testFile.touch();
            } catch (error) {
                process.exitCode = 0;
                expect(error).toBeInstanceOf(FailFastError);
                expect(haltForUserMock).not.toBeCalled();
            } finally {
                done();
            }
        });
    });

    describe("copy", () => {
        it("should copy a file to its destination", () => {
            const testFileSource = new File(
                "test.txt",
                "~/Projects",
                undefined,
                "~/.hidden/source"
            );
            const expectedSourcePath = `${HOME}/.hidden/source/test.txt`;
            const expectedDestPath = `${HOME}/Projects/test.txt`;

            testFileSource.copy();

            expect(errorMock).not.toBeCalled();
            expect(spawnMock).not.toBeCalled();
            expect(copyFileMock).toBeCalledTimes(1);
            expect(copyFileMock).toBeCalledWith(
                expectedSourcePath,
                expectedDestPath
            );
        });

        it("should not copy a file to its destination if there is no source path", () => {
            const testFileNoSource = new File("test.txt", "~/Projects");

            testFileNoSource.copy();

            expect(errorMock).toBeCalledTimes(1);
            expect(haltForUserMock).toBeCalledTimes(1);
            expect(spawnMock).not.toBeCalled();
            expect(copyFileMock).not.toBeCalled();
        });

        it("should use cp with super user privileges when superUser is true", () => {
            const testFileSourceSU = new File(
                "test.txt",
                "~/Projects",
                undefined,
                "~/.hidden/source",
                undefined,
                true
            );
            const expectedSourcePath = `${HOME}/.hidden/source/test.txt`;
            const expectedDestPath = `${HOME}/Projects/test.txt`;

            testFileSourceSU.copy();

            expect(errorMock).not.toBeCalled();
            expect(copyFileMock).not.toBeCalled();
            expect(spawnMock).toBeCalledTimes(1);
            expect(spawnMock).toBeCalledWith(
                "cp",
                `-v -- ${expectedSourcePath} ${expectedDestPath}`,
                undefined,
                undefined,
                true
            );
        });

        it("should error on fail", () => {
            const testFileSource = new File(
                "test.txt",
                "~/Projects",
                undefined,
                "~/.hidden/source"
            );
            copyFileMock.mockImplementation(createIsErrNoExceptionError);

            testFileSource.copy();

            expect(copyFileMock).toBeCalledTimes(1);
            expect(copyFileMock).toThrow();
            expect(errorMock).toBeCalledTimes(2);
            expect(haltForUserMock).toBeCalledTimes(1);
        });

        it("should fail fast when configured to do so", done => {
            copyFileMock.mockImplementation(() => {
                throw new Error();
            });
            jest.replaceProperty(config, "failFast", true);

            try {
                testFile.copy();
            } catch (error) {
                process.exitCode = 0;
                expect(error).toBeInstanceOf(FailFastError);
                expect(haltForUserMock).not.toBeCalled();
            } finally {
                done();
            }
        });
    });

    describe("link", () => {
        it("should link a file to its destination", () => {
            const testFileSource = new File(
                "test.txt",
                "~/Projects",
                undefined,
                "~/.hidden/source"
            );
            const expectedSourcePath = `${HOME}/.hidden/source/test.txt`;
            const expectedDestPath = `${HOME}/Projects/test.txt`;

            testFileSource.link();

            expect(errorMock).not.toBeCalled();
            expect(spawnMock).not.toBeCalled();
            expect(symLinkMock).toBeCalledTimes(1);
            expect(symLinkMock).toBeCalledWith(
                expectedSourcePath,
                expectedDestPath
            );
        });

        it("should not link a file to its destination if there is no source path", () => {
            const testFileNoSource = new File("test.txt", "~/Projects");

            testFileNoSource.link();

            expect(errorMock).toBeCalledTimes(1);
            expect(haltForUserMock).toBeCalledTimes(1);
            expect(spawnMock).not.toBeCalled();
            expect(symLinkMock).not.toBeCalled();
        });

        it("should use ln with super user privileges when superUser is true", () => {
            const testFileSourceSU = new File(
                "test.txt",
                "~/Projects",
                undefined,
                "~/.hidden/source",
                undefined,
                true
            );
            const expectedSourcePath = `${HOME}/.hidden/source/test.txt`;
            const expectedDestPath = `${HOME}/Projects/test.txt`;

            testFileSourceSU.link();

            expect(errorMock).not.toBeCalled();
            expect(symLinkMock).not.toBeCalled();
            expect(spawnMock).toBeCalledTimes(1);
            expect(spawnMock).toBeCalledWith(
                "ln",
                `-sfv -- ${expectedSourcePath} ${expectedDestPath}`,
                undefined,
                undefined,
                true
            );
        });

        it("should error on fail", () => {
            const testFileSource = new File(
                "test.txt",
                "~/Projects",
                undefined,
                "~/.hidden/source"
            );
            symLinkMock.mockImplementation(createIsErrNoExceptionError);

            testFileSource.link();

            expect(symLinkMock).toBeCalledTimes(1);
            expect(symLinkMock).toThrow();
            expect(errorMock).toBeCalledTimes(2);
            expect(haltForUserMock).toBeCalledTimes(1);
        });

        it("should retry linking when error is EEXIST and target file can be removed", () => {
            const testFileSource = new File(
                "test.txt",
                "~/Projects",
                undefined,
                "~/.hidden/source"
            );
            symLinkMock
                .mockImplementation(jest.fn())
                .mockImplementationOnce(() => {
                    const error: NodeJS.ErrnoException = new Error();
                    error.errno = 1;
                    error.code = "EEXIST";
                    error.path = "error path";
                    error.syscall = "syscall";
                    throw error;
                });

            testFileSource.link();

            expect(unlinkMock).toBeCalledTimes(1);
            expect(symLinkMock).toBeCalledTimes(2);
            expect(logMock).toBeCalledTimes(2);
            expect(errorMock).toBeCalledTimes(1);
            expect(haltForUserMock).not.toBeCalled();
        });

        it("should fail fast when configured to do so", done => {
            symLinkMock.mockImplementation(() => {
                throw new Error();
            });
            jest.replaceProperty(config, "failFast", true);

            try {
                testFile.link();
            } catch (error) {
                process.exitCode = 0;
                expect(error).toBeInstanceOf(FailFastError);
                expect(haltForUserMock).not.toBeCalled();
            } finally {
                done();
            }
        });
    });

    describe("showComments", () => {
        it("should display all comments that the file has", () => {
            const comments = ["One Comment", "Two Comment"];
            const testFileComment = new File(
                "test.txt",
                "~/Projects",
                undefined,
                "~/.hidden/source",
                undefined,
                undefined,
                comments
            );

            testFileComment.showComments();

            expect(logMock).toBeCalledTimes(2 + comments.length);
        });

        it("should not display anything if file has no comments", () => {
            const testFileComment = new File("test.txt", "~/Projects");

            testFileComment.showComments();

            expect(logMock).not.toBeCalled();
        });
    });

    describe("configure", () => {
        it("should always make a directory", () => {
            testFile.configure();

            expect(mkdirMock).toBeCalled();
        });

        it("should create only a symlink when createSymlink is true", () => {
            const testFileSource = new File(
                "test.txt",
                "~/Projects",
                undefined,
                "~/.hidden/source",
                true
            );

            testFileSource.configure();

            expect(symLinkMock).toBeCalled();
            expect(copyFileMock).not.toBeCalled();
            expect(writeFileMock).not.toBeCalled();
        });

        it("should copy the file only if createSymlink is false but there is a source path", () => {
            const testFileSource = new File(
                "test.txt",
                "~/Projects",
                undefined,
                "~/.hidden/source"
            );

            testFileSource.configure();

            expect(copyFileMock).toBeCalled();
            expect(symLinkMock).not.toBeCalled();
            expect(writeFileMock).not.toBeCalled();
        });

        it("should create the file only if createSymlink is false and there is no source path", () => {
            testFile.configure();

            expect(writeFileMock).toBeCalled();
            expect(symLinkMock).not.toBeCalled();
            expect(copyFileMock).not.toBeCalled();
        });
    });
});
