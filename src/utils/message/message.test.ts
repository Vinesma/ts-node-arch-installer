import { describe, expect, it } from "@jest/globals";
import { ALERT, BIG_ARROW, INFO, PADDING, SHORT_ARROW } from "./message.const";
import print from "./message";

describe("message", () => {
    it("should print a simple message", () => {
        const expectedMessage = `${PADDING}${SHORT_ARROW} simple message`;

        const message = print.simple("simple message");

        expect(message).toBe(expectedMessage);
    });

    it("should print a heading message", () => {
        const expectedMessage = `${PADDING}${BIG_ARROW} heading`;

        const message = print.heading("heading");

        expect(message).toBe(expectedMessage);
    });

    it("should print a info message", () => {
        const expectedMessage = `${PADDING}${INFO}: info`;

        const message = print.info("info");

        expect(message).toBe(expectedMessage);
    });

    it("should print an alert message", () => {
        const expectedMessage = `${PADDING}${ALERT}: alert`;

        const message = print.alert("alert");

        expect(message).toBe(expectedMessage);
    });

    it("should print an error message", () => {
        const expectedMessage = `${PADDING}${ALERT} ERROR: error ${ALERT}`;

        const message = print.error("error");

        expect(message).toBe(expectedMessage);
    });

    it("should print a numbered list of messages", () => {
        const expectedMessage = `${PADDING}[1]: first\n${PADDING}[2]: second\n${PADDING}[3]: third`;

        const message = print.numbered(["first", "second", "third"]);

        expect(message).toBe(expectedMessage);
    });
});
