import type { Document, Model } from 'mongoose';
import mongoose, { Schema } from 'mongoose';

import { IOrganization } from './organization';
import { IUser } from './user';

export interface IMember extends Document {
  _doc: IMember;
  _id: string;
  userId: string | IUser;
  organizationId: string | IOrganization;
  role: string[];
  createdAt: Date;
  updatedAt: Date;
}

const MemberSchema = new Schema<IMember>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    role: [{ type: String, enum: ['owner', 'member'], required: true }],
  },
  {
    timestamps: true,
    collection: 'member',
    toJSON: {
      transform: function (_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: function (_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Create compound index to ensure a user can only be a member of an organization once
MemberSchema.index({ userId: 1, organizationId: 1 }, { unique: true });

const Member: Model<IMember> =
  mongoose.models.Member || mongoose.model<IMember>('Member', MemberSchema);

export default Member;
