import { model, Schema } from 'mongoose';
import * as mongoose from 'mongoose';
import { isEmail } from 'validator';
import ObjectId = mongoose.Schema.Types.ObjectId;
import { IUser } from './user.document';


export const UserSchema = new Schema({
    username: {
        type: String
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
    roles: [ObjectId]
});

export const UserModel = model<IUser>('user', UserSchema, 'users');
