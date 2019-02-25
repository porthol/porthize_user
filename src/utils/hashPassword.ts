import * as bcrypt from 'bcrypt';

/**
 * Function used to hash a password using bcrypt
 *
 * @export
 * @param {string} password
 * @param {number} [saltRounds=10]
 * @returns {Promise<string>} Password hashed
 */
export async function hashPassword(password: string, saltRounds: number = 10): Promise<string> {
    return bcrypt.hash(password, saltRounds);
}
