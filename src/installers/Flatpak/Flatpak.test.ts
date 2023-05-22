import { jest, describe, it, expect } from "@jest/globals";
import { Installer } from "../Installer";
import Flatpak from "./Flatpak";

jest.mock("../Installer");

const InstallerMock = jest.mocked(Installer);
const syncMock = jest
    .spyOn(Installer.prototype, "sync")
    .mockImplementation(jest.fn());
const installMock = jest
    .spyOn(Installer.prototype, "install")
    .mockImplementation(jest.fn());

describe("Flatpak class", () => {
    it("should call the super constructor", () => {
        new Flatpak();
        expect(InstallerMock).toBeCalledTimes(1);
    });

    it("should not have a sync implementation", () => {
        const flatpak = new Flatpak();

        const result = flatpak.sync();

        expect(syncMock).not.toBeCalled();
        expect(result).toBeUndefined();
    });

    it("should use the install implementation from super", () => {
        const flatpak = new Flatpak();
        const packagesToInstall = ["program1", "program2"];

        flatpak.install(packagesToInstall);

        expect(installMock).toBeCalledTimes(1);
    });
});
