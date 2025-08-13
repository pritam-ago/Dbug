import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  githubId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  githubUsername: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  avatarUrl: {
    type: String,
    required: true
  },
  provider: {
    type: String,
    default: 'github'
  },
  lastSignIn: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Ensure unique indexes
userSchema.index({ githubId: 1 }, { unique: true })
userSchema.index({ githubUsername: 1 }, { unique: true })
userSchema.index({ email: 1 }, { unique: true })

const User = mongoose.models.User || mongoose.model('User', userSchema)

export default User
