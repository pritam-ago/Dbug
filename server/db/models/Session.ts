import mongoose, { Schema } from 'mongoose';
import { ISession } from '../../types';

const activeUserSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  username: {
    type: String,
    required: true,
    trim: true,
  },
  cursor: {
    line: {
      type: Number,
      default: 0,
    },
    ch: {
      type: Number,
      default: 0,
    },
  },
  lastSeen: {
    type: Date,
    default: Date.now,
  },
});

const sessionSchema = new Schema<ISession>({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  activeUsers: [activeUserSchema],
  lastActivity: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

sessionSchema.index({ projectId: 1 });
sessionSchema.index({ participants: 1 });
sessionSchema.index({ lastActivity: -1 });
sessionSchema.index({ createdAt: -1 });

sessionSchema.virtual('id').get(function(this: ISession) {
  return this._id.toHexString();
});

sessionSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret: Record<string, any>) {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

sessionSchema.methods.addParticipant = function(this: ISession, userId: string, username: string): boolean {
  if (this.participants.some((id: any) => id.toString() === userId)) {
    return false;
  }
  
  this.participants.push(new mongoose.Types.ObjectId(userId));
  this.activeUsers.push({
    userId: new mongoose.Types.ObjectId(userId),
    username,
    cursor: { line: 0, ch: 0 },
    lastSeen: new Date(),
  });
  
  this.lastActivity = new Date();
  return true;
};

sessionSchema.methods.removeParticipant = function(this: ISession, userId: string): boolean {
  const participantIndex = this.participants.findIndex((id: any) => id.toString() === userId);
  const activeUserIndex = this.activeUsers.findIndex((user: any) => user.userId.toString() === userId);
  
  if (participantIndex !== -1) {
    this.participants.splice(participantIndex, 1);
  }
  
  if (activeUserIndex !== -1) {
    this.activeUsers.splice(activeUserIndex, 1);
  }
  
  this.lastActivity = new Date();
  return participantIndex !== -1 || activeUserIndex !== -1;
};

sessionSchema.methods.updateUserCursor = function(this: ISession, userId: string, line: number, ch: number): boolean {
  const activeUser = this.activeUsers.find((user: any) => user.userId.toString() === userId);
  if (activeUser) {
    activeUser.cursor = { line, ch };
    activeUser.lastSeen = new Date();
    this.lastActivity = new Date();
    return true;
  }
  return false;
};

sessionSchema.methods.recordEdit = function(this: ISession, userId: string): void {
  const activeUser = this.activeUsers.find((user: any) => user.userId.toString() === userId);
  if (activeUser) {
    activeUser.lastSeen = new Date();
  }
  this.lastActivity = new Date();
};

export const Session = mongoose.model<ISession>('Session', sessionSchema);
