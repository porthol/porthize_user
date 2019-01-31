import {configureLogger, defaultWinstonLoggerOptions, getLogger} from './utils/logger';
import {getConfiguration} from './utils/configuration.helper';
import * as mongoose from 'mongoose';
import {getPackageName} from './utils/package.helper';
import {App} from './app';
import {createServer} from 'http';
import {getDatabaseConnectionUrl} from './utils/connection.helper';
import {CommunicationHelper} from './utils/communication.helper';
import {configureModels} from './configure';
import {initData} from './utils/InitData.helper';
import {CustomError, CustomErrorCode} from './utils/CustomError';
import {exportRoutes} from './utils/router.manager';

const appName = getPackageName();

const config: any = getConfiguration();

export const communicationHelper = new CommunicationHelper(config[appName].traefik);

const server = async (appName: string) => {
  try {
    configureLogger('default', defaultWinstonLoggerOptions);


    if (config[appName] && config[appName].databases) {
      const databaseUrl = getDatabaseConnectionUrl();
      const mongooseOptions: any = { useMongoClient: true };
      if (config[appName].databases.length > 1) {
        mongooseOptions.replicaSet = 'rs0';
      }
      if (databaseUrl) {
        // todo Check database connection https://github.com/Automattic/mongoose/pull/6652 commit 727eda48bcecfb8f4462162863e7beb7bca18fdb
        const mongooseObj: any = await mongoose.connect(
          databaseUrl,
          mongooseOptions);
        const databaseConnection = mongooseObj.connections[0]; // default conn
        getLogger('default').log('info',
          'Connection on database ready state is ' + databaseConnection.states[databaseConnection.readyState]);
      } else {
        throw new CustomError(CustomErrorCode.ERRINTERNALSERVER, 'The database url can not be configured, you should check config.json');
      }
    }

    // I should have a var with the database state available every where
    // Model initialisation
    configureModels();
    await initData();

    const app: App = new App({
      appName,
      configuration: config
    });
    const expressApp = await app.bootstrap();

    const port = expressApp.get('port') || 3000;
    const server = createServer(expressApp);

    server.listen(port);

    // Other http server related stuff...
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.syscall !== 'listen') {
        throw error;
      }
      const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
      switch (error.code) {
        case 'EACCES':
          getLogger('default').log('error', `${bind} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          getLogger('default').log('error', `${bind} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });

    server.on('listening', () => {
      const addr = server.address();
      const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
      getLogger('default').log('info', '  Listening on %s in %s mode', bind, expressApp.get('env'));
      if (expressApp.get('env') === 'development') {
        getLogger('default').log('info', '  Press CTRL-C to stop\n');
      }
    });

    await exportRoutes(config[appName].authorizationService);

  } catch (err) {
    getLogger('default').log('error', err.message || err);
    process.exit(1);
  }
};

export default server(appName);
