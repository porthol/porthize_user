import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as helmet from 'helmet';
import * as cors from 'cors';
import { configure } from './configure';


export class App {
    private _appName: string;
    private _app: express.Application;
    private _port: number;
    private _configuration?: { [key: string]: any };


    constructor(params: any) {
        this._app = express();

        this.appName = params.appName;

        if (params.configuration) {
            this._configuration = params.configuration;
        }

        this._app.set('_port', params.port || process.env.PORT || 3000);
        this._app.set('env', params.env || process.env.NODE_ENV || 'development');
    }


    get appName(): string {
        return this._appName;
    }

    set appName(value: string) {
        this._appName = value;
    }

    get app(): express.Application {
        return this._app;
    }

    set app(value: express.Application) {
        this._app = value;
    }

    get port(): number {
        return this._port;
    }

    set port(value: number) {
        this._port = value;
    }

    get configuration(): { [p: string]: any } {
        return this._configuration;
    }

    set configuration(value: { [p: string]: any }) {
        this._configuration = value;
    }

    async registerAppRouters() {
        let configuration;
        if (this.appName in this.configuration) {
            configuration = this.configuration[this.appName];
        }
        const appRouters: express.Router[] = configure(configuration);
        // Mount public router to /
        this.app.use('/', appRouters[0]);

        if (appRouters[1]) {
            // Mount private router to /_appName
            this.app.use(`/_${this.appName}`, appRouters[1]);
        }
    }

    applyExpressMiddlewaresRouter(): void {
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(helmet());
        this.app.use(cors());
    }

    async bootstrap(): Promise<express.Application> {
        this.applyExpressMiddlewaresRouter();
        await this.registerAppRouters();

        return this.app;
    }
}
