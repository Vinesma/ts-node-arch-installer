import { jest, describe, it, expect } from "@jest/globals";
import { Installer } from "../Installer";
import Aur from "./Aur";

jest.mock("../Installer");

const InstallerMock = jest.mocked(Installer);
const syncMock = jest
    .spyOn(Installer.prototype, "sync")
    .mockImplementation(jest.fn());
const installMock = jest
    .spyOn(Installer.prototype, "install")
    .mockImplementation(jest.fn());

describe("Aur class", () => {
    it("should call the super constructor", () => {
        new Aur();
        expect(InstallerMock).toBeCalledTimes(1);
    });

    it("should use the sync implementation from super", () => {
        const aur = new Aur();

        aur.sync();

        expect(syncMock).toBeCalledTimes(1);
    });

    it("should use the install implementation from super", () => {
        const aur = new Aur();
        const packagesToInstall = ["program1", "program2"];

        aur.install(packagesToInstall);

        expect(installMock).toBeCalledTimes(1);
    });
});
