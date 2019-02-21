import * as winston from 'winston';

const $loggerContainer = Symbol('loggerContainer');

export const defaultWinstonLoggerOptions: winston.LoggerOptions = {
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.splat(),
        winston.format.printf(meta => {
            if (meta.message !== '') {
                return `${meta.level}: ${meta.message}`;
            }
            if (meta.body && Object.keys(meta.body).length > 0) {
                return `${meta.level}: ${meta.statusCode} - ${meta.method} - ${
                    meta.url
                } - ${meta.responseTimeInMs}ms - ${JSON.stringify(meta.body)}`;
            }
            return `${meta.level}: ${meta.statusCode} - ${meta.method} - ${
                meta.url
            } - ${meta.responseTimeInMs}ms`;
        })
    ),
    transports: [
        new winston.transports.Console({
            handleExceptions: true
        })
    ],
    exitOnError: false
};

/**
 * Funtion used to get logger previously configured by its name
 *
 * @export
 * @param {string} name
 * @returns {winston.Logger}
 */
export function getLogger(name: string): winston.Logger {
    if (!this[$loggerContainer]) {
        configureLogger(name, defaultWinstonLoggerOptions);
    }
    return this[$loggerContainer].get(name);
}

/**
 * Function used to configure a logger
 *
 * @export
 * @param {string} name
 * @param {winston.LoggerOptions} loggerOptions
 */
export function configureLogger(
    name: string,
    loggerOptions: winston.LoggerOptions
): void {
    if (!this[$loggerContainer]) {
        this[$loggerContainer] = new winston.Container();
    }

    if (this[$loggerContainer].has(name) === false) {
        this[$loggerContainer].add(name, loggerOptions);
    }
}

/**
 * Function used to remove a logger previously configured by its name
 *
 * @export
 * @param {string} name
 */
export function removeLogger(name: string): void {
    if (!this[$loggerContainer]) {
        throw new Error('None logger configured');
    }

    if (this[$loggerContainer].has(name) === false) {
        throw new Error('No logger named ' + name);
    }

    this[$loggerContainer].close(name);
}
