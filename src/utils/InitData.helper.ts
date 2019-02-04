import { join } from 'path';
import { path } from 'app-root-path';
import * as fs from 'fs';
import { getLogger } from './logger';
import * as Ajv from 'ajv';
import { modelManager } from './ModelManager';

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
    const folderPath = join(path, 'src/utils/data/');
    if (fs.existsSync(folderPath)) {
      fs.readdir(folderPath, (err, files) => {
        files.map(async file => {
          const importFile = require(folderPath + file);
          const valid = ajv.validate(IDataToImport, importFile);
          if (!valid) {
            getLogger('default').log('warn', 'The imports file ' + file + ' is not correctly formatted');
            getLogger('default').log('warn', 'The file will not me imported');
            getLogger('default').log('warn', ajv.errorsText());
            return;
          }
          const model = modelManager.getModel(importFile.model);
          model.countDocuments({})
            .then(count => {
              if (!count || count <= 0) {
                model.insertMany(importFile.data);
              }
              getLogger('default').log('info', 'Data already here for ' + file);
            });
        });
      });
    }
  } catch (err) {
    getLogger('default').error(err);
  }
}
