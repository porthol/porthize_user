import { join, extname } from 'path';
import { path } from 'app-root-path';

const CONFIGURATION: Map<string, object> = new Map();

export function getConfiguration(configPath?: string): object {
  try {
    if (configPath) {
      configPath = join(path, configPath);
    } else {
      configPath = join(path, 'config', 'config.json');
    }

    if (['.json'].indexOf(extname(configPath)) === -1) {
      throw new Error('Extension invalid.');
    } else {
      if (!CONFIGURATION.has(configPath)) {
        const configObject = require(configPath);
        CONFIGURATION.set(configPath, configObject);
      }

      return JSON.parse(JSON.stringify(CONFIGURATION.get(configPath)));
    }
  } catch (err) {
    throw {
      code: 'ENOCONF',
      message:
        `Unable to get JSON config file application. \r\n` +
        `Please verify that the path is correct. \r\n` +
        `If you don't have define one, verify that the file /config/config.json exists.`,
      cause: err
    };
  }
}
