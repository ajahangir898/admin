import mongoose, { Schema, Document } from 'mongoose';

export interface IMerchantActivity extends Document {
  tenantId: string;
  lastLoginAt?: Date;
  lastOrderAt?: Date;
  totalOrders: number;
  totalRevenue: number;
  previousRevenue: number; // Revenue from previous period for comparison
  revenueDropPercentage: number; // Calculated drop percentage
  isAtRisk: boolean;
  riskReasons: string[]; // Reasons why merchant is at risk
  lastCheckedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const merchantActivitySchema = new Schema<IMerchantActivity>(
  {
    tenantId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    lastLoginAt: {
      type: Date
    },
    lastOrderAt: {
      type: Date
    },
    totalOrders: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    previousRevenue: {
      type: Number,
      default: 0
    },
    revenueDropPercentage: {
      type: Number,
      default: 0
    },
    isAtRisk: {
      type: Boolean,
      default: false,
      index: true
    },
    riskReasons: [{
      type: String
    }],
    lastCheckedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    collection: 'merchant_activities'
  }
);

// Indexes for efficient querying
merchantActivitySchema.index({ isAtRisk: 1, lastCheckedAt: -1 });
merchantActivitySchema.index({ lastLoginAt: 1 });
merchantActivitySchema.index({ revenueDropPercentage: -1 });

export const MerchantActivity = mongoose.model<IMerchantActivity>('MerchantActivity', merchantActivitySchema);
