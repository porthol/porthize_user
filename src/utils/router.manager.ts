import { RequestHandler, Router } from 'express-serve-static-core';
import { app, communicationHelper } from '../server';
import { configureLogger, defaultWinstonLoggerOptions, getLogger } from './logger';
import * as pathToRegexp from 'path-to-regexp';
import { PrivilegeService } from '../privilege/privilege.service';

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

    constructor(private _router: Router) {
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
        this._router.get(route.url, route.handlers);
        this.postRoute(route);
        return this;
    }

    post(route: IRoute): RouterManager {
        if (!route.url) {
            route.url = this._tmpUrl;
        }
        route.method = 'POST';
        this._router.post(route.url, route.handlers);
        this.postRoute(route);
        return this;
    }

    put(route: IRoute): RouterManager {
        if (!route.url) {
            route.url = this._tmpUrl;
        }
        route.method = 'PUT';
        this._router.put(route.url, route.handlers);
        this.postRoute(route);
        return this;
    }

    delete(route: IRoute): RouterManager {
        if (!route.url) {
            route.url = this._tmpUrl;
        }
        route.method = 'DELETE';
        this._router.delete(route.url, route.handlers);
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

export async function exportRoutes(ws: string, config: any) {
    getLogger('routerManager').log('info', 'Exporting routes to the authorization server...');
    for (const route of routes) {
        try {
            await communicationHelper.post(
                config.authorizationService.addRoute.replace('{resource}', route.resource),
                {
                    'internal-request': app.uuid,
                    workspace: ws
                },
                {
                    action: route.action,
                    routes: [
                        {
                            method: route.method,
                            url: route.url,
                            regexp: route.regexp.source
                        }
                    ]
                },
                null,
                true
            );
        } catch (err) {
            // Silent error we do not stop the service
            if (err.statusCode >= 400) {
                getLogger('routerManager').log(
                    'warn',
                    'Can not add route ' + route.url + ' on ' + route.method + ' to the authorization service.'
                );
                getLogger('routerManager').log('error', JSON.stringify(err.error, null, ' '));
            }
        }
    }
}

export async function internalExportRoutes(ws: string) {
    getLogger('routerManager').log('info', 'Internal exporting routes to the authorization server...');
    for (const route of routes) {
        try {
            await PrivilegeService.get(ws).addRoutes(route.resource, route.action, [
                {
                    method: route.method,
                    url: route.url,
                    regexp: new RegExp(route.regexp.source)
                }
            ]);
        } catch (err) {
            getLogger('routerManager').log('error', JSON.stringify(err.error, null, ' '));
        }
    }
}
