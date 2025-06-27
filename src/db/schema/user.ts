import type { Model } from 'mongoose';
import mongoose, { Schema } from 'mongoose';

export interface IUser extends Document {
  _doc: IUser;
  _id: string;
  id: string; // Virtual field for cleaner API responses
  name?: string;
  role: 'user' | 'recruiter' | 'admin';
  email: string;
  emailVerified: boolean;
  image: string;
  lastLoginAt?: Date | null;
  deletedAt?: Date | null;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema<IUser>(
  {
    name: { type: String, required: false },
    role: { type: String, required: true, default: 'user' },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    emailVerified: { type: Boolean, required: true, default: false },
    image: { type: String },
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
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

UserSchema.pre('save', function (next) {
  if (this.deletedAt === undefined) {
    this.deletedAt = null;
  }
  next();
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
