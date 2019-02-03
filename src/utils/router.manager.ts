import { RequestHandler, Router } from 'express-serve-static-core';
import { communicationHelper } from '../server';
import { configureLogger, defaultWinstonLoggerOptions, getLogger } from './logger';
import * as pathToRegexp from 'path-to-regexp';
import * as os from 'os';

configureLogger('routerManager', defaultWinstonLoggerOptions);

export interface IRoute {
    method?: string;
    name?: string;
    handlers: RequestHandler[];
    url?: string;
    resource?: string;
    action?: string;
    regexp?: RegExp;
}

export class RouterManager {

    private _tmpUrl: string;

    constructor(
        private _router: Router
    ) {
    }

    get router(): Router {
        return this._router;
    }

    route(value: string): RouterManager {
        this._tmpUrl = value;
        return this;
    }

    get(route: IRoute): RouterManager {
        if (!route.url) {
            route.url = this._tmpUrl;
        }
        route.method = 'GET';
        this._router.get(
            route.url,
            route.handlers
        );
        this.postRoute(route);
        return this;
    }

    post(route: IRoute): RouterManager {
        if (!route.url) {
            route.url = this._tmpUrl;
        }
        route.method = 'POST';
        this._router.post(
            route.url,
            route.handlers
        );
        this.postRoute(route);
        return this;
    }

    put(route: IRoute): RouterManager {
        if (!route.url) {
            route.url = this._tmpUrl;
        }
        route.method = 'PUT';
        this._router.put(
            route.url,
            route.handlers
        );
        this.postRoute(route);
        return this;
    }

    delete(route: IRoute): RouterManager {
        if (!route.url) {
            route.url = this._tmpUrl;
        }
        route.method = 'DELETE';
        this._router.delete(
            route.url,
            route.handlers
        );
        this.postRoute(route);
        return this;
    }

    private postRoute(route: IRoute) {
        route.regexp = pathToRegexp(route.url);
        if (route.resource && route.action) {
            routes.push(route);
        }
    }
}

export const routes: IRoute[] = [];

export interface IConfigAuthorizationService {
    name: string;
    addRoute: string;
    authorizationRoute: string;
    authenticationRoute: string;
}

export async function exportRoutes(config: IConfigAuthorizationService) {
    getLogger('routerManager').log('info', 'Exporting routes to the authorization server...');
    for (const route of routes) {
        try {
            await communicationHelper.post(
                config.name,
                config.addRoute.replace('{resource}', route.resource),
                {
                    'internal-request': os.hostname()
                },
                {
                    action: route.action,
                    routes: [{
                        method: route.method,
                        url: route.url,
                        regexp: route.regexp.source
                    }]
                }
            );
        } catch (err) {
            // Silent error we do not stop the service
            if (err.statusCode >= 400) {
                getLogger('routerManager')
                    .log('warn', 'Can not add route ' + route.url +
                        ' on ' + route.method + ' to the authorization service.');
                getLogger('routerManager').log('error', JSON.stringify(err.error, null, ' '));
            }
        }
    }
}
