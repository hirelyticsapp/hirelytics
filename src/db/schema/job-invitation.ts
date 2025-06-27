import { UUID } from 'crypto';
import type { Document, Model } from 'mongoose';
import mongoose, { Schema } from 'mongoose';

import { IUser } from './user';

export interface IJobInvitation extends Document {
  _doc: IJobInvitation;
  _id: string;
  uuid: UUID; // Unique identifier for the invitation
  jobId: string; // Reference to the job
  candidateEmail: string; // Email of the candidate being invited
  candidateId?: string | IUser; // Optional reference to the candidate's user ID if they are registered
  invitedBy: string | IUser; // User ID of the person who sent the invitation
  status: 'pending' | 'accepted' | 'declined'; // Status of the invitation
  createdAt: Date; // Timestamp when the invitation was created
  updatedAt: Date; // Timestamp when the invitation was last updated
}

const JobInvitationSchema = new Schema<IJobInvitation>(
  {
    uuid: { type: String, required: true },
    jobId: { type: String, required: true },
    candidateEmail: { type: String, required: true },
    candidateId: { type: String, required: false },
    invitedBy: { type: String, required: true },
    status: { type: String, enum: ['pending', 'accepted', 'declined'], required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: 'jobInvitation',
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

JobInvitationSchema.index({ jobId: 1, candidateEmail: 1 }, { unique: true });
JobInvitationSchema.index({ uuid: 1 }, { unique: true });

const JobInvitation: Model<IJobInvitation> =
  mongoose.models.JobInvitation ||
  mongoose.model<IJobInvitation>('JobInvitation', JobInvitationSchema);

export default JobInvitation;
