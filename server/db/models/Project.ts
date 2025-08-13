import mongoose, { Schema } from 'mongoose';
import { IProject } from '../../types';

const projectSchema = new Schema<IProject>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  joinCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 32,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  collaborators: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  githubRepo: {
    owner: {
      type: String,
      required: false,
    },
    name: {
      type: String,
      required: false,
    },
    branch: {
      type: String,
      default: 'main',
    },
    fullName: {
      type: String,
      required: false,
    },
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  settings: {
    allowCollaboration: {
      type: Boolean,
      default: true,
    },
    requireApproval: {
      type: Boolean,
      default: false,
    },
    maxCollaborators: {
      type: Number,
      default: 10,
      min: 1,
      max: 50,
    },
  },
}, {
  timestamps: true,
});

projectSchema.index({ owner: 1 });
projectSchema.index({ collaborators: 1 });
projectSchema.index({ isPublic: 1 });
projectSchema.index({ 'githubRepo.fullName': 1 });
projectSchema.index({ createdAt: -1 });


projectSchema.virtual('id').get(function(this: IProject) {
  return this._id.toHexString();
});

projectSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret: Record<string, any>) {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

projectSchema.methods.isOwner = function(this: IProject, userId: string): boolean {
  return this.owner.toString() === userId;
};

projectSchema.methods.isCollaborator = function(this: IProject, userId: string): boolean {
  return this.collaborators.some((id: any) => id.toString() === userId);
};

projectSchema.methods.canAccess = function(this: IProject, userId: string): boolean {
  return this.isPublic || this.isOwner(userId) || this.isCollaborator(userId);
};

projectSchema.methods.addCollaborator = function(this: IProject, userId: string): boolean {
  if (this.collaborators.length >= this.settings.maxCollaborators) {
    return false;
  }
  
  if (!this.isCollaborator(userId)) {
    this.collaborators.push(new mongoose.Types.ObjectId(userId));
    return true;
  }
  
  return false;
};

projectSchema.methods.removeCollaborator = function(this: IProject, userId: string): boolean {
  const index = this.collaborators.findIndex((id: any) => id.toString() === userId);
  if (index !== -1) {
    this.collaborators.splice(index, 1);
    return true;
  }
  return false;
};

export const Project = mongoose.model<IProject>('Project', projectSchema);
