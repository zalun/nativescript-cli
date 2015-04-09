declare module "resolve" {
    export interface IResolveSyncOptions {
        basedir?: string;
    }
    export function sync(moduleIdentifier: string, options?: IResolveSyncOptions): string;
}