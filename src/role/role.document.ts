import { Document } from 'mongoose';

export interface IRole extends Document {
    key: string;
    name: string;
}
