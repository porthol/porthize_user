import * as crypto from 'crypto';

/**
 * Function used to create hash from data using specific algorithm
 *
 * @export
 * @param {string} data
 * @param {string} [algorithm='sha256']
 * @returns {string}
 */
export function createHash(data: string, algorithm: string = 'sha256'): string {
    return crypto
        .createHash(algorithm)
        .update(data)
        .digest('base64')
        .toString();
}
