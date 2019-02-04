import { extname, join } from 'path';
import { path } from 'app-root-path';
import { CustomError, CustomErrorCode } from './CustomError';
import * as _ from 'lodash';

const CONFIGURATION: Map<string, object> = new Map();

export function getConfiguration(configPath?: string): any {
  try {
    const env = process.env.NODE_ENV || 'development';

    let envConfigPath;
    if (configPath) {
      configPath = join(path, configPath);
    } else {
      configPath = join(path, 'config', 'config.json');
      switch (env) {
        case 'development':
          envConfigPath = join(path, 'config', 'config.dev.json');
          break;
        case 'production':
          envConfigPath = join(path, 'config', 'config.prod.json');
          break;
      }
    }

    if (['.json'].indexOf(extname(configPath)) === -1) {
      throw new Error('Extension invalid.');
    } else {
      if (!CONFIGURATION.has(configPath)) {
        let configObject = require(configPath);
        const envConfigObject = require(envConfigPath);

        configObject = _.merge(configObject, envConfigObject);

        CONFIGURATION.set(configPath, configObject);
      }

      return JSON.parse(JSON.stringify(CONFIGURATION.get(configPath)));
    }
  } catch (err) {
    throw new CustomError(
      CustomErrorCode.ERRNOCONF,
      err.message || `Unable to get JSON config file application. \r\n` +
      `Please verify that the path is correct. \r\n` +
      `If you don't have define one, verify that the file ${configPath} exists.`,
      err
    );
  }
}
