import { Model } from 'mongoose';

export interface Service {
    getName(): string;

    getModel(): Model<any>;

    create(data: any): any;
}
