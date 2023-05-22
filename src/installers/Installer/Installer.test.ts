import { describe, it, jest, expect } from "@jest/globals";
import { spawn } from "../../utils/spawn";
import Installer from "./Installer";

jest.mock("../../utils/spawn");

const spawnMock = jest.mocked(spawn);

describe("Installer class", () => {
    const installerName = "command";
    const installArg = "install";
    const syncArg = "installSync";
    const noConfirmArg = "--no-confirm";
    const packagesToInstall = ["program1", "program2"];

    it("should sync repositories with the correct arguments", () => {
        const installer = new Installer(
            installerName,
            installArg,
            syncArg,
            noConfirmArg,
            false
        );
        const installerWithFewerProperties = new Installer(
            installerName,
            installArg
        );

        installer.sync(packagesToInstall);
        expect(spawnMock).toBeCalledWith(
            installerName,
            [noConfirmArg, syncArg, ...packagesToInstall],
            false,
            false,
            false
        );
        spawnMock.mockReset();

        installerWithFewerProperties.sync(packagesToInstall);
        expect(spawnMock).toBeCalledWith(
            installerName,
            ["", "", ...packagesToInstall],
            false,
            false,
            true
        );
    });

    it("should install packages with the correct arguments", () => {
        const installer = new Installer(
            installerName,
            installArg,
            syncArg,
            noConfirmArg
        );
        const installerWithFewerProperties = new Installer(
            installerName,
            installArg
        );

        installer.install(packagesToInstall);
        expect(spawnMock).toBeCalledWith(
            installerName,
            [noConfirmArg, installArg, ...packagesToInstall],
            false,
            false,
            true
        );
        spawnMock.mockReset();

        installerWithFewerProperties.install(packagesToInstall);
        expect(spawnMock).toBeCalledWith(
            installerName,
            ["", installArg, ...packagesToInstall],
            false,
            false,
            true
        );
    });
});
