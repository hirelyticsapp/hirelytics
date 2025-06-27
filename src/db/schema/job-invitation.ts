import { UUID } from 'crypto';
import type { Document, Model } from 'mongoose';
import mongoose, { Schema, Types } from 'mongoose';

import { IUser } from './user';

export interface IJobInvitation extends Document {
  _doc: IJobInvitation;
  _id: Types.ObjectId; // MongoDB ObjectId
  uuid: UUID; // Unique identifier for the invitation
  jobId: Types.ObjectId; // Reference to the job
  candidateId?: Types.ObjectId | IUser; // Optional reference to the candidate's user ID if they are registered
  invitedBy: Types.ObjectId | IUser; // User ID of the person who sent the invitation
  status: 'pending' | 'accepted' | 'declined'; // Status of the invitation
  createdAt: Date; // Timestamp when the invitation was created
  updatedAt: Date; // Timestamp when the invitation was last updated
  toJSON(): IJobInvitation; // Method to convert the document to JSON
  toObject(): IJobInvitation; // Method to convert the document to an object
}

const JobInvitationSchema = new Schema<IJobInvitation>(
  {
    uuid: { type: String, required: true },
    jobId: { type: Schema.Types.ObjectId, required: true, ref: 'Job' }, // Reference to the job document
    candidateId: { type: Schema.Types.ObjectId, required: false, ref: 'User' }, // Optional reference to the candidate's user document
    invitedBy: { type: Schema.Types.ObjectId, required: true, ref: 'User' }, // Reference to the user who sent the invitation
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
