# Pool Maintenance Management System

## Overview
A comprehensive maintenance management system for the USJ Pool that allows maintenance employees to report maintenance activities, track chemical levels, supplies used, and enables admins to approve maintenance reports and control pool access status.

## Features

### For Maintenance Staff
- **Create Maintenance Reports** with:
  - Type: Routine, Emergency, Scheduled, Inspection
  - Priority levels: Low, Medium, High, Critical
  - Chemical level tracking with status indicators
  - Supplies and materials used
  - Tasks performed checklist
  - Pool status impact (Open/Closed/Restricted)
  - Cost tracking
  - Photo uploads
  
- **View All Maintenance Records**
- **Track Status** of maintenance reports (Pending, In-Progress, Completed, Approved, Rejected)

### For Administrators
- **Review and Approve/Reject** maintenance reports
- **Control Pool Status** based on maintenance needs
- **Add Future Maintenance Suggestions** with:
  - Suggested tasks
  - Recommended dates
  - Priority levels
  - Reasoning
- **View Statistics**:
  - Maintenance by status
  - Maintenance by type
  - Overdue maintenance count
  - Cost analysis
- **Delete Records** when necessary

### For Public/Students
- **Real-time Pool Status** displayed on landing page
- View ongoing maintenance with estimated reopening dates
- See maintenance history

## User Roles

### Maintenance Staff (`role: 'maintenance'`)
- Can create and update maintenance reports
- Can add chemical levels, supplies, and tasks
- Cannot approve their own reports
- Access to maintenance dashboard at `/maintenance`

### Admin (`role: 'admin'`)
- Full access to all maintenance records
- Can approve/reject maintenance reports
- Can change pool status (open/closed/restricted)
- Can add future maintenance suggestions
- Can delete maintenance records
- Access to admin maintenance dashboard at `/admin/maintenance`

### Regular Staff (`role: 'staff'`)
- Can also create maintenance reports
- Useful for on-duty staff reporting issues

## Setup Instructions

### 1. Backend Setup

The maintenance system is already integrated into the backend. Make sure your server is running:

```bash
cd server
npm install
npm run dev
```

### 2. Create Maintenance User

Run this script to create a maintenance staff account:

```bash
cd server
node create_maintenance.js
```

**Login Credentials:**
- Email: `maintenance@sjp.ac.lk`
- Password: `maintenance123`

### 3. Frontend Setup

The maintenance components are already integrated. Make sure your client is running:

```bash
cd client
npm install
npm run dev
```

## API Endpoints

### Public
- `GET /api/maintenance/pool-status` - Get current pool status and ongoing maintenance

### Protected (Authentication Required)
- `GET /api/maintenance` - Get all maintenance records (with filters)
- `GET /api/maintenance/:id` - Get single maintenance record
- `GET /api/maintenance/upcoming` - Get upcoming maintenance
- `POST /api/maintenance` - Create new maintenance report (staff/admin only)
- `PUT /api/maintenance/:id` - Update maintenance record (staff/admin only)
- `POST /api/maintenance/:id/future-maintenance` - Add future maintenance suggestion (staff/admin only)

### Admin Only
- `PUT /api/maintenance/:id/approve` - Approve or reject maintenance
- `DELETE /api/maintenance/:id` - Delete maintenance record
- `GET /api/maintenance/stats` - Get maintenance statistics

## Usage Guide

### Creating a Maintenance Report

1. Login as maintenance staff
2. Navigate to Maintenance Dashboard (`/maintenance`)
3. Click "New Maintenance Report"
4. Fill in the form:
   - **Basic Info**: Title, type, priority, scheduled date
   - **Chemical Levels**: Add water chemistry readings
     - Name (e.g., "Chlorine", "pH")
     - Current level with unit
     - Status (optimal/low/high/critical)
   - **Supplies Used**: Track materials consumed
     - Item name, quantity, unit, cost
   - **Tasks**: List work performed
   - **Pool Status**: Decide if pool needs to close
   - **Notes**: Additional information
5. Submit the report

### Admin Approval Process

