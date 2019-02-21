import * as request from "request-promise";
import { RequestPromiseOptions } from "request-promise";
import { UriOptions } from "request";
import { app } from "../server";
import { configureLogger, defaultWinstonLoggerOptions, getLogger } from "./logger";

configureLogger("communicationHelper", defaultWinstonLoggerOptions);

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

    async get(path: string, headers?: Headers, query?: any, addAppToken = false) {
        return await request.get(this.generateOptions(path, headers, query, null, addAppToken));
    }

    async post(path: string, headers?: Headers, body?: any, query?: any, addAppToken = false) {
        return await request.post(this.generateOptions(path, headers, query, body, addAppToken));
    }

    async put(path: string, headers?: Headers, body?: any, query?: any, addAppToken = false) {
        return await request.put(this.generateOptions(path, headers, query, body, addAppToken));
    }

    async delete(path: string, headers?: Headers, query?: any, addAppToken = false) {
        return await request.delete(this.generateOptions(path, headers, query, null, addAppToken));
    }

    private generateOptions(path: string, headers?: Headers, qs?: any, body?: any, addAppToken = false): UriOptions & RequestPromiseOptions {
        const uri = this.getBaseUrl() + path;

        if (!headers.authorization && app.token && addAppToken) {
            headers.authorization = "Bearer " + app.token;
        }

        const options: UriOptions & RequestPromiseOptions = {
            headers,
            uri,
            resolveWithFullResponse: true,
            json: true,
            qs,
            body
        };

        getLogger("communicationHelper").log("info", "Sending request : " + JSON.stringify(options));

        return options;
    }

    private getBaseUrl() {
        let uri = `http://${this.config.gatewayAddress}`;
        if (this.config.gatewayPort !== 80) {
            uri += ":" + this.config.gatewayPort;
        }
        return uri + "/api/";
    }
}

