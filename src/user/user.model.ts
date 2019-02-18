import * as mongoose from 'mongoose';
import { model, Schema } from 'mongoose';
import { isEmail } from 'validator';
import { IUser } from './user.document';
import ObjectId = mongoose.Schema.Types.ObjectId;


export const UserSchema = new Schema({
    username: {
        type: String,
        unique: true
    },
    email: {
        type: String,
        validate: [isEmail, 'invalid email'],
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    enabled: {
        type: Boolean,
        default: true
    },
    emailing: {
        type: Boolean,
        default: true
    },
    loginEnabled: {
        type: Boolean,
        default: true
    },
    roles: [ObjectId],
    lastLogIn: {
        type: Date
    }
});

UserSchema.pre('save', function(next) {
    (this as IUser).updatedAt = new Date();

    next();
});

export const UserModel = model<IUser>('user', UserSchema, 'users');
