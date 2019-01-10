import { configureLogger, defaultWinstonLoggerOptions, getLogger } from './utils/logger';
import { getConfiguration } from './utils/configurationHelper';
import * as mongoose from 'mongoose';
import { getPackageName } from './utils/packageHelper';
import { App } from './app';
import { createServer } from 'http';

const appName = getPackageName();


const server = async (appName: string) => {
    try {
        configureLogger('default', defaultWinstonLoggerOptions);

        const config: any = getConfiguration();

        if (config[appName] && config[appName].database) {
            // Create database connection
            const mongooseObj: any = await mongoose.connect(
                `mongodb://${config[appName].database.host}:${config[appName].database.port}` +
                `/${config[appName].database.databaseName}`,
                { useNewUrlParser: true });
            const databaseConnection = mongooseObj.connections[0]; // default conn
            getLogger('default').log('info','Connection on database ready state is ' + databaseConnection.states[databaseConnection.readyState]);
        }

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

    }catch (err) {
        getLogger('default').log('error', err);
        process.exit(1);
    }
};

export default server(appName);