1. Login as admin
2. Navigate to Admin Dashboard → Maintenance tab
3. Click "Go to Maintenance Dashboard"
4. Review pending maintenance reports
5. Click "Review / Approve" on a report
6. In the modal:
   - Choose Approve or Reject
   - Set pool status (Open/Closed/Restricted)
   - Add admin notes
   - Optionally add future maintenance suggestions
7. Submit decision

### Pool Status on Landing Page

The landing page automatically displays:
- Current pool status (Open/Closed)
- Ongoing maintenance details
- Estimated reopening time
- Last maintenance performed

## Data Model

### Maintenance Schema

```javascript
{
  title: String,
  type: 'routine' | 'emergency' | 'scheduled' | 'inspection',
  status: 'pending' | 'in-progress' | 'completed' | 'approved' | 'rejected',
  priority: 'low' | 'medium' | 'high' | 'critical',
  scheduledDate: Date,
  completedDate: Date,
  description: String,
  
  chemicals: [{
    name: String,
    currentLevel: Number,
    optimalRange: { min: Number, max: Number },
    unit: String,
    status: 'optimal' | 'low' | 'high' | 'critical'
  }],
  
  supplies: [{
    item: String,
    quantity: Number,
    unit: String,
    supplier: String,
    cost: Number
  }],
  
  tasks: [{
    task: String,
    description: String,
    completed: Boolean
  }],
  
  poolStatus: 'open' | 'closed' | 'restricted',
  poolClosureReason: String,
  estimatedReopenDate: Date,
  
  reportedBy: User,
  assignedTo: [User],
  approvedBy: User,
  
  adminNotes: String,
  approvalDate: Date,
  
  futureMaintenance: [{
    suggestedTask: String,
    suggestedDate: Date,
    reason: String,
    priority: 'low' | 'medium' | 'high'
  }],
  
  cost: Number,
  photos: [String],
  notes: String
}
```

## Common Chemical Tracking Examples

- **Chlorine**: 1-3 ppm (parts per million)
- **pH Level**: 7.2-7.8
- **Alkalinity**: 80-120 ppm
- **Calcium Hardness**: 200-400 ppm
- **Cyanuric Acid**: 30-50 ppm
- **Temperature**: 78-82°F (25-28°C)

## Navigation

### Maintenance Staff
- Dashboard → Maintenance tab → Maintenance Dashboard
- Or direct link: `/maintenance`

### Admin
- Admin Dashboard → Maintenance tab → Maintenance Dashboard
- Or direct link: `/admin/maintenance`

### Public
- Landing page shows pool status automatically
- No authentication required

## Security

- Only authenticated users can view full maintenance records
- Only staff and admin can create reports
- Only admin can approve/reject
- Only admin can delete records
- Pool status is public for transparency

## Future Enhancements

1. **Email Notifications**
   - Alert admin when new report submitted
   - Notify staff when report approved/rejected
   - Remind about upcoming scheduled maintenance

2. **Photo Upload**
   - Add visual documentation to reports
   - Before/after photos

3. **Maintenance Calendar**
   - Visual timeline of past and future maintenance
   - Integration with pool booking system

4. **Equipment Tracking**
   - Track equipment condition
   - Schedule preventive maintenance

5. **Analytics Dashboard**
   - Cost trends over time
   - Chemical usage patterns
   - Maintenance frequency analysis

6. **Mobile App**
   - Quick report creation from mobile devices
   - Push notifications

## Troubleshooting

### Maintenance user can't login
- Verify user was created: Check MongoDB users collection
- Verify role is set to 'maintenance' or 'staff'
- Try resetting password

### Pool status not updating
- Check that maintenance is approved
- Verify poolStatus field is set correctly
- Check for ongoing maintenance with poolStatus='closed'

### Can't see maintenance tab
- Verify user role is 'maintenance', 'staff', or 'admin'
- Check that routes are properly configured in App.jsx
- Clear browser cache and reload

## Support

For issues or questions:
1. Check this documentation
2. Review API error messages in browser console
3. Check server logs for backend errors
4. Contact system administrator

---

**Version:** 1.0.0  
**Last Updated:** January 2026  
**Developed for:** University of Sri Jayewardenepura Pool Management System
