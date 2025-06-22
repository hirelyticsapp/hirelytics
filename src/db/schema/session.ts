import { Model, model, models, ObjectId, Schema } from 'mongoose';

export interface ISession {
  _id?: string;
  userId: ObjectId;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  userAgent?: string;
  ipAddress?: string;
  isActive: boolean;
}

export interface SessionDocument extends ISession, Document {}

interface SessionModel extends Model<SessionDocument> {
  findValidSession(token: string): Promise<SessionDocument | null>;
  cleanupExpiredSessions(): Promise<{ deletedCount: number }>;
  deleteUserSessions(userId: string): Promise<{ deletedCount: number }>;
}

const sessionSchema = new Schema<SessionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    token: {
      type: Schema.Types.String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // MongoDB TTL index
    },
    userAgent: {
      type: String,
      default: null,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Static method to find valid session
sessionSchema.statics.findValidSession = function (token: string) {
  return this.findOne({
    token,
    expiresAt: { $gt: new Date() },
    isActive: true,
  }).populate('userId');
};

// Static method to cleanup expired sessions
sessionSchema.statics.cleanupExpiredSessions = function () {
  return this.deleteMany({
    $or: [{ expiresAt: { $lt: new Date() } }, { isActive: false }],
  });
};

// Static method to delete all user sessions
sessionSchema.statics.deleteUserSessions = function (userId: string) {
  return this.deleteMany({ userId });
};

const Session =
  (models.Session as unknown as SessionModel) ||
  model<SessionDocument, SessionModel>('Session', sessionSchema);

export default Session;
