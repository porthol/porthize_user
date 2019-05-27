import { getPackageName } from './package.helper';
import { getConfiguration } from './configuration.helper';
import * as mongoose from 'mongoose';
import { CustomError, CustomErrorCode } from './custom-error';
import { getLogger } from './logger';
import { Connection } from 'mongoose';

const appName = getPackageName();

const config: any = getConfiguration();

export class MongoConnection {
    static connections: { [key: string]: MongoConnection } = {};
    private connection: Connection;

    constructor() {}

    public getConnection() {
        return this.connection;
    }

    async init(key: string) {
        if (config[appName] && config[appName].databases) {
            const databaseUrl = this.getDatabaseConnectionUrl();
            const mongooseOptions: any = { useNewUrlParser: true };
            if (config[appName].databases.length > 1) {
                mongooseOptions.replicaSet = 'rs0';
            }
            if (databaseUrl) {
                this.connection = await mongoose.createConnection(databaseUrl, mongooseOptions);
                MongoConnection.connections[key] = this;
                getLogger('default').log(
                    'info',
                    'Connection on database ready state is ' +
                        (this.connection as any).states[this.connection.readyState],
                );
            } else {
                throw new CustomError(
                    CustomErrorCode.ERRINTERNALSERVER,
                    'The database url can not be configured, you should check config.json'
                );
            }
        }
    }

    private getDatabaseConnectionUrl() {
        const config: any = getConfiguration();
        if (!config[appName].databaseName) {
            return null;
        }

        const dbName = config[appName].databaseName;
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
