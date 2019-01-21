import * as mongoose from 'mongoose';
import ObjectId = mongoose.Types.ObjectId;
import { Document } from 'mongoose';

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    date: Date;
    enabled: boolean;
    roles: ObjectId[];
}
