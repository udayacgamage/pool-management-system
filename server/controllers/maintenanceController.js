const Maintenance = require('../models/Maintenance');
const User = require('../models/User');
const PoolStatus = require('../models/PoolStatus');

// Create new maintenance report
exports.createMaintenance = async (req, res) => {
  try {
    const maintenance = new Maintenance({
      ...req.body,
      reportedBy: req.user._id
    });

    await maintenance.save();
    await maintenance.populate('reportedBy', 'name email role');

    res.status(201).json({
      success: true,
      data: maintenance
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all maintenance records (with filters)
exports.getAllMaintenance = async (req, res) => {
  try {
    const { status, type, priority, fromDate, toDate } = req.query;
    
    let query = {};
    
    if (status) query.status = status;
    if (type) query.type = type;
    if (priority) query.priority = priority;
    
    if (fromDate || toDate) {
      query.scheduledDate = {};
      if (fromDate) query.scheduledDate.$gte = new Date(fromDate);
      if (toDate) query.scheduledDate.$lte = new Date(toDate);
    }

    const maintenance = await Maintenance.find(query)
      .populate('reportedBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .populate('approvedBy', 'name email role')
      .sort({ scheduledDate: -1 });

    res.status(200).json({
      success: true,
      count: maintenance.length,
      data: maintenance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single maintenance record
exports.getMaintenance = async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id)
      .populate('reportedBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .populate('approvedBy', 'name email role');

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: maintenance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update maintenance record
exports.updateMaintenance = async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id);

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance record not found'
      });
    }

    // Only allow maintenance staff to update their own reports or admins
    if (req.user.role !== 'admin' && 
        req.user.role !== 'staff' && 
        maintenance.reportedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this maintenance record'
      });
    }

    const updatedMaintenance = await Maintenance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('reportedBy assignedTo approvedBy', 'name email role');

    res.status(200).json({
      success: true,
      data: updatedMaintenance
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Admin approve/reject maintenance
exports.approveMaintenance = async (req, res) => {
  try {
    const { status, adminNotes, poolStatus, estimatedReopenDate } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either approved or rejected'
      });
    }

    const maintenance = await Maintenance.findById(req.params.id);

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance record not found'
      });
    }

    maintenance.status = status;
    maintenance.adminNotes = adminNotes;
    maintenance.approvedBy = req.user._id;
    maintenance.approvalDate = new Date();
    
    if (poolStatus) {
      maintenance.poolStatus = poolStatus;
    }
    
    if (estimatedReopenDate) {
      maintenance.estimatedReopenDate = estimatedReopenDate;
    }

    await maintenance.save();
    await maintenance.populate('reportedBy assignedTo approvedBy', 'name email role');

    res.status(200).json({
      success: true,
      data: maintenance
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete maintenance record (admin only)
exports.deleteMaintenance = async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id);

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance record not found'
      });
    }

    await maintenance.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Maintenance record deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get current pool status
exports.getPoolStatus = async (req, res) => {
  try {
    const now = new Date();

    const manualOverride = await PoolStatus.findOne({
      manualOverride: true,
      $or: [
        { effectiveUntil: { $exists: false } },
        { effectiveUntil: null },
        { effectiveUntil: { $gt: now } }
      ]
    })
      .sort({ createdAt: -1 })
      .populate('updatedBy', 'name email role')
      .populate('maintenanceRef', 'title scheduledDate');

    // Find latest approved maintenance that affects pool status
    const latestMaintenance = await Maintenance.findOne({
      status: { $in: ['approved', 'in-progress', 'completed'] },
      scheduledDate: { $lte: now }
    })
    .sort({ scheduledDate: -1 })
    .populate('reportedBy approvedBy', 'name email role');

    // Check for any ongoing maintenance
    const ongoingMaintenance = await Maintenance.find({
      status: { $in: ['in-progress', 'pending'] },
      scheduledDate: { $lte: now },
      poolStatus: 'closed'
    }).sort({ scheduledDate: -1 });

    let poolStatus = ongoingMaintenance.length > 0 ? 'closed' : 'open';
    let overridePayload = null;

    if (manualOverride) {
      poolStatus = manualOverride.status;
      overridePayload = {
        status: manualOverride.status,
        message: manualOverride.message,
        effectiveUntil: manualOverride.effectiveUntil,
        updatedAt: manualOverride.updatedAt,
        updatedBy: manualOverride.updatedBy,
        maintenanceRef: manualOverride.maintenanceRef,
      };
    }

    res.status(200).json({
      success: true,
      data: {
        status: poolStatus,
        override: overridePayload,
        latestMaintenance,
        ongoingMaintenance
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Set pool status manually (admin)
exports.setPoolStatus = async (req, res) => {
  try {
    const { status, message, effectiveUntil, maintenanceRef } = req.body;
    const now = new Date();

    const trimmedMessage = typeof message === 'string' ? message.trim() : message;

    if (!['open', 'closed', 'restricted'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be open, closed, or restricted'
      });
    }

    // Setting status to "open" with no message/maintenanceRef is treated as clearing the override.
    const isClearOverride = status === 'open' && !trimmedMessage && !maintenanceRef && !effectiveUntil;

    if (isClearOverride) {
      await PoolStatus.updateMany(
        {
          manualOverride: true,
          $or: [
            { effectiveUntil: { $exists: false } },
            { effectiveUntil: null },
            { effectiveUntil: { $gt: now } }
          ]
        },
        { $set: { manualOverride: false, effectiveUntil: now } }
      );
    }

    const manualOverrideFlag = !(status === 'open' && !trimmedMessage && !maintenanceRef);

    const override = await PoolStatus.create({
      status,
      message: trimmedMessage || undefined,
      manualOverride: manualOverrideFlag,
      effectiveUntil: effectiveUntil ? new Date(effectiveUntil) : undefined,
      maintenanceRef: maintenanceRef || undefined,
      updatedBy: req.user._id
    });

    await override.populate('updatedBy', 'name email role');
    await override.populate('maintenanceRef', 'title scheduledDate');

    res.status(200).json({
      success: true,
      data: override
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get upcoming maintenance
exports.getUpcomingMaintenance = async (req, res) => {
  try {
    const upcoming = await Maintenance.find({
      scheduledDate: { $gte: new Date() },
      status: { $in: ['pending', 'approved'] }
    })
    .sort({ scheduledDate: 1 })
    .limit(10)
    .populate('reportedBy assignedTo', 'name email role');

    res.status(200).json({
      success: true,
      count: upcoming.length,
      data: upcoming
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get maintenance statistics
exports.getMaintenanceStats = async (req, res) => {
  try {
    const stats = await Maintenance.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalCost: { $sum: '$cost' }
        }
      }
    ]);

    const typeStats = await Maintenance.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    const overdueCount = await Maintenance.countDocuments({
      scheduledDate: { $lt: new Date() },
      status: { $in: ['pending', 'in-progress'] }
    });

    res.status(200).json({
      success: true,
      data: {
        byStatus: stats,
        byType: typeStats,
        overdue: overdueCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Add future maintenance suggestion
exports.addFutureMaintenance = async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id);

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance record not found'
      });
    }

    maintenance.futureMaintenance.push(req.body);
    await maintenance.save();

    res.status(200).json({
      success: true,
      data: maintenance
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
