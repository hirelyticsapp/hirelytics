import type { Model } from 'mongoose';
import mongoose, { Schema } from 'mongoose';

export interface IUser extends Document {
  _doc: IUser;
  _id: string;
  name: string;
  role: 'user' | 'recruiter' | 'admin';
  email: string;
  emailVerified: boolean;
  image: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    role: { type: String, required: true, default: 'user' },
    email: { type: String, required: true },
    emailVerified: { type: Boolean, required: true },
    image: { type: String },
  },
  {
    timestamps: true,
    collection: 'user',
    // Transform output to replace MongoDB's _id with id and remove internal fields (_id, __v) for cleaner API responses
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
