import { configureLogger, defaultWinstonLoggerOptions, getLogger } from './utils/logger';
import { getConfiguration } from './utils/configuration.helper';
import { getPackageName } from './utils/package.helper';
import { App } from './app';
import { createServer } from 'http';
import { CommunicationHelper } from './utils/communication.helper';
import { botCheck } from './utils/bot-check.helper';
import { AmqpManager } from './utils/amqp.manager';
import ms = require('ms');

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

            app.loadWorkspace().then(() => {
                getLogger('default').log('info', 'Workspaces loaded.');
            });

            // check bot account
            const time: number = parseInt(ms(config[appName].checkBotAccountTime), 0);
            botCheck(config[appName].roleBotKey, time);
        });
    } catch (err) {
        getLogger('default').log('error', err.message || err);
        process.exit(1);
    }
};

export default server(appName);
