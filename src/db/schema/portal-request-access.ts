import type { Model } from 'mongoose';
import mongoose, { Schema } from 'mongoose';

export interface IPortalRequestAccess extends Document {
  _doc: IPortalRequestAccess;
  id: string;
  full_name: string;
  work_email: string;
  job_title: string;
  phone_number: string;
  company_name: string;
  company_size: string;
  industry: string;
  monthly_hires: string;
  hiring_challenge: string;
  referral_source?: string;
  status?: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const PortalRequestAccessSchema = new Schema<IPortalRequestAccess>(
  {
    full_name: { type: String, required: true },
    work_email: { type: String, required: true },
    job_title: { type: String, required: true },
    phone_number: { type: String, required: true },
    company_name: { type: String, required: true },
    company_size: { type: String, required: true },
    industry: { type: String, required: true },
    monthly_hires: { type: String, required: true },
    hiring_challenge: { type: String, required: true },
    referral_source: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  },
  {
    timestamps: true,
    collection: 'portal_access_requests',
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

export const PortalAccessRequest: Model<IPortalRequestAccess> =
  mongoose.models.PortalAccessRequest ||
  (typeof window === 'undefined' && typeof global !== 'undefined' && !('EdgeRuntime' in global)
    ? mongoose.model<IPortalRequestAccess>('PortalAccessRequest', PortalRequestAccessSchema)
    : (null as unknown as Model<IPortalRequestAccess>));
