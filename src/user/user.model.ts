import { Schema } from 'mongoose';
import * as mongoose from 'mongoose';
import { isEmail } from 'validator';
import ObjectId = mongoose.Schema.Types.ObjectId;


const userSchema = new Schema({
    _id: ObjectId,
    username: String,
    email: {
        type : String,
        validate: [isEmail, 'invalid email']
    },
    password: String,
    date: { type: Date, default: Date.now },
    enabled: {
        type: Boolean,
        default : true
    },
    roles: [ObjectId]
});

export const UserModel = mongoose.model('User', userSchema);
