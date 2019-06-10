import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as helmet from 'helmet';
import * as cors from 'cors';
import { configureRouter } from './configure';
import { addStartTime, expressMetricsMiddleware } from './utils/express-metrics.middleware';
import { handleErrorMiddleware } from './utils/handle-error.middleware';
import * as uuid from 'uuid/v4';
import { communicationHelper } from './server';
import { configureLogger, defaultWinstonLoggerOptions, getLogger } from './utils/logger';
import { internalExportRoutes } from './utils/router.manager';
import { initData, internalExportPrivileges } from './utils/init-data.helper';
import { getDatabaseConnectionUrl } from './utils/connection.helper';
import * as mongoose from 'mongoose';
import { serviceManager } from './utils/service.manager';
import { UserService } from './user/user.service';
import { initContextMiddleware } from './utils/init-context.middleware';
import { pagingMiddleware } from './utils/paging.middleware';

configureLogger('mainApp', defaultWinstonLoggerOptions);

export class App {
    private readonly _uuid: string;

    private _appName: string;
    private renewTimeOut: number;
    private registered = false;
    private routesExport = false;
    private privilegesExport = false;
    private dbConnected = false;
    private _isReady = false;
    private _listenerOnReady: () => void;

    constructor(params: any) {
        this._expressApp = express();

        this.appName = params.appName;

        if (params.configuration) {
            if (this.appName in params.configuration) {
                this.configuration = params.configuration[this.appName];
            }
        }

        this._expressApp.set('port', params.port || process.env.PORT || 3000);
        this._expressApp.set('env', params.env || process.env.NODE_ENV || 'development');
        this._uuid = uuid();
    }

    private _token: string;

    get token(): string {
        return this._token;
    }

    get isReady(): boolean {
        return this._isReady;
    }

    private setIsReady(value: boolean) {
        this._isReady = value;
        this._listenerOnReady();
    }

    set listenerOnReady(value: () => void) {
        this._listenerOnReady = value;
    }

    get appName(): string {
        return this._appName;
    }

    set appName(value: string) {
        this._appName = value;
    }

    get uuid(): string {
        return this._uuid;
    }

    private _expressApp: express.Application;

    get expressApp(): express.Application {
        return this._expressApp;
    }

    set expressApp(value: express.Application) {
        this._expressApp = value;
    }

    private _port: number;

    get port(): number {
        return this._port;
    }

    set port(value: number) {
        this._port = value;
    }

    private _configuration?: { [key: string]: any };

    get configuration(): { [p: string]: any } {
        return this._configuration;
    }

    set configuration(value: { [p: string]: any }) {
        this._configuration = value;
    }

    async registerAppRouters() {
        const appRouters: express.Router[] = configureRouter(this.configuration);
        // Mount public router to /
        this.expressApp.use('/', appRouters[0]);

        if (appRouters[1]) {
            // Mount private router to /_appName
            this.expressApp.use(`/_${this.appName}`, appRouters[1]);
        }
    }

    applyExpressMiddlewaresRouter(): void {
        this.expressApp.use(initContextMiddleware);
        this.expressApp.use(addStartTime);
        this.expressApp.use(bodyParser.json());
        this.expressApp.use(bodyParser.urlencoded({ extended: true }));
        this.expressApp.use(helmet());
        this.expressApp.use(cors());
        this.expressApp.use(expressMetricsMiddleware);
        this.expressApp.use(pagingMiddleware);
    }

    async bootstrap() {
        await this.previousBootstrap();
        this.applyExpressMiddlewaresRouter();
        await this.registerAppRouters();
        this.expressApp.use(handleErrorMiddleware); // error handler middleware should be put after router
        await this.nextBootstrap();
    }

    private async nextBootstrap() {
        try {
            if (!this.registered) {
                await this.internalRegisterApp();
                this.registered = true;
            }
            if (!this.routesExport) {
                await internalExportRoutes();
                this.routesExport = true;
            }

            if (!this.privilegesExport) {
                await internalExportPrivileges();
                this.privilegesExport = true;
            }

            this.setIsReady(this.registered && this.routesExport && this.privilegesExport && this.dbConnected);
        } catch (err) {
            const retryTime = 30;
            getLogger('mainApp').log(
                'error',
                'Can not initiate authorization correctly, retrying in %d secs',
                retryTime
            );
            getLogger('mainApp').log('error', err);
            setTimeout(this.nextBootstrap.bind(this), retryTime * 1000);
        }
    }

    async registerApp() {
        const response = await communicationHelper.post(
            this.configuration.authorizationService.registerAppRoute,
            {
                'internal-request': this.uuid
            },
            {
                uuid: this.uuid
            }
        );

        this._token = response.body.token;
        this.renewTimeOut = response.body.renewTimeOut;
        setTimeout(this.renewToken.bind(this), this.renewTimeOut);
        getLogger('mainApp').log('info', 'App registered on authorization service');
    }

    async internalRegisterApp() {
        const tokenObj = await UserService.get().createBotUser(this.uuid);
        this._token = tokenObj.token;
        this.renewTimeOut = parseInt(tokenObj.renewTimeOut, 0);
        setTimeout(this.renewToken.bind(this), this.renewTimeOut);
        getLogger('mainApp').log('info', 'App registered on authorization service');
    }

    async renewToken() {
        try {
            const response = await communicationHelper.post(
                this.configuration.authorizationService.renewTokenRoute,
                {
                    'internal-request': this.uuid
                },
                {
                    token: 'Bearer ' + this.token
                },
                null,
                true
            );

            this._token = response.body.token;
            this.renewTimeOut = response.body.renewTimeOut;
            setTimeout(this.renewToken.bind(this), this.renewTimeOut);
        } catch (err) {
            getLogger('mainApp').log('error', 'Can not renew the ' + this.appName + ' token on authorization service');
            getLogger('mainApp').log('error', 'Retry in ' + this._configuration.registerRetryTime / 1000 + ' sec(s)');
            getLogger('mainApp').log('error', err.message);

            // if we can't register the service we retry in X secs
            setTimeout(this.renewToken.bind(this), this._configuration.registerRetryTime);
        }
    }

    private async previousBootstrap() {
        try {
            if (!this.dbConnected) {
                const databaseUrl = getDatabaseConnectionUrl();
                const mongooseOptions: any = { useNewUrlParser: true };
                if (this.configuration.databases.length > 1) {
                    mongooseOptions.replicaSet = 'rs0';
                }
                if (databaseUrl) {
                    const mongooseObj: any = await mongoose.connect(databaseUrl, mongooseOptions);
                    const databaseConnection = mongooseObj.connections[0]; // default conn

                    databaseConnection.on('disconnected', () => {
                        getLogger('mainApp').log('warn', 'Database has been disconnected from the micro-service');
                    });

                    databaseConnection.on('connected', () => {
                        getLogger('mainApp').log(
                            'info',
                            'Connection on database ready state is ' +
                                databaseConnection.states[databaseConnection.readyState]
                        );
                    });
                } else {
                    getLogger('mainApp').log('warn', 'The database url can not be configured.');
                }
                this.dbConnected = true;
            }

            serviceManager.initService();
            await initData();

            this.setIsReady(this.registered && this.routesExport && this.privilegesExport && this.dbConnected);
        } catch (err) {
            const retryTime = 10;
            getLogger('mainApp').log('error', 'Can not initiate db correctly, retrying in %d secs', retryTime);
            getLogger('mainApp').log('error', err);
            setTimeout(this.previousBootstrap.bind(this), retryTime * 1000);
        }
    }
}
