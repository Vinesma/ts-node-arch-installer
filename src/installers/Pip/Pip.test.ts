import { jest, describe, it, expect } from "@jest/globals";
import { Installer } from "../Installer";
import Pip from "./Pip";

jest.mock("../Installer");

const InstallerMock = jest.mocked(Installer);
const syncMock = jest
    .spyOn(Installer.prototype, "sync")
    .mockImplementation(jest.fn());
const installMock = jest
    .spyOn(Installer.prototype, "install")
    .mockImplementation(jest.fn());

describe("Pip class", () => {
    it("should call the super constructor", () => {
        new Pip();
        expect(InstallerMock).toBeCalledTimes(1);
    });

    it("should not have a sync implementation", () => {
        const pip = new Pip();

        const result = pip.sync();

        expect(syncMock).not.toBeCalled();
        expect(result).toBeUndefined();
    });

    it("should use the install implementation from super", () => {
        const pip = new Pip();
        const packagesToInstall = ["program1", "program2"];

        pip.install(packagesToInstall);

        expect(installMock).toBeCalledTimes(1);
    });
});
