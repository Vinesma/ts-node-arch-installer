import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import fs from "node:fs";
import os from "node:os";
import File from "./File";
import { config } from "../../config";
import { FailFastError } from "../../utils/errors/FailFast";

const mkdirMock = jest
    .spyOn(fs, "mkdirSync")
    .mockImplementation(path => path as string);
const writeFileMock = jest
    .spyOn(fs, "writeFileSync")
    .mockImplementation((path, text) => ({ path, text }));
const logMock = jest.spyOn(console, "log").mockImplementation(text => text);
const errorMock = jest.spyOn(console, "error").mockImplementation(text => text);

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

        expect(testFile.destination_path).toBe(expectedPath);
    });

    it("should handle absolute paths", () => {
        const expectedPath = `${HOME}/Projects/test.txt`;

        expect(testFile.absolute_path).toBe(expectedPath);
    });

    describe("mkdir", () => {
        it("should make a directory at the proper path", () => {
            testFile.mkdir();

            expect(mkdirMock).toBeCalledTimes(1);
            expect(mkdirMock).toBeCalledWith(testFile.destination_path, {
                recursive: true,
            });
            expect(logMock).toBeCalledTimes(1);
        });

        it("should error on fail", () => {
            mkdirMock.mockImplementation(createIsErrNoExceptionError);

            testFile.mkdir();

            expect(mkdirMock).toBeCalledTimes(1);
            expect(mkdirMock).toThrow();
            expect(errorMock).toBeCalledTimes(1);
        });

        it("should fail fast on error when configured so", done => {
            mkdirMock.mockImplementation(() => {
                throw new Error();
            });
            jest.replaceProperty(config, "failFast", true);

            try {
                testFile.mkdir();
            } catch (error) {
                expect(error).toBeInstanceOf(FailFastError);
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
                testFile.absolute_path,
                testFile.text
            );
            expect(logMock).toBeCalledTimes(1);
        });

        it("should error on fail", () => {
            writeFileMock.mockImplementation(createIsErrNoExceptionError);

            testFile.touch();

            expect(writeFileMock).toBeCalledTimes(1);
            expect(writeFileMock).toThrow();
            expect(errorMock).toBeCalledTimes(1);
        });

        it("should fail fast when configured to do so", done => {
            writeFileMock.mockImplementation(() => {
                throw new Error();
            });
            jest.replaceProperty(config, "failFast", true);

            try {
                testFile.touch();
            } catch (error) {
                expect(error).toBeInstanceOf(FailFastError);
            } finally {
                done();
            }
        });
    });
});
