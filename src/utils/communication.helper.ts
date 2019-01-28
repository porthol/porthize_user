import * as rp from 'request-promise';
import { RequestPromiseOptions } from 'request-promise';
import { UriOptions } from 'request';

interface Headers {
  [key: string]: string;
}

interface IConfigCommunicationHelper {
  gatewayAddress: string;
  gatewayPort: number;

}

export class CommunicationHelper {

  constructor(
    private config: IConfigCommunicationHelper
  ) {
  }

  async get(serviceName: string, path: string, headers?: Headers) {
    return await rp.get(this.generateOptions(serviceName, path, headers));
  }

  async post(serviceName: string, path: string, headers?: Headers, body?: any) {
    return await rp.post(this.generateOptions(serviceName, path, headers, body));
  }

  async put(serviceName: string, path: string, headers?: Headers, body?: any) {
    return await rp.put(this.generateOptions(serviceName, path, headers, body));
  }

  async delete(serviceName: string, path: string, headers?: Headers) {
    return await rp.delete(this.generateOptions(serviceName, path, headers));
  }

  private generateOptions(serviceName: string, path: string, headers?: Headers, body?: any): UriOptions & RequestPromiseOptions {
    const uri = this.getBaseUrl() + path;

    if(!headers) {
      headers = {};
    }

    headers.Host = serviceName + '.service';

    const options: UriOptions & RequestPromiseOptions = {
      headers,
      uri,
      resolveWithFullResponse: true
    };

    if (body) {
      options.body = body;
      options.json = true;
    }

    console.log(options);

    return options;
  }

  private getBaseUrl() {
    let uri = `http://${this.config.gatewayAddress}`;
    if (this.config.gatewayPort !== 80) {
      uri += this.config.gatewayPort;
    }
    return uri + '/api/';
  }
}

