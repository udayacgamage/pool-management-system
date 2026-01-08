const mongoose = require('mongoose');

const chemicalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  currentLevel: {
    type: Number,
    required: true
  },
  optimalRange: {
    min: Number,
    max: Number
  },
  unit: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['optimal', 'low', 'high', 'critical'],
    default: 'optimal'
  }
});

const waterTestSchema = new mongoose.Schema({
  parameter: {
    type: String,
    required: true
  },
  reading: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  idealRange: {
    min: Number,
    max: Number
  },
  status: {
    type: String,
    enum: ['pass', 'monitor', 'fail'],
    default: 'pass'
  },
  sampleTime: Date,
  notes: String
});

const equipmentInspectionSchema = new mongoose.Schema({
  equipmentName: {
    type: String,
    required: true
  },
  condition: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor', 'out-of-service'],
    default: 'good'
  },
  issuesFound: String,
  correctiveActions: String,
  lastServicedDate: Date,
  nextServiceDue: Date,
  inspector: String
});

const safetyCheckSchema = new mongoose.Schema({
  item: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['compliant', 'needs-attention', 'non-compliant'],
    default: 'compliant'
  },
  notes: String,
  verifiedBy: String
});

const supplySchema = new mongoose.Schema({
  item: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  supplier: String,
  cost: Number
});

const maintenanceTaskSchema = new mongoose.Schema({
  task: {
    type: String,
    required: true
  },
  description: String,
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: Date
});

const maintenanceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['routine', 'emergency', 'scheduled', 'inspection'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'approved', 'rejected'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  completedDate: Date,
  description: {
    type: String,
    required: true
  },
  
  // Chemical levels
  chemicals: [chemicalSchema],

  // Water quality test panel
  waterTests: [waterTestSchema],
  
  // Supplies/imports used
  supplies: [supplySchema],
  
  // Tasks performed
  tasks: [maintenanceTaskSchema],

  // Critical equipment inspections
  equipmentInspections: [equipmentInspectionSchema],

  // Safety compliance checklist
  safetyChecks: [safetyCheckSchema],

  // Operational readiness summary
  lifeguardCoverage: {
    type: String,
    enum: ['full', 'partial', 'none'],
    default: 'full'
  },
  crowdLevel: {
    type: String,
    enum: ['low', 'moderate', 'high'],
    default: 'low'
  },
  incidentsReported: {
    type: Number,
    default: 0
  },
  
  // Pool status impact
  poolStatus: {
    type: String,
    enum: ['open', 'closed', 'restricted'],
    required: true
  },
  poolClosureReason: String,
  estimatedReopenDate: Date,
  
  // Personnel
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Admin decision
  adminNotes: String,
  approvalDate: Date,
  
  // Future maintenance suggestions
  futureMaintenance: [{
    suggestedTask: String,
    suggestedDate: Date,
    reason: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high']
    }
  }],
  
  // Additional details
  cost: {
    type: Number,
    default: 0
  },
  photos: [String],
  notes: String,
  
}, {
  timestamps: true
});

// Index for efficient queries
maintenanceSchema.index({ scheduledDate: 1, status: 1 });
maintenanceSchema.index({ poolStatus: 1 });
maintenanceSchema.index({ type: 1, status: 1 });

// Virtual for checking if maintenance is overdue
maintenanceSchema.virtual('isOverdue').get(function() {
  return this.status !== 'completed' && 
         this.status !== 'approved' && 
         this.scheduledDate < new Date();
});

// Method to calculate total supply cost
maintenanceSchema.methods.calculateTotalCost = function() {
  const supplyCost = this.supplies.reduce((sum, supply) => sum + (supply.cost || 0), 0);
  return supplyCost + (this.cost || 0);
};

module.exports = mongoose.model('Maintenance', maintenanceSchema);
