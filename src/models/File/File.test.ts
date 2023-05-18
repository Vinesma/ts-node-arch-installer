import { describe, expect, it, jest } from "@jest/globals";
import fs from "node:fs";
import os from "node:os";
import File from "./File";

jest.mock("node:fs", () => ({
    mkdirSync: jest.fn(path => path),
    writeFileSync: jest.fn((path, text) => ({ path, text })),
}));

const mkdirMock = jest.mocked(fs.mkdirSync);

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

    describe("mkdir", () => {
        it("should make a directory at the proper path", () => {
            expect(jest.isMockFunction(fs.mkdirSync)).toBeTruthy();

            testFile.mkdir();

            expect(fs.mkdirSync).toBeCalledTimes(1);
            expect(fs.mkdirSync).toReturnWith(testFile.destination_path);
        });

        it("should error on fail", () => {
            expect(jest.isMockFunction(fs.mkdirSync)).toBeTruthy();
            expect(jest.isMockFunction(mkdirMock)).toBeTruthy();

            const mkdirMockImplementation = {
                __promisify__: async () => {
                    throw Error;
                },
            };

            mkdirMock.mockImplementation(
                mkdirMockImplementation as unknown as typeof fs.mkdirSync
            );

            testFile.mkdir();

            expect(mkdirMock).toBeCalledTimes(1);
            expect(mkdirMock).toThrow();
        });
    });

    describe("touch", () => {
        it("should create a file with 'write' flag", () => {
            expect(jest.isMockFunction(fs.writeFileSync)).toBeTruthy();

            testFile.touch();

            expect(fs.writeFileSync).toBeCalledTimes(1);
            expect(fs.writeFileSync).toReturnWith({
                path: testFile.absolute_path,
                text: testFile.text,
            });
        });
    });
});
