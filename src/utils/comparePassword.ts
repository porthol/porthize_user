import * as bcrypt from 'bcrypt';

/**
 * Function used to compare a plain text password with a hashed password.
 *
 * @export
 * @param {string} password
 * @param {string} hash
 * @returns {Promise<boolean>} Boolean that indicates if match or not
 */
export function comparePassword(
    password: string,
    hash: string
): Promise<boolean> {
    return bcrypt.compare(password, hash);
}
