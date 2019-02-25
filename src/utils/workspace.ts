import { configureLogger, defaultWinstonLoggerOptions, getLogger } from './logger';
import { getPackageName } from './package.helper';
import { getConfiguration } from './configuration.helper';
import { app, communicationHelper } from '../server';
import { MongoConnection } from './mongo-connection';
import { serviceManager } from './service.manager';
import { internalExportRoutes } from './router.manager';
import { initData, internalInitPrivileges } from './init-data.helper';

const loggerName = 'workspace-initializer';
configureLogger(loggerName, defaultWinstonLoggerOptions);

const appName = getPackageName();

const config: any = getConfiguration()[appName];

export class Workspace {
    static readonly instances: Workspace[] = [];

    constructor(private key: string) {}

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

    async init() {
        getLogger(loggerName).log('info', 'Initializing %s workspace...', this.key);
        getLogger(loggerName).log('info', 'Mongodb connection...');
        const connection = new MongoConnection(this.key);
        await connection.init();

        getLogger(loggerName).log('info', 'Init services');
        // init service Manager to receive models
        serviceManager.initWS(this.key);

        getLogger(loggerName).log('info', 'Init default data');
        await initData(this.key);

        getLogger(loggerName).log('info', 'Exporting routes');
        await internalExportRoutes(this.key);

        getLogger(loggerName).log('info', 'Exporting default privileges');
        await internalInitPrivileges(this.key);

        Workspace.instances.push(this);
        getLogger(loggerName).log('info', 'Workspace %s initialized', this.key);
    }
}
