export type TSpawn = (
    name: string,
    args?: Array<string>,
    silent?: boolean,
    capture?: boolean,
    super_user?: boolean
) => Promise<TSpawnReturn>;

export type TSpawnReturn = {
    output: string;
    exitCode: number;
};
