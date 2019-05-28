import { Schema } from 'mongoose';

export const ExampleSchema = new Schema({
    name: {
        type: String
    },
    createdDate: { type: Date, default: Date.now },
    enabled: {
        type: Boolean,
        default: true
    }
});
