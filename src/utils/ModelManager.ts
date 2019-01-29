import { Document, Model } from 'mongoose';
import { CustomError, CustomErrorCode } from './CustomError';

export class ModelManager{
  private modelByName : {[attr:string]: Model<any>};

  constructor(
  ) {
    this.modelByName = {};
  }


  registerModel <T extends Document> (model: Model<T>){
    this.modelByName[model.modelName] = model;
  }

  getModel (name: string) {
    const model = this.modelByName[name];
    if (!model) {
      throw new CustomError(CustomErrorCode.ERRNOTFOUND, 'Model not found');
    }
    return model;
  }
}

export const modelManager = new ModelManager();
