import { RequestHandler, Router } from 'express-serve-static-core';
import { communicationHelper } from '../server';
import { configureLogger, defaultWinstonLoggerOptions, getLogger } from './logger';

configureLogger('router.manager', defaultWinstonLoggerOptions);

export interface IRoute {
    method?: string;
    name?: string;
    handlers: RequestHandler[];
    url?: string;
    resource?: string;
    action?: string;
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
        if (route.resource && route.action) {
            routes.push(route);
        }
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
        if (route.resource && route.action) {
            routes.push(route);
        }
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
        if (route.resource && route.action) {
            routes.push(route);
        }
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
        if (route.resource && route.action) {
            routes.push(route);
        }
        return this;
    }
}

export const routes: IRoute[] = [];

interface IConfigAuthorisationService {
    name: string;
    route: string;
}

export async function exportRoutes(config: IConfigAuthorisationService) {
    getLogger('router.manager').log('info', 'Exporting routes to the authorization server...');
    for (const route of routes) {
        try {
            await communicationHelper.post(
                config.name,
                config.route.replace('{resource}', route.resource),
                {},
                {
                    action: route.action,
                    routes: [{
                        method: route.method,
                        url: route.url
                    }]
                }
            );
        } catch (err) {
            // Silent error we do not stop the service
            if (err.statusCode >= 400) {
                getLogger('router.manager')
                    .log('warn', 'Can not add route ' + route.url +
                        ' on ' + route.method + ' to the authorization service.');
            }
        }
    }
}
