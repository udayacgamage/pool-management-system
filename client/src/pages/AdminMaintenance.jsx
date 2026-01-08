import { useState, useEffect } from 'react';
import api from '../services/api';

const AdminMaintenance = () => {
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [stats, setStats] = useState(null);
  const [poolStatusInfo, setPoolStatusInfo] = useState(null);
  const [poolStatusLoading, setPoolStatusLoading] = useState(true);
  const [poolStatusMessage, setPoolStatusMessage] = useState('');
  const [poolStatusUpdating, setPoolStatusUpdating] = useState(false);

  const [approvalData, setApprovalData] = useState({
    status: 'approved',
    adminNotes: '',
    poolStatus: 'open',
    estimatedReopenDate: ''
  });

  const [futureMaintenance, setFutureMaintenance] = useState({
    suggestedTask: '',
    suggestedDate: '',
    reason: '',
    priority: 'medium'
  });

  useEffect(() => {
    fetchMaintenanceRecords();
  }, [filter]);

  useEffect(() => {
    fetchStats();
    fetchPoolStatus();
  }, []);

  const fetchMaintenanceRecords = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const { data } = await api.get('/maintenance', { params });
      setMaintenanceRecords(data.data);
    } catch (err) {
      setError('Failed to fetch maintenance records');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/maintenance/stats');
      setStats(data.data);
    } catch (err) {
      console.error('Failed to fetch stats');
    }
  };

  const fetchPoolStatus = async () => {
    try {
      const { data } = await api.get('/maintenance/pool-status');
      setPoolStatusInfo(data.data);
      setPoolStatusMessage(data.data?.override?.message || '');
    } catch (err) {
      console.error('Failed to fetch pool status');
    } finally {
      setPoolStatusLoading(false);
    }
  };

  const updatePoolStatus = async (status) => {
    if (poolStatusUpdating) return;

    if (status === 'closed') {
      const confirmed = window.confirm('Are you sure you want to close the pool? This will be visible to all users.');
      if (!confirmed) {
        return;
      }
    }

    setPoolStatusUpdating(true);
    setError('');
    setSuccess('');

    try {
      setPoolStatusLoading(true);
      const trimmedMessage = (poolStatusMessage || '').trim();

      // Setting the pool to "open" is intended to clear any manual override.
      // Do not send a message in that case, and clear the message field locally.
      const payload =
        status === 'open'
          ? { status }
          : { status, message: trimmedMessage ? trimmedMessage : undefined };

      await api.put('/maintenance/pool-status', payload);
      if (status === 'open') {
        setPoolStatusMessage('');
      }
      setSuccess(`Pool status updated to ${status}`);
      await fetchPoolStatus();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update pool status');
    } finally {
      setPoolStatusLoading(false);
      setPoolStatusUpdating(false);
    }
  };

  const handleApprove = async () => {
    setError('');
    setSuccess('');

    try {
      await api.put(`/maintenance/${selectedRecord._id}/approve`, approvalData);
      setSuccess(`Maintenance record ${approvalData.status}!`);
      setShowApprovalModal(false);
      setSelectedRecord(null);
      fetchMaintenanceRecords();
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process approval');
    }
  };

  const handleAddFutureMaintenance = async () => {
    if (!futureMaintenance.suggestedTask || !futureMaintenance.suggestedDate) {
      setError('Please fill in required fields for future maintenance');
      return;
    }

    try {
      await api.post(`/maintenance/${selectedRecord._id}/future-maintenance`, futureMaintenance);
      setSuccess('Future maintenance suggestion added!');
      setFutureMaintenance({
        suggestedTask: '',
        suggestedDate: '',
        reason: '',
        priority: 'medium'
      });
      fetchMaintenanceRecords();
    } catch (err) {
      setError('Failed to add future maintenance suggestion');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this maintenance record?')) {
      return;
    }

    try {
      await api.delete(`/maintenance/${id}`);
      setSuccess('Maintenance record deleted');
      fetchMaintenanceRecords();
      fetchStats();
    } catch (err) {
      setError('Failed to delete maintenance record');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'in-progress': 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      rejected: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-green-600',
      medium: 'text-yellow-600',
      high: 'text-orange-600',
      critical: 'text-red-600 font-bold'
    };
    return colors[priority] || 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mg-soft py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Maintenance Management</h1>

          <div className="card p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <div className="text-sm uppercase tracking-wide text-gray-500">Current Pool Status</div>
                <div className="text-3xl font-bold text-gray-900 capitalize">
                  {poolStatusLoading ? 'Loading…' : (poolStatusInfo?.status || 'open')}
                </div>
                {poolStatusInfo?.override && (
                  <div className="mt-2 text-sm text-gray-600">
                    <span className="font-medium text-blue-600">Manual override active</span>
                    {poolStatusInfo.override.updatedBy?.name && ` by ${poolStatusInfo.override.updatedBy.name}`}
                    {poolStatusInfo.override.updatedAt && ` · ${new Date(poolStatusInfo.override.updatedAt).toLocaleString()}`}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {['open', 'restricted', 'closed'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => updatePoolStatus(status)}
                    disabled={poolStatusUpdating}
                    className={`px-4 py-2 rounded-2xl capitalize motion-soft border ${
                      (poolStatusInfo?.status === status && !poolStatusLoading)
                        ? 'bg-mg text-white border-mg'
                        : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                    } ${poolStatusUpdating ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    Set {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Public Notice (shown on landing page)
                </label>
                <textarea
                  value={poolStatusMessage}
                  onChange={(e) => setPoolStatusMessage(e.target.value)}
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional message (e.g., Reason for closure, expected reopen time)"
                />
                <p className="text-xs text-gray-500 mt-1">Leave blank for a generic status message.</p>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-900">
                <p className="font-semibold mb-2">Heads up</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Status updates appear instantly on the public landing page.</li>
                  <li>Set to <strong>Open</strong> to clear the manual override.</li>
                  <li>Use the message field to explain closures or restrictions.</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600">Pending</div>
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.byStatus.find(s => s._id === 'pending')?.count || 0}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600">In Progress</div>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.byStatus.find(s => s._id === 'in-progress')?.count || 0}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600">Completed</div>
                <div className="text-2xl font-bold text-green-600">
                  {stats.byStatus.find(s => s._id === 'completed')?.count || 0}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600">Overdue</div>
                <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
              </div>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6">
            {['all', 'pending', 'in-progress', 'completed', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-2xl capitalize motion-soft border ${
                  filter === status
                    ? 'bg-mg text-white border-mg'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        {/* Maintenance Records Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {maintenanceRecords.map((record) => (
            <div key={record._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{record.title}</h3>
                    <p className="text-sm text-gray-600 capitalize">{record.type} Maintenance</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(record.status)}`}>
                    {record.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Priority:</span>
                    <span className={`font-semibold capitalize ${getPriorityColor(record.priority)}`}>
                      {record.priority}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Scheduled:</span>
                    <span className="font-medium">
                      {new Date(record.scheduledDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pool Status:</span>
                    <span className={`font-medium capitalize ${
                      record.poolStatus === 'closed' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {record.poolStatus}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reported By:</span>
                    <span className="font-medium">{record.reportedBy?.name || 'N/A'}</span>
                  </div>
                  {record.cost > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cost:</span>
                      <span className="font-medium">${record.cost.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <p className="text-gray-700 mb-4">{record.description}</p>

                {/* Chemicals */}
                {record.chemicals && record.chemicals.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Chemical Levels:</h4>
                    <div className="space-y-1">
                      {record.chemicals.map((chem, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>{chem.name}:</span>
                          <span className={`font-medium ${
                            chem.status === 'optimal' ? 'text-green-600' : 
                            chem.status === 'critical' ? 'text-red-600' : 'text-yellow-600'
                          }`}>
                            {chem.currentLevel} {chem.unit} ({chem.status})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Supplies */}
                {record.supplies && record.supplies.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Supplies Used:</h4>
                    <div className="space-y-1">
                      {record.supplies.map((supply, idx) => (
                        <div key={idx} className="text-sm text-gray-700">
                          • {supply.item}: {supply.quantity} {supply.unit}
                          {supply.cost && ` ($${supply.cost})`}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tasks */}
                {record.tasks && record.tasks.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Tasks:</h4>
                    <div className="space-y-1">
                      {record.tasks.map((task, idx) => (
                        <div key={idx} className="text-sm text-gray-700">
                          • {task.task}
                          {task.completed && <span className="text-green-600 ml-2">✓</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Admin Notes */}
                {record.adminNotes && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-1">Admin Notes:</h4>
                    <p className="text-sm text-gray-700">{record.adminNotes}</p>
                  </div>
                )}

                {/* Future Maintenance Suggestions */}
                {record.futureMaintenance && record.futureMaintenance.length > 0 && (
                  <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Future Maintenance:</h4>
                    {record.futureMaintenance.map((fm, idx) => (
                      <div key={idx} className="text-sm mb-2">
                        <div className="font-medium">{fm.suggestedTask}</div>
                        <div className="text-gray-600">
                          {new Date(fm.suggestedDate).toLocaleDateString()} - {fm.priority}
                        </div>
                        {fm.reason && <div className="text-gray-600 italic">{fm.reason}</div>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  {record.status === 'pending' || record.status === 'completed' ? (
                    <button
                      onClick={() => {
                        setSelectedRecord(record);
                        setApprovalData({
                          status: 'approved',
                          adminNotes: '',
                          poolStatus: record.poolStatus,
                          estimatedReopenDate: record.estimatedReopenDate || ''
                        });
                        setShowApprovalModal(true);
                      }}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      Review / Approve
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedRecord(record);
                      }}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      View Details
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(record._id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {maintenanceRecords.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No maintenance records found</p>
          </div>
        )}

        {/* Approval Modal */}
        {showApprovalModal && selectedRecord && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Review Maintenance Record</h2>
                <h3 className="text-xl font-semibold mb-4">{selectedRecord.title}</h3>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Decision
                    </label>
                    <select
                      value={approvalData.status}
                      onChange={(e) => setApprovalData({...approvalData, status: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="approved">Approve</option>
                      <option value="rejected">Reject</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pool Status Decision
                    </label>
                    <select
                      value={approvalData.poolStatus}
                      onChange={(e) => setApprovalData({...approvalData, poolStatus: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="open">Open Pool</option>
                      <option value="closed">Close Pool</option>
                      <option value="restricted">Restricted Access</option>
                    </select>
                  </div>

                  {approvalData.poolStatus === 'closed' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estimated Reopen Date
                      </label>
                      <input
                        type="datetime-local"
                        value={approvalData.estimatedReopenDate}
                        onChange={(e) => setApprovalData({...approvalData, estimatedReopenDate: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Admin Notes
                    </label>
                    <textarea
                      value={approvalData.adminNotes}
                      onChange={(e) => setApprovalData({...approvalData, adminNotes: e.target.value})}
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Add your notes about this maintenance..."
                    />
                  </div>
                </div>

                {/* Future Maintenance Suggestion */}
                <div className="border-t pt-4 mb-6">
                  <h4 className="font-semibold mb-4">Add Future Maintenance Suggestion (Optional)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Suggested Task
                      </label>
                      <input
                        type="text"
                        value={futureMaintenance.suggestedTask}
                        onChange={(e) => setFutureMaintenance({...futureMaintenance, suggestedTask: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Suggested Date
                      </label>
                      <input
                        type="date"
                        value={futureMaintenance.suggestedDate}
                        onChange={(e) => setFutureMaintenance({...futureMaintenance, suggestedDate: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority
                      </label>
                      <select
                        value={futureMaintenance.priority}
                        onChange={(e) => setFutureMaintenance({...futureMaintenance, priority: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reason
                      </label>
                      <input
                        type="text"
                        value={futureMaintenance.reason}
                        onChange={(e) => setFutureMaintenance({...futureMaintenance, reason: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                  {futureMaintenance.suggestedTask && futureMaintenance.suggestedDate && (
                    <button
                      onClick={handleAddFutureMaintenance}
                      className="mt-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                    >
                      Add Future Maintenance
                    </button>
                  )}
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => {
                      setShowApprovalModal(false);
                      setSelectedRecord(null);
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApprove}
                    className={`px-6 py-2 rounded-lg text-white ${
                      approvalData.status === 'approved'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {approvalData.status === 'approved' ? 'Approve' : 'Reject'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMaintenance;
