import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import ObjectId = mongoose.Types.ObjectId;

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    date: Date;
    enabled: boolean;
    emailing: boolean;
    roles: ObjectId[];
}
