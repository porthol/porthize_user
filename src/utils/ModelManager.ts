import { Model, Document } from 'mongoose';

export class ModelManager{
  private modelByName : {[attr:string]: Model<any>};

  constructor(
  ) {
    this.modelByName = {};
  }


  registerModel <T extends Document> (model: Model<T>){
    this.modelByName[model.name] = model;
  }

  getModel (name: string) {
    return this.modelByName[name];
  }
}

export const modelManager = new ModelManager();
