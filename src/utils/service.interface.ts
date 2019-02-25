import { Model } from 'mongoose';

export interface IService {
    workspace(): string;

    name(): string;

    model(): Model<any>;

    create(data: any): any;
}
