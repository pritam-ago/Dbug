import mongoose, { Schema } from 'mongoose';
import { IUser } from '../../types';

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  githubId: {
    type: String,
    required: true,
    unique: true,
    sparse: true,
  },
  githubUsername: {
    type: String,
    required: true,
    trim: true,
  },
  githubAccessToken: {
    type: String,
    select: false,
  },
  avatar: {
    type: String,
  },
  avatarUrl: {
    type: String,
  },
}, {
  timestamps: true,
});

userSchema.index({ githubUsername: 1 });
userSchema.index({ githubId: 1 });

userSchema.virtual('id').get(function(this: IUser) {
  return this._id.toHexString();
});

userSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret: Record<string, any>) {
    delete ret._id;
    delete ret.__v;
    delete ret.githubAccessToken;
    return ret;
  },
});

userSchema.methods.getPublicProfile = function(this: IUser): Partial<IUser> {
  return {
    id: this._id,
    name: this.name,
    githubUsername: this.githubUsername,
    avatar: this.avatar,
    avatarUrl: this.avatarUrl,
    createdAt: this.createdAt,
  };
};

userSchema.methods.hasGitHubAccess = function(this: IUser): boolean {
  return !!(this.githubId && this.githubAccessToken);
};

export const User = mongoose.model<IUser>('User', userSchema);
