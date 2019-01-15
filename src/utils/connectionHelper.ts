import { getConfiguration } from './configurationHelper';
import { getPackageName } from './packageHelper';

const appName = getPackageName();

export function getDatabaseConnectionUrl() {
  const config: any = getConfiguration();

  let url = '';

  if (!(config[appName] && config[appName].databases)) {
    return null;
  }

  for (const database of config[appName].databases) {
    url += `mongodb://${database.host}:${database.port}` +
      `/${database.databaseName},`;
  }

  return url.substr(0, url.length - 1);
}
