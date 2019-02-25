import { configureLogger, defaultWinstonLoggerOptions, getLogger } from './utils/logger';
import { getConfiguration } from './utils/configuration.helper';
import * as mongoose from 'mongoose';
import { getPackageName } from './utils/package.helper';
import { App } from './app';
import { createServer } from 'http';
import { getDatabaseConnectionUrl } from './utils/connection.helper';
import { CommunicationHelper } from './utils/communication.helper';
import { configureServices } from './configure';
import { initData, initPrivileges } from './utils/init-data.helper';
import { CustomError, CustomErrorCode } from './utils/custom-error';
import { exportRoutes } from './utils/router.manager';
import { AmqpManager } from './utils/amqp.manager';

const appName = getPackageName();

const config: any = getConfiguration();

export const communicationHelper = new CommunicationHelper(config[appName].traefik);

export const amqpManager = new AmqpManager(config[appName].rabbitmq);

export const app: App = new App({
    appName,
    configuration: config
});

const server = async (appName: string) => {
    try {
        configureLogger('default', defaultWinstonLoggerOptions);

        if (config[appName] && config[appName].databases) {
            const databaseUrl = getDatabaseConnectionUrl();
            const mongooseOptions: any = { useNewUrlParser: true };
            if (config[appName].databases.length > 1) {
                mongooseOptions.replicaSet = 'rs0';
            }
            if (databaseUrl) {
                // todo Check database connection
                //  https://github.com/Automattic/mongoose/pull/6652 commit 727eda48bcecfb8f4462162863e7beb7bca18fdb
                const mongooseObj: any = await mongoose.connect(databaseUrl, mongooseOptions);
                const databaseConnection = mongooseObj.connections[0]; // default conn
                getLogger('default').log(
                    'info',
                    'Connection on database ready state is ' + databaseConnection.states[databaseConnection.readyState]
                );
            } else {
                throw new CustomError(
                    CustomErrorCode.ERRINTERNALSERVER,
                    'The database url can not be configured, you should check config.json'
                );
            }
        }

        // I should have a var with the database state available every where
        // Model initialisation
        configureServices();
        await initData();

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

            // Place here all action to do after starting is complete
            app.registerApp()
                .then(() => {
                    getLogger('default').log('info', 'App correctly registered.');
                    return exportRoutes(config[appName]);
                })
                .then(() => {
                    getLogger('default').log('info', 'Routes exported');
                    return initPrivileges(config[appName]);
                })
                .then(() => {
                    getLogger('default').log('info', 'Privileges exported');
                })
                .catch(err => {
                    getLogger('default').log(
                        'error',
                        'An error has been thrown the micro service can not be start normally'
                    );
                    getLogger('default').log('error', err.message || err);
                    getLogger('default').log('error', 'Exiting with code 1...');
                    process.exit(1);
                });
        });
    } catch (err) {
        getLogger('default').log('error', err.message || err);
        process.exit(1);
    }
};

export default server(appName);
