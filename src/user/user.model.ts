import { Schema } from 'mongoose';
import * as mongoose from 'mongoose';
import { isEmail } from 'validator';
import ObjectId = mongoose.Schema.Types.ObjectId;


export const UserSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type : String,
        validate: [isEmail, 'invalid email'],
        required: true
    },
    password: {
        type: String,
        required: true
    },
    date: { type: Date, default: Date.now },
    enabled: {
        type: Boolean,
        default : true
    },
    roles: [ObjectId],
    workspace: {
        type: String,
        required: true
    }
});

export const UserModel = mongoose.model('User', UserSchema, 'users');
