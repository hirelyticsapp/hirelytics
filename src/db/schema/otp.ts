import mongoose, { Document, Model, Schema } from 'mongoose';
export interface IOtp extends Document {
  _doc: IOtp;
  _id: string;
  email: string;
  otp: string;
  expiresAt?: Date; // Optional field to store expiration time of the OTP
  createdAt: Date;
  updatedAt: Date;
}

const OtpSchema: Schema = new Schema<IOtp>(
  {
    email: { type: String, required: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true, default: () => new Date(Date.now() + 10 * 60 * 1000) }, // Default to 10 minutes from now
  },
  {
    timestamps: true,
    collection: 'otp',
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

const Otp: Model<IOtp> = mongoose.models.Otp || mongoose.model<IOtp>('Otp', OtpSchema);
export default Otp;
