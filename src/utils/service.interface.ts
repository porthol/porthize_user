import { Model } from 'mongoose';

export interface IService {
    name(): string;

    model(): Model<any>;

    create(data: any): any;
}
