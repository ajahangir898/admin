import mongoose, { Schema, Document } from 'mongoose';

export type AnnouncementType = 'maintenance' | 'feature' | 'update' | 'alert' | 'general';
export type AnnouncementPriority = 'low' | 'medium' | 'high' | 'urgent';
export type AnnouncementStatus = 'draft' | 'scheduled' | 'sent';

export interface IAnnouncement extends Document {
  title: string;
  message: string;
  type: AnnouncementType;
  priority: AnnouncementPriority;
  status: AnnouncementStatus;
  targetTenants: string[] | 'all';
  createdBy: {
    userId: string;
    name: string;
    email: string;
  };
  scheduledFor?: Date;
  sentAt?: Date;
  readBy: string[]; // Array of tenant IDs that have read the announcement
  createdAt: Date;
  updatedAt: Date;
}

const announcementSchema = new Schema<IAnnouncement>(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['maintenance', 'feature', 'update', 'alert', 'general'],
      default: 'general',
      index: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'sent'],
      default: 'draft',
      index: true
    },
    targetTenants: {
      type: Schema.Types.Mixed, // Can be array of strings or 'all'
      required: true,
      default: 'all'
    },
    createdBy: {
      userId: { type: String, required: true },
      name: { type: String, required: true },
      email: { type: String, required: true }
    },
    scheduledFor: {
      type: Date
    },
    sentAt: {
      type: Date
    },
    readBy: [{
      type: String
    }]
  },
  {
    timestamps: true,
    collection: 'announcements'
  }
);

// Indexes for efficient querying
announcementSchema.index({ status: 1, createdAt: -1 });
announcementSchema.index({ type: 1, status: 1 });
announcementSchema.index({ createdAt: -1 });

export const Announcement = mongoose.model<IAnnouncement>('Announcement', announcementSchema);
