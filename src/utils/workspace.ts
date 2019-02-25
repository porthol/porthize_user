import {
    configureLogger,
    defaultWinstonLoggerOptions,
    getLogger
} from './logger';
import { getPackageName } from './package.helper';
import { getConfiguration } from './configuration.helper';
import { app, communicationHelper } from '../server';
import { MongoConnection } from './mongo-connection';
import { serviceManager } from './service.manager';
import { exportRoutes } from './router.manager';
import { initData, initPrivileges } from './init-data.helper';

const loggerName = 'workspace-initializer';
configureLogger(loggerName, defaultWinstonLoggerOptions);

const appName = getPackageName();

const config: any = getConfiguration()[appName];

export class Workspace {
    static readonly instances: Workspace[] = [];

    constructor(private key: string) {}

    async init() {
        getLogger(loggerName).log(
            'info',
            'Initializing %s workspace...',
            this.key
        );
        getLogger(loggerName).log('info', 'Mongodb connection...');
        const connection = new MongoConnection(this.key);
        await connection.init();

        // init service Manager to receive models
        serviceManager.initWS(this.key);

        getLogger(loggerName).log('info', 'Init default data');
        await initData(this.key);

        getLogger(loggerName).log('info', 'Exporting routes');
        await exportRoutes(this.key, config);

        getLogger(loggerName).log('info', 'Exporting default privileges');
        await initPrivileges(
            this.key,
            config.authorizationService.rolePrivilegeRoute
        );

        Workspace.instances.push(this);
        getLogger(loggerName).log('info', 'Workspace %s initialized', this.key);
    }

    static getWorkspaceLocally(wsKey: string) {
        return this.instances.find(ws => {
            return ws.key === wsKey;
        });
    }

    static async getWorkspaces(): Promise<any[]> {
        const response = await communicationHelper.get(
            config.workspaceService.getAllRoute,
            {
                'internal-request': app.token
            },
            null,
            true
        );

        return response.body;
    }

    static async workspaceExist(key: string) {
        const response = await communicationHelper.get(
            config.workspaceService.existRoute.replace('{key}', key),
            {
                'internal-request': app.token
            },
            null,
            true
        );

        return response.body.length > 0;
    }
}
