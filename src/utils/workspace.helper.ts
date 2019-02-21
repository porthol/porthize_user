import { getPackageName } from './package.helper';
import { getConfiguration } from './configuration.helper';
import { communicationHelper } from '../server';

const appName = getPackageName();

const config: any = getConfiguration()[appName];


export async function getWorkspaces() {
    return await communicationHelper
        .get(config.workspaceService.getAllRoute,
            null, null, true);
}

export async function workspaceExist(key: string) {
    const workspaces = await communicationHelper
        .get(config.workspaceService.existRoute.replace('{key}', key),
            null, null, true);

    return workspaces.length > 0;
}
