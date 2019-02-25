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
import { workspaceMiddleware } from './utils/workspace.middleware';
import { Workspace } from './utils/workspace';

configureLogger('mainApp', defaultWinstonLoggerOptions);

export class App {
    private readonly _uuid: string;

    private _appName: string;
    private renewTimeOut: number;

    constructor(params: any) {
        this._app = express();

        this.appName = params.appName;

        if (params.configuration) {
            if (this.appName in params.configuration) {
                this.configuration = params.configuration[this.appName];
            }
        }

        this._app.set('port', params.port || process.env.PORT || 3000);
        this._app.set('env', params.env || process.env.NODE_ENV || 'development');
        this._uuid = uuid();
    }

    private _token: string;

    get token(): string {
        return this._token;
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

    private _app: express.Application;

    get app(): express.Application {
        return this._app;
    }

    set app(value: express.Application) {
        this._app = value;
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
        this.app.use('/', appRouters[0]);

        if (appRouters[1]) {
            // Mount private router to /_appName
            this.app.use(`/_${this.appName}`, appRouters[1]);
        }
    }

    applyExpressMiddlewaresRouter(): void {
        this.app.use(addStartTime);
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(helmet());
        this.app.use(cors());
        this.app.use(expressMetricsMiddleware);
        this.app.use(workspaceMiddleware);
    }

    async bootstrap(): Promise<express.Application> {
        this.applyExpressMiddlewaresRouter();
        await this.registerAppRouters();
        this.app.use(handleErrorMiddleware); // error handler middleware have to be in last
        await this.registerApp();
        await this.loadWorkspace();
        return this.app;
    }

    async registerApp() {
        const response = await communicationHelper.post(
            this.configuration.authorizationService.registerAppRoute,
            {
                'internal-request': this.uuid,
                workspace: this.configuration.mainWorkspace
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

    async renewToken() {
        try {
            const response = await communicationHelper.post(
                this.configuration.authorizationService.renewTokenRoute,
                {
                    'internal-request': this.uuid,
                    workspace: this.configuration.mainWorkspace
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

    async loadWorkspace() {
        const workspaces = await Workspace.getWorkspaces();

        for (const workspace of workspaces) {
            if (!Workspace.getWorkspaceLocally(workspace)) {
                const ws = new Workspace(workspace.key);
                await ws.init();
            }
        }
    }
}
