import { TSpawn } from "../spawn.types";

const spawn: TSpawn = async () => {
    return Promise.resolve({ exitCode: 0, output: "Test Output" });
};

export default spawn;
