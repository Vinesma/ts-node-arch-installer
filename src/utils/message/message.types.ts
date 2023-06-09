type TBasicMessage = (text: string) => void;
type TNumberedMessages = (textList: Array<string>) => void;
type TChoiceMessage = (
    choices: string[],
    allowExit?: boolean
) => Promise<string>;
type TStringQuestionMessage = (text: string) => Promise<string>;
type TIntegerQuestionMessage = (text: string) => Promise<number>;
type TBooleanQuestionMessage = (text: string) => Promise<boolean>;
interface IQuestionMessage {
    stringQuestionMessage: TStringQuestionMessage;
    integerQuestionMessage: TIntegerQuestionMessage;
    booleanQuestionMessage: TBooleanQuestionMessage;
}

export { TBasicMessage, TNumberedMessages, TChoiceMessage, IQuestionMessage };
