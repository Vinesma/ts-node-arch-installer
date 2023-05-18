import {
    TBasicMessage,
    TNumberedMessages,
    IQuestionMessage,
    TChoiceMessage,
} from "./message.types";
import { PADDING, BIG_ARROW, SHORT_ARROW, INFO, ALERT } from "./message.const";
import { getUserInput } from "../userInput";

const breakLine = () => {
    console.log("");
};

const headingMessage: TBasicMessage = text => {
    const message = `${PADDING}${BIG_ARROW} ${text}`;
    console.log(message);
    breakLine();
};

const simpleMessage: TBasicMessage = text => {
    const message = `${PADDING}${SHORT_ARROW} ${text}`;
    console.log(message);
};

const infoMessage: TBasicMessage = text => {
    const message = `${PADDING}${INFO}: ${text}`;
    console.log(message);
};

const alertMessage: TBasicMessage = text => {
    const message = `${PADDING}${ALERT}: ${text}`;
    breakLine();
    console.log(message);
};

const errorMessage: TBasicMessage = text => {
    const message = `${PADDING}${ALERT} ERROR: ${text} ${ALERT}`;
    breakLine();
    console.error(message);
};

const numberedMessages: TNumberedMessages = textList => {
    let message = "";

    textList.forEach((text, index) => {
        message = `${message}${PADDING}[${index + 1}]: ${text}`;

        if (index !== textList.length - 1) {
            message = `${message}\n`;
        }
    });

    console.log(message);
};

const stringQuestionMessage: IQuestionMessage["stringQuestionMessage"] =
    async text => {
        const response = await getUserInput(text);
        return response;
    };

const integerQuestionMessage: IQuestionMessage["integerQuestionMessage"] =
    async text => {
        let responseAsNumber;

        do {
            const response = await getUserInput(text);
            responseAsNumber = Number(response);

            if (isNaN(responseAsNumber)) {
                alertMessage("Response must be an integer.");
            }
        } while (isNaN(responseAsNumber));

        return responseAsNumber;
    };

const booleanQuestionMessage: IQuestionMessage["booleanQuestionMessage"] =
    async text => {
        const response = await getUserInput(`${text} (Y/n)`);
        return response.toLowerCase() !== "n";
    };

const choiceMessage: TChoiceMessage = async (choices, allowExit = false) => {
    if (choices.length === 0) {
        alertMessage("Nothing to choose from.");
        return "";
    }

    const choiceRows = [...choices];
    let choice: string | undefined = undefined;

    if (allowExit) {
        choiceRows.push("EXIT");
    }

    while (choice === undefined) {
        numberedMessages(choiceRows);

        const selectedIndex = await integerQuestionMessage(
            "Which do you choose?"
        );

        choice = choiceRows?.[selectedIndex - 1];

        if (!choice) {
            if (allowExit) {
                choice = "EXIT";
            } else {
                alertMessage("Your choice is invalid, try again.");
            }
        }
    }

    return choice;
};

const print = {
    simple: simpleMessage,
    heading: headingMessage,
    info: infoMessage,
    alert: alertMessage,
    error: errorMessage,
    numbered: numberedMessages,
    question: {
        toString: stringQuestionMessage,
        toInteger: integerQuestionMessage,
        toBoolean: booleanQuestionMessage,
        choice: choiceMessage,
    },
};

export default print;
