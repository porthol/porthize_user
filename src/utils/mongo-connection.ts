import { getPackageName } from './package.helper';
import { getConfiguration } from './configuration.helper';
import * as mongoose from 'mongoose';
import { Connection } from 'mongoose';
import { CustomError, CustomErrorCode } from './custom-error';
import { getLogger } from './logger';

const appName = getPackageName();

const config: any = getConfiguration();

export class MongoConnection {
    static connections: { [ws: string]: MongoConnection } = {};
    private connection: Connection;

    constructor(private ws: string) {
    }

    public getConnection() {
        return this.connection;
    }

    async init() {
        if (config[appName] && config[appName].databases) {
            const databaseUrl = this.getDatabaseConnectionUrl(this.ws);
            const mongooseOptions: any = { useNewUrlParser: true };
            if (config[appName].databases.length > 1) {
                mongooseOptions.replicaSet = 'rs0';
            }
            if (databaseUrl) {
                this.connection = await mongoose.createConnection(databaseUrl, mongooseOptions);
                MongoConnection.connections[this.ws] = this;
                getLogger('default').log(
                    'info',
                    'Connection on %s database ready state is ' +
                    (this.connection as any).states[this.connection.readyState],
                    this.ws
                );
            } else {
                throw new CustomError(
                    CustomErrorCode.ERRINTERNALSERVER,
                    'The database url can not be configured, you should check config.json'
                );
            }
        }
    }

    private getDatabaseConnectionUrl(workspaceKey: string) {
        const config: any = getConfiguration();
        if (!config[appName].databaseName) {
            return null;
        }

        const dbName = workspaceKey + '-' + config[appName].databaseName;
        let url = 'mongodb://';

        if (!(config[appName] && config[appName].databases)) {
            return null;
        }

        for (const database of config[appName].databases) {
            url += `${database.host}:${database.port},`;
        }

        return url.substr(0, url.length - 1) + `/${dbName}`;
    }
}
