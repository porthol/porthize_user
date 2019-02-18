import * as request from 'request-promise';
import { RequestPromiseOptions } from 'request-promise';
import { UriOptions } from 'request';
import { app } from '../server';

interface Headers {
    [key: string]: string;
}

interface IConfigCommunicationHelper {
    gatewayAddress: string;
    gatewayPort: number;
    nameRules: string;
}

export class CommunicationHelper {

    constructor(
        private config: IConfigCommunicationHelper
    ) {
    }

    async get(serviceName: string, path: string, headers?: Headers, query?: any) {
        return await request.get(this.generateOptions(serviceName, path, headers, query));
    }

    async post(serviceName: string, path: string, headers?: Headers, query?: any, body?: any) {
        return await request.post(this.generateOptions(serviceName, path, headers, query, body));
    }

    async put(serviceName: string, path: string, headers?: Headers, query?: any, body?: any) {
        return await request.put(this.generateOptions(serviceName, path, headers, query, body));
    }

    async delete(serviceName: string, path: string, headers?: Headers, query?: any) {
        return await request.delete(this.generateOptions(serviceName, path, headers, query));
    }

    private generateOptions(serviceName: string, path: string, headers?: Headers, qs?: any, body?: any): UriOptions & RequestPromiseOptions {
        const uri = this.getBaseUrl() + path;

        if (!headers) {
            headers = {};
        }

        headers.Host = this.config.nameRules.replace('{serviceName}', serviceName);

        if (!headers.authorization && app.token) {
            headers.authorization = 'Bearer ' + app.token;
        }

        const options: UriOptions & RequestPromiseOptions = {
            headers,
            uri,
            resolveWithFullResponse: true,
            json: true,
            qs
        };

        if (body) {
            options.body = body;
        }

        return options;
    }

    private getBaseUrl() {
        let uri = `http://${this.config.gatewayAddress}`;
        if (this.config.gatewayPort !== 80) {
            uri += ':' + this.config.gatewayPort;
        }
        return uri + '/api/';
    }
}

