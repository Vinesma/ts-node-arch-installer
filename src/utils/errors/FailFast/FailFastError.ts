export default class FailFastError extends Error {
    constructor() {
        super("An Error has ocurred, failing fast.");
        this.name = "FailFastError";
    }
}
