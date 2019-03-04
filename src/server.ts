import { configureLogger, defaultWinstonLoggerOptions, getLogger } from './utils/logger';
import { getConfiguration } from './utils/configuration.helper';
import { getPackageName } from './utils/package.helper';
import { App } from './app';
import { createServer } from 'http';
import { CommunicationHelper } from './utils/communication.helper';
import { AmqpManager } from './utils/amqp.manager';

const appName = getPackageName();

const config: any = getConfiguration();

export const communicationHelper = new CommunicationHelper(config[appName].traefik);

export const amqpManager = new AmqpManager(config[appName].rabbitmq);

export const app: App = new App({
    appName,
    configuration: config
});

const server = async () => {
    try {
        configureLogger('default', defaultWinstonLoggerOptions);

        const server = createServer(app.expressApp);

        app.listenerOnReady = listenIfReady; // todo correct server not defined

        await app.bootstrap();

        function listenIfReady() {
            if (app.isReady) {
                const port = app.expressApp.get('port') || 3000;
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
                    getLogger('default').log('info', 'Listening on %s in %s mode', bind, app.expressApp.get('env'));
                    if (app.expressApp.get('env') === 'development') {
                        getLogger('default').log('info', 'Press CTRL-C to stop\n');
                    }
                });
            } else {
                getLogger('default').log('warn', 'App is not ready to listen, waiting to be ready ' + app.isReady);
            }
        }
    } catch (err) {
        getLogger('default').log('error', err.message || err);
        process.exit(1);
    }
};

export default server();
