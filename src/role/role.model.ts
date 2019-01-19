import { Schema } from 'mongoose';
import * as mongoose from 'mongoose';


export const RoleSchema = new Schema({
    key: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    }
});

export const RoleModel = mongoose.model('Role', RoleSchema, 'roles');
