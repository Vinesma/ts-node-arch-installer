import { ExecException } from "child_process";
import { describe, expect, it, jest } from "@jest/globals";
import spawn from "./spawn";
import timers from "timers/promises";
import util from "util";
import { config } from "../../config";
import { FailFastError } from "../errors/FailFast";

const { superUserCommand } = config;
const execAsPromiseMock = jest.fn(() =>
    Promise.resolve({ stdout: "Out", stderr: "Err" })
);
const utilMock = jest
    .spyOn(util, "promisify")
    .mockImplementation(() => execAsPromiseMock);
const logMock = jest.spyOn(console, "log").mockImplementation(text => text);
const errorMock = jest.spyOn(console, "error").mockImplementation(text => text);
const setTimeoutMock = jest
    .spyOn(timers, "setTimeout")
    .mockImplementation(() => Promise.resolve());

describe("spawn", () => {
    it("should execute command with arguments", done => {
        const command = "echo";
        const args = ["Hello", "World!"];
        const expectedOutput = "Out";
        const fullCommand = `echo Hello World!`;

        spawn(command, args)
            .then(outProcess => {
                expect(utilMock).toBeCalledTimes(1);
                expect(execAsPromiseMock).toBeCalledTimes(1);
                expect(logMock).toBeCalledTimes(1);
                expect(execAsPromiseMock).toBeCalledWith(fullCommand);
                expect(outProcess.exitCode).toBe(0);
                expect(outProcess.output).toBe(expectedOutput);
            })
            .finally(done);
    });

    it("should also handle string arguments", done => {
        const command = "echo";
        const args = "Hello World!";
        const fullCommand = `echo Hello World!`;

        spawn(command, args)
            .then(() => {
                expect(execAsPromiseMock).toBeCalledTimes(1);
                expect(execAsPromiseMock).toHaveBeenCalledWith(fullCommand);
            })
            .finally(done);
    });

    it("should not log output to console when silent", done => {
        const command = "echo";
        const args = "Hello World!";

        spawn(command, args, true)
            .then(() => {
                expect(logMock).not.toBeCalled();
            })
            .finally(done);
    });

    it("should handle super user privileges", done => {
        const command = "echo";
        const args = "Hello World!";
        const fullCommand = `${superUserCommand} echo Hello World!`;

        spawn(command, args, undefined, true)
            .then(() => {
                expect(execAsPromiseMock).toBeCalledWith(fullCommand);
            })
            .finally(done);
    });

    it("should fail on invalid command", done => {
        const command = "echo";
        const args = "Hello World!";
        execAsPromiseMock.mockImplementation(() => {
            const error: ExecException = new Error("Test Error");
            error.code = 1;
            throw error;
        });

        spawn(command, args)
            .then(outProcess => {
                expect(execAsPromiseMock).toThrow();
                expect(errorMock).toBeCalledTimes(2);
                expect(logMock).toBeCalledTimes(6);
                expect(setTimeoutMock).toBeCalledTimes(3);
                expect(outProcess.exitCode).toBe(1);
                expect(outProcess.output).toBe("Test Error");
            })
            .finally(done);
    });

    it("should fail fast on invalid command when configured", done => {
        const command = "echo";
        const args = "Hello World!";
        execAsPromiseMock.mockImplementation(() => {
            const error: ExecException = new Error("Test Error");
            error.code = 1;
            throw error;
        });
        jest.replaceProperty(config, "failFast", true);

        const output = spawn(command, args);

        output
            .catch(error => {
                expect(error).toBeInstanceOf(FailFastError);
                expect(setTimeoutMock).not.toBeCalled();
            })
            .finally(done);
    });
});
