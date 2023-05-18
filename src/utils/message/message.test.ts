import { describe, expect, it, jest } from "@jest/globals";
import { ALERT, BIG_ARROW, INFO, PADDING, SHORT_ARROW } from "./message.const";
import print from "./message";
import { getUserInput } from "../userInput";

jest.mock("../userInput");

const logMock = jest.spyOn(console, "log").mockImplementation(text => text);
const errorMock = jest.spyOn(console, "error").mockImplementation(text => text);
const getUserInputMock = jest.mocked(getUserInput);

describe("print", () => {
    it("should print a simple message", () => {
        const expectedMessage = `${PADDING}${SHORT_ARROW} simple message`;

        print.simple("simple message");

        expect(logMock).toBeCalledTimes(1);
        expect(logMock).toHaveReturnedWith(expectedMessage);
    });

    it("should print a heading message", () => {
        const expectedMessage = `${PADDING}${BIG_ARROW} heading`;

        print.heading("heading");

        expect(logMock).toBeCalledTimes(2);
        expect(logMock).toHaveNthReturnedWith(1, expectedMessage);
        expect(logMock).toHaveLastReturnedWith("");
    });

    it("should print a info message", () => {
        const expectedMessage = `${PADDING}${INFO}: info`;

        print.info("info");

        expect(logMock).toBeCalledTimes(1);
        expect(logMock).toHaveReturnedWith(expectedMessage);
    });

    it("should print an alert message", () => {
        const expectedMessage = `${PADDING}${ALERT}: alert`;

        print.alert("alert");

        expect(logMock).toBeCalledTimes(2);
        expect(logMock).toHaveNthReturnedWith(1, "");
        expect(logMock).toHaveLastReturnedWith(expectedMessage);
    });

    it("should print an error message", () => {
        const expectedMessage = `${PADDING}${ALERT} ERROR: error ${ALERT}`;

        print.error("error");

        expect(logMock).toBeCalledTimes(1);
        expect(logMock).toHaveReturnedWith("");
        expect(errorMock).toBeCalledTimes(1);
        expect(errorMock).toHaveReturnedWith(expectedMessage);
    });

    it("should print a numbered list of messages", () => {
        const expectedMessage = `${PADDING}[1]: first\n${PADDING}[2]: second\n${PADDING}[3]: third`;

        print.numbered(["first", "second", "third"]);

        expect(logMock).toBeCalledTimes(1);
        expect(logMock).toHaveReturnedWith(expectedMessage);
    });
});

describe("print.question", () => {
    it("return a string when toString", done => {
        const userResponse = "User String";
        getUserInputMock.mockResolvedValueOnce(userResponse);

        print.question
            .toString("My Question")
            .then(returnedString => {
                expect(returnedString).toBe(userResponse);
            })
            .finally(done);
    });

    it("return a integer value when toInteger", done => {
        const userResponse = 5;
        getUserInputMock.mockResolvedValueOnce(`${userResponse}`);

        print.question
            .toInteger("My Question")
            .then(returnedInteger => {
                expect(returnedInteger).toBe(userResponse);
            })
            .finally(done);
    });

    it("should ask again if value is not integer when toInteger", done => {
        const userResponseInvalid = "String";
        const userResponseValid = 5;
        getUserInputMock
            .mockResolvedValueOnce(userResponseInvalid)
            .mockResolvedValueOnce(`${userResponseValid}`);

        print.question
            .toInteger("My Question")
            .then(returnedInteger => {
                expect(returnedInteger).toBe(userResponseValid);
                expect(logMock).toBeCalledTimes(2);
                expect(getUserInputMock).toBeCalledTimes(2);
            })
            .finally(done);
    });

    it("should return false when user responds 'n' in toBoolean", done => {
        const userResponses = "n";
        getUserInputMock.mockResolvedValue(userResponses);

        print.question
            .toBoolean("My Question")
            .then(returnedBoolean => {
                expect(returnedBoolean).toBe(false);
                expect(getUserInputMock).toBeCalledTimes(1);
                expect(getUserInputMock).toBeCalledWith("My Question (Y/n)");
            })
            .finally(done);
    });

    it("should return true when user responds anything else in toBoolean", done => {
        const userResponses = "String";
        getUserInputMock.mockResolvedValue(userResponses);

        print.question
            .toBoolean("My Question")
            .then(returnedBoolean => {
                expect(returnedBoolean).toBe(true);
                expect(getUserInputMock).toBeCalledTimes(1);
                expect(getUserInputMock).toBeCalledWith("My Question (Y/n)");
            })
            .finally(done);
    });
});
