import { describe, expect, it, jest } from "@jest/globals";
import readline from "readline/promises";
import { getUserInput } from "./userInput";
import { QUESTION } from "../message/message.const";

const readlineQuestionMock = jest.fn((message: string) =>
    Promise.resolve(message)
);
const readlineCloseMock = jest.fn();
const createInterfaceMock = jest
    .spyOn(readline, "createInterface")
    .mockImplementation(
        () =>
            ({
                question: readlineQuestionMock,
                close: readlineCloseMock,
            } as unknown as readline.Interface)
    );

describe("getUserInput", () => {
    it("returns user response", done => {
        const expectedResponse = "User Response";
        const expectedQuestion = `${QUESTION}: My Question\n`;
        readlineQuestionMock.mockImplementationOnce(() =>
            Promise.resolve(expectedResponse)
        );

        getUserInput("My Question")
            .then(userResponse => {
                expect(createInterfaceMock).toBeCalledTimes(1);
                expect(readlineQuestionMock).toBeCalledTimes(1);
                expect(readlineCloseMock).toBeCalledTimes(1);
                expect(readlineQuestionMock).toBeCalledWith(expectedQuestion);
                expect(userResponse).toBe(expectedResponse);
            })
            .finally(done);
    });
});
