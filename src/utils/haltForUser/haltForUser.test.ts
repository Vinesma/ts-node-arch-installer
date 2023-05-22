import { describe, it, jest, expect } from "@jest/globals";
import timers from "timers/promises";
import haltForUser from "./haltForUser";

const logMock = jest.spyOn(console, "log").mockImplementation(text => text);
const setTimeoutMock = jest
    .spyOn(timers, "setTimeout")
    .mockImplementation(() => Promise.resolve());

describe("haltForUser", () => {
    it("should halt execution for the proper amount of time", done => {
        haltForUser().finally(() => {
            expect(logMock).toBeCalledTimes(4);
            expect(setTimeoutMock).toBeCalledTimes(3);
            done();
        });
    });
});
