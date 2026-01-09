const mongoose = require('mongoose');

const poolStatusSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['open', 'closed', 'restricted'],
      default: 'open',
      required: true,
    },
    message: {
      type: String,
      trim: true,
    },
    manualOverride: {
      type: Boolean,
      default: true,
    },
    effectiveUntil: {
      type: Date,
    },
    maintenanceRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Maintenance',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

poolStatusSchema.index({ createdAt: -1 });

module.exports = mongoose.model('PoolStatus', poolStatusSchema);
