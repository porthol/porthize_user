import { join } from 'path';
import { path } from 'app-root-path';
import * as fs from 'fs';
import { configureLogger, defaultWinstonLoggerOptions, getLogger } from './logger';
import * as Ajv from 'ajv';
import { serviceManager } from './service.manager';
import { app, communicationHelper } from '../server';
import { RoleService } from '../role/role.service';

configureLogger('initData', defaultWinstonLoggerOptions);

const ajv = new Ajv();

const IDataToImport = {
    type: 'object',
    required: ['model', 'data'],
    properties: {
        model: {
            type: 'string'
        },
        data: {
            type: 'array',
            items: {
                type: 'object'
            }
        }
    }
};

export async function initData() {
    try {
        const folderPath = join(path, 'config/data/');
        if (fs.existsSync(folderPath)) {
            getLogger('initData').log('info', 'Initialise default data');
            const files = fs.readdirSync(folderPath);
            for (const file of files) {
                const importFile = require(folderPath + file);
                const valid = ajv.validate(IDataToImport, importFile);
                if (!valid) {
                    getLogger('initData').log('warn', 'The imports file ' + file + ' is not correctly formatted');
                    getLogger('initData').log('warn', 'The file will not me imported');
                    getLogger('initData').log('warn', ajv.errorsText());
                    return;
                }
                const service = serviceManager.getService(importFile.model);

                const count = await service.getModel().countDocuments({});
                if (!count || count <= 0) {
                    for (const data of importFile.data) {
                        await service.create(data);
                    }
                    getLogger('initData').log('info', 'Data initialised : ' + file);
                } else {
                    getLogger('initData').log('info', 'Data already here for ' + file);
                }
            }

        } else {
            getLogger('initData').log('info', 'No data to initialise');
        }
    } catch (err) {
        getLogger('initData').log('error', err);
    }
}


export async function initPrivileges(config: any) {
    try {
        const filePath = join(path, 'config/privileges-roles.json');
        const privilegesRolesData = require(filePath);

        await communicationHelper.post(
            config.name,
            config.rolePrivilegeRoute,
            {
                'internal-request': app.uuid
            },
            privilegesRolesData,
            null,
            true
        );

        getLogger('initData').log('info', 'Privileges exported');
    } catch (err) {
        getLogger('initData').log('error', err);
    }

}

export async function internalInitPrivileges() {
    getLogger('initData').log('info', 'Importing privileges from internal');
    try {
        const filePath = join(path, 'config/privileges-roles.json');
        const privilegesRolesData = require(filePath);

        await RoleService.get().importPrivilege(privilegesRolesData);

        getLogger('initData').log('info', 'Privileges imported');
    } catch (err) {
        getLogger('initData').log('error', err);
    }
}
