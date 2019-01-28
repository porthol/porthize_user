import { model, Schema } from 'mongoose';
import { IPrivilege } from './privilege.document';
import { modelManager } from '../utils/ModelManager';

export const PrivilegeSchema = new Schema({
    resource: {
        type: String,
        required: true
    },
    actions: {
        type: [String]
    }
});

export const PrivilegeModel = model<IPrivilege>('Privilege', PrivilegeSchema, 'privileges');

modelManager.registerModel(PrivilegeModel);
