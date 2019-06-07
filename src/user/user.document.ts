import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import ObjectId = mongoose.Types.ObjectId;

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    birthDate: Date;
    createdAt: Date;
    updatedAt: Date;
    enabled: boolean;
    emailing: boolean;
    loginEnabled: boolean;
    roles: ObjectId[];
    lastLogIn: Date;
}
