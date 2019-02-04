import * as request from 'request-promise';
import { RequestPromiseOptions } from 'request-promise';
import { UriOptions } from 'request';

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

  async get(serviceName: string, path: string, headers?: Headers) {
    return await request.get(this.generateOptions(serviceName, path, headers));
  }

  async post(serviceName: string, path: string, headers?: Headers, body?: any) {
    return await request.post(this.generateOptions(serviceName, path, headers, body));
  }

  async put(serviceName: string, path: string, headers?: Headers, body?: any) {
    return await request.put(this.generateOptions(serviceName, path, headers, body));
  }

  async delete(serviceName: string, path: string, headers?: Headers) {
    return await request.delete(this.generateOptions(serviceName, path, headers));
  }

  private generateOptions(serviceName: string, path: string, headers?: Headers, body?: any): UriOptions & RequestPromiseOptions {
    const uri = this.getBaseUrl() + path;

    if(!headers) {
      headers = {};
    }

    headers.Host = this.config.nameRules.replace('{serviceName}',serviceName);

    const options: UriOptions & RequestPromiseOptions = {
      headers,
      uri,
      resolveWithFullResponse: true
    };

    if (body) {
      options.body = body;
      options.json = true;
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

