import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';
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
