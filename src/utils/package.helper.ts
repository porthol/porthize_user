import { path } from 'app-root-path';
import { join } from 'path';


export function getPackageName(): string {
    try {
        const name = require(join(path, 'package.json')).name;

        return name;
    } catch (err) {
        throw new Error('Cannot read package name');
    }

    return null;
}
