/**
 * Check all account and disable unused bot account
 * @param roleBotKey
 * @param checkTime time in ms
 */
import { RoleService } from '../role/role.service';
import { UserService } from '../user/user.service';
import { configureLogger, defaultWinstonLoggerOptions, getLogger } from './logger';
import { getPackageName } from './package.helper';
import { getConfiguration } from './configuration.helper';
import ms = require('ms');

const appName = getPackageName();

const config: any = getConfiguration();

configureLogger('botCheck', defaultWinstonLoggerOptions);

export function botCheck(roleBotKey: string, checkTime: number) {
    const checker = async () => {
        getLogger('botCheck').log('info', 'Checking bot account');
        const role = await RoleService.get(config[appName].mainWorkspace).getOne({
            key: roleBotKey
        });
        if (!role) {
            getLogger('botCheck').log('error', 'Role bot key does not found');
        }

        const users = await UserService.get(config[appName].mainWorkspace).getAll({
            roles: { $in: role._id },
            enabled: true
        });
        for (const user of users) {
            if (user.lastLogIn) {
                user.lastLogIn = new Date(user.lastLogIn); // string to date
            }
            if (!user.lastLogIn || user.lastLogIn.getTime() < Date.now() - ms('24h')) {
                getLogger('botCheck').log(
                    'info',
                    'User %s has not been logged since %s',
                    user._id.toString(),
                    user.lastLogIn
                );
                user.enabled = false;
                await UserService.get(config[appName].mainWorkspace).update(user._id, user);
            }
        }
        setTimeout(checker, checkTime);
    };
    setTimeout(checker, checkTime);
}
