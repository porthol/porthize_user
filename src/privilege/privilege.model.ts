import * as mongoose from 'mongoose';
import { model, Schema } from 'mongoose';
import { IPrivilege } from './privilege.document';
import Mixed = mongoose.Schema.Types.Mixed;

export const PrivilegeSchema = new Schema({
    resource: {
        type: String,
        required: true,
        unique: true
    },
    actionsAvailable: {
        type: Mixed
    }
});

export const PrivilegeModel = model<IPrivilege>(
    'privilege',
    PrivilegeSchema,
    'privileges'
);
