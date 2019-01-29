import { model, Schema } from 'mongoose';
import { IExample } from './example.document';
import { modelManager } from '../utils/ModelManager';

const PositionSchema = new Schema({
  latitude: {
    type: String,
    required: true
  },
  longitude: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

export const ExampleSchema = new Schema({
  name: {
    type: String
  },
  createdDate: { type: Date, default: Date.now },
  enabled: {
    type: Boolean,
    default: true
  },
  positions: [PositionSchema]
  // potentially need a listener to refer on listener service which receive data from sigfox
});

export const ExampleModel = model<IExample>('example', ExampleSchema, 'examples');
