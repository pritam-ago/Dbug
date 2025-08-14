import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  githubId: {
    type: String,
    required: false,
    unique: true,
    sparse: true
  },
  githubUsername: {
    type: String,
    required: false,
    unique: true,
    sparse: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  avatarUrl: {
    type: String,
    required: false
  },
  provider: {
    type: String,
    default: 'nextauth'
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

// Ensure unique indexes with sparse option for optional fields
userSchema.index({ githubId: 1 }, { unique: true, sparse: true })
userSchema.index({ githubUsername: 1 }, { unique: true, sparse: true })
userSchema.index({ email: 1 }, { unique: true })

const User = mongoose.models.User || mongoose.model('User', userSchema)

export default User
