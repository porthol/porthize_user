import { getConfiguration } from './configurationHelper';
import { getPackageName } from './packageHelper';

const appName = getPackageName();

export function getDatabaseConnectionUrl() {
  const config: any = getConfiguration();

  let url = 'mongodb://';

  if (!(config[appName] && config[appName].databases)) {
    return null;
  }

  for (const database of config[appName].databases) {
    url += `${database.host}:${database.port},`;
  }

  return url.substr(0, url.length - 1) + `/${config[appName].databaseName}`;
}
