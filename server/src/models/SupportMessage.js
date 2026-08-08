import mongoose from 'mongoose';

const supportMessageSchema = new mongoose.Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'SupportConversation', required: true, index: true },
  sender:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderRole:   { type: String, enum: ['user', 'admin'], required: true },
  body:         { type: String, required: true, trim: true },
  readByAdmin:    { type: Boolean, default: false },
  readByCustomer: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('SupportMessage', supportMessageSchema);
