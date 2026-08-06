import mongoose from 'mongoose';

const paymentMethodSchema = new mongoose.Schema({
  key: { type: String, required: true, trim: true },
  label: { type: String, required: true, trim: true },
  accountName: { type: String, default: '' },
  mobileNumber: { type: String, default: '' },
  accountNumber: { type: String, default: '' },
  iban: { type: String, default: '' },
  qrCode: { type: String, default: '' },
  instructions: { type: String, default: '' },
  active: { type: Boolean, default: true }
}, { _id: false });

const paymentSettingSchema = new mongoose.Schema({
  name: { type: String, default: 'default', unique: true, index: true },
  paymentMethods: { type: [paymentMethodSchema], default: [] },
  maxFileSizeMB: { type: Number, default: 5 },
  allowedExtensions: { type: [String], default: ['jpg', 'jpeg', 'png', 'webp', 'pdf'] },
  enableNotifications: { type: Boolean, default: true },
  reminderSchedule: { type: [Number], default: [7, 3, 1, 0] },
  maxReminderCount: { type: Number, default: 3 },
  notificationRetentionDays: { type: Number, default: 90 },
  notificationTemplates: {
    type: Object,
    default: {
      paymentSubmitted: 'Your payment has been received and is awaiting manual verification.',
      paymentApproved: 'Your payment has been approved.',
      subscriptionActivated: 'Your subscription is now active.',
      screenAssigned: 'Your screen has been assigned successfully.',
      expiryReminder: 'Your subscription is expiring soon.',
      paymentRejected: 'Your payment has been rejected.',
      subscriptionExpired: 'Your subscription has expired. Please renew to continue access.'
    }
  }
}, { timestamps: true });

export default mongoose.model('PaymentSetting', paymentSettingSchema);
