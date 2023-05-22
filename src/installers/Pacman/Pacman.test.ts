import { jest, describe, it, expect } from "@jest/globals";
import { Installer } from "../Installer";
import Pacman from "./Pacman";

jest.mock("../Installer");

const InstallerMock = jest.mocked(Installer);
const syncMock = jest
    .spyOn(Installer.prototype, "sync")
    .mockImplementation(jest.fn());
const installMock = jest
    .spyOn(Installer.prototype, "install")
    .mockImplementation(jest.fn());

describe("Pacman class", () => {
    it("should call the super constructor", () => {
        new Pacman();
        expect(InstallerMock).toBeCalledTimes(1);
    });

    it("should use the sync implementation from super", () => {
        const pacman = new Pacman();

        pacman.sync();

        expect(syncMock).toBeCalledTimes(1);
    });

    it("should use the install implementation from super but add --needed argument", () => {
        const pacman = new Pacman();
        const packagesToInstall = ["program1", "program2"];

        pacman.install(packagesToInstall);

        expect(installMock).toBeCalledTimes(1);
        expect(installMock).toHaveBeenCalledWith([
            "--needed",
            ...packagesToInstall,
        ]);
    });
});
