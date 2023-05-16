import { describe, expect, it, jest } from "@jest/globals";
import fs from "node:fs";
import os from "node:os";
import File from "./File";

jest.mock("node:fs", () => ({
    mkdir: jest.fn(path => path),
}));

const mkdirMock = jest.mocked(fs.mkdir);

const HOME = os.homedir();
const testFile = new File("test.txt", "~/Projects");

describe("A file", () => {
    it("should handle '~' in filepaths", () => {
        const expectedPath = `${HOME}/Projects`;

        expect(testFile.destination_path).toBe(expectedPath);
    });

    it("should handle absolute paths", () => {
        const expectedPath = `${HOME}/Projects/test.txt`;

        expect(testFile.absolute_path).toBe(expectedPath);
    });

    it("should make a directory at the proper path", () => {
        expect(jest.isMockFunction(fs.mkdir)).toBeTruthy();

        testFile.mkdir();

        expect(fs.mkdir).toBeCalledTimes(1);
        expect(fs.mkdir).toReturnWith(testFile.destination_path);
    });

    it("should error on fail", () => {
        expect(jest.isMockFunction(fs.mkdir)).toBeTruthy();
        expect(jest.isMockFunction(mkdirMock)).toBeTruthy();

        const mkdirMockImplementation = {
            __promisify__: async () => {
                throw Error;
            },
        };

        mkdirMock.mockImplementation(
            mkdirMockImplementation as unknown as typeof fs.mkdir
        );

        testFile.mkdir();

        expect(mkdirMock).toBeCalledTimes(1);
        expect(mkdirMock).toThrow();
    });
});
