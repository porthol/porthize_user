import { getConfiguration } from './configuration.helper';
import { getPackageName } from './package.helper';

const appName = getPackageName();

export function getDatabaseConnectionUrl() {
    const config: any = getConfiguration();
    if (!config[appName].databaseName) {
        return null;
    }

    let url = 'mongodb://';

    if (!(config[appName] && config[appName].databases)) {
        return null;
    }

    for (const database of config[appName].databases) {
        url += `${database.host}:${database.port},`;
    }

    return url.substr(0, url.length - 1) + `/${config[appName].databaseName}`;
}
