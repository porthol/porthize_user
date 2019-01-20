import { Document } from 'mongoose';

export interface IExample extends Document {
    key: string;
    name: string;
}
