import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const PhotoSchema = new mongoose.Schema({
  id: String,
  url: String,
  width: Number,
  height: Number,
  aspectRatio: Number,
});

const EventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  occasion: { type: String, required: true },
  recipientName: { type: String, required: true },
  message: { type: String },
  photos: [PhotoSchema],
  theme: { type: String, default: 'modern' },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  shareCode: { type: String, unique: true },
  isPublic: { type: Boolean, default: true },
  createdAt: { type: Number, default: Date.now },
});

// Index for search optimization
EventSchema.index({ title: 'text', recipientName: 'text', occasion: 'text' });

const User = mongoose.model('User', UserSchema);
const MemoryEvent = mongoose.model('MemoryEvent', EventSchema);

export { User, MemoryEvent };