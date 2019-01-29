import * as mongoose from 'mongoose';
import { model, Schema } from 'mongoose';
import { isEmail } from 'validator';
import { IUser } from './user.document';
import * as UniqueValidator from 'mongoose-unique-validator';
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
    roles: [ObjectId]
});

UserSchema.plugin(UniqueValidator);

UserSchema.pre('save', next => {
    this.updatedAt = Date.now();

    next();
});

export const UserModel = model<IUser>('user', UserSchema, 'users');
