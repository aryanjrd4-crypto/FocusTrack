import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  points: { type: Number, default: 0 },
  totalStudySeconds: { type: Number, default: 0 },
  totalEntertainmentSeconds: { type: Number, default: 0 },
  totalOtherSeconds: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastActiveDate: { type: String, default: '' },
  badges: { type: [String], default: [] },
  avatar: { type: String, default: '' },
  theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
  notifications: {
    email: { type: Boolean, default: true },
    weeklyReport: { type: Boolean, default: true },
    goalReminders: { type: Boolean, default: true }
  }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);