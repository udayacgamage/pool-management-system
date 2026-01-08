import { useState, useEffect } from 'react';
import api from '../services/api';

const PoolStatus = () => {
  const [poolData, setPoolData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPoolStatus();
    // Refresh every 5 minutes
    const interval = setInterval(fetchPoolStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchPoolStatus = async () => {
    try {
      const { data } = await api.get('/maintenance/pool-status');
      setPoolData(data.data);
    } catch (err) {
      console.error('Failed to fetch pool status');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  const status = poolData?.status || 'open';
  const override = poolData?.override;
  const isOpen = status === 'open';
  const lastUpdated = override?.updatedAt || poolData?.latestMaintenance?.updatedAt || poolData?.latestMaintenance?.scheduledDate;

  return (
    <div className={`rounded-lg shadow-lg p-6 ${
      isOpen ? 'bg-gradient-to-br from-green-50 to-green-100' : 'bg-gradient-to-br from-red-50 to-red-100'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Pool Status</h2>
        <div className={`w-4 h-4 rounded-full ${isOpen ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
      </div>

      <div className="mb-4">
        <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-semibold ${
          status === 'open'
            ? 'bg-green-600 text-white'
            : status === 'restricted'
              ? 'bg-yellow-500 text-white'
              : 'bg-red-600 text-white'
        }`}>
          {status === 'open' ? '✓ OPEN' : status === 'restricted' ? '⚠ RESTRICTED' : '✕ CLOSED'}
        </div>
      </div>

      {override?.message && (
        <div className="mb-4 bg-white/80 border-l-4 border-blue-500 rounded p-4 shadow-sm">
          <div className="text-sm text-blue-700 whitespace-pre-line">{override.message}</div>
        </div>
      )}

      {override && (
        <div className="mb-4 text-xs uppercase tracking-wide text-blue-700 font-semibold">
          Manual update by {override.updatedBy?.name || 'Admin'}
          {override.updatedAt && ` · ${new Date(override.updatedAt).toLocaleString()}`}
        </div>
      )}

      {!isOpen && poolData?.ongoingMaintenance?.length > 0 && (
        <div className="mt-4 space-y-3">
          <h3 className="font-semibold text-gray-900">Ongoing Maintenance:</h3>
          {poolData.ongoingMaintenance.map((maintenance) => (
            <div key={maintenance._id} className="bg-white rounded-lg p-4 shadow">
              <div className="font-medium text-gray-900">{maintenance.title}</div>
              <div className="text-sm text-gray-600 mt-1">{maintenance.description}</div>
              {maintenance.poolClosureReason && (
                <div className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">Reason:</span> {maintenance.poolClosureReason}
                </div>
              )}
              {maintenance.estimatedReopenDate && (
                <div className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">Expected to reopen:</span>{' '}
                  {new Date(maintenance.estimatedReopenDate).toLocaleString()}
                </div>
              )}
              <div className="mt-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  maintenance.priority === 'critical' ? 'bg-red-100 text-red-800' :
                  maintenance.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                  maintenance.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {maintenance.priority} priority
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {poolData?.latestMaintenance && isOpen && (
        <div className="mt-4 p-3 bg-white rounded-lg">
          <div className="text-sm text-gray-600">
            Last maintenance: {new Date(poolData.latestMaintenance.scheduledDate).toLocaleDateString()}
          </div>
          <div className="text-sm text-gray-900 font-medium">
            {poolData.latestMaintenance.title}
          </div>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        <p>
          Last updated:{' '}
          {lastUpdated ? new Date(lastUpdated).toLocaleString() : new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default PoolStatus;
