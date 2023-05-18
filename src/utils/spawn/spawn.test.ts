import { describe, expect, it, jest } from "@jest/globals";
import spawn from "./spawn";
import timers from "timers/promises";

const setTimeoutMock = jest
    .spyOn(timers, "setTimeout")
    .mockImplementation(() => Promise.resolve());

describe("spawn", () => {
    it("should execute command with arguments", done => {
        const command = "echo";
        const args = ["Hello", "World!"];
        const expectedOutput = "Hello World!\n";

        spawn(command, args)
            .then(outProcess => {
                expect(outProcess.exitCode).toBe(0);
                expect(outProcess.output).toBe(expectedOutput);
            })
            .finally(() => {
                done();
            });
    });

    it("should fail on invalid command", done => {
        const command = "false";
        const args: Array<string> = [];
        const expectedOutput = "";

        spawn(command, args)
            .catch(error => {
                expect(error.exitCode).toBe(1);
                expect(error.output).toBe(expectedOutput);
                expect(setTimeoutMock).toHaveBeenCalledTimes(3);
            })
            .finally(() => {
                done();
            });
    });
});
