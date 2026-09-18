import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  domain: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['study', 'entertainment', 'work', 'social', 'other'], 
    required: true 
  },
  seconds: { type: Number, required: true },
  date: { type: String, required: true },
  title: { type: String, default: '' }
}, { timestamps: true });

activitySchema.index({ userId: 1, date: 1 });

export default mongoose.model('Activity', activitySchema);