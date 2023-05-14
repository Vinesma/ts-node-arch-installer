import { describe, expect, it } from "@jest/globals";
import os from "node:os";
import File from "./File";

describe("A file", () => {
    it("should handle '~' in filepaths", () => {
        const file = new File("test.txt", "~/Projects");
        const expectedPath = `${os.homedir()}/Projects`;

        expect(file.destination_path).toBe(expectedPath);
    });
});
