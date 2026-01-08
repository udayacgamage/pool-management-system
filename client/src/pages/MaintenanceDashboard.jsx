import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const MaintenanceDashboard = () => {
  const navigate = useNavigate();
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    type: 'routine',
    priority: 'medium',
    scheduledDate: '',
    description: '',
    poolStatus: 'open',
    poolClosureReason: '',
    estimatedReopenDate: '',
    chemicals: [],
    waterTests: [],
    supplies: [],
    tasks: [],
    equipmentInspections: [],
    safetyChecks: [],
    lifeguardCoverage: 'full',
    crowdLevel: 'low',
    incidentsReported: 0,
    cost: 0,
    notes: ''
  });

  const [chemical, setChemical] = useState({
    name: '',
    currentLevel: '',
    optimalRange: { min: '', max: '' },
    unit: '',
    status: 'optimal'
  });

  const [supply, setSupply] = useState({
    item: '',
    quantity: '',
    unit: '',
    supplier: '',
    cost: ''
  });

  const [task, setTask] = useState({
    task: '',
    description: '',
    completed: false
  });

  const [waterTest, setWaterTest] = useState({
    parameter: '',
    reading: '',
    unit: '',
    idealRange: { min: '', max: '' },
    status: 'pass',
    sampleTime: '',
    notes: ''
  });

  const [equipmentInspection, setEquipmentInspection] = useState({
    equipmentName: '',
    condition: 'good',
    issuesFound: '',
    correctiveActions: '',
    lastServicedDate: '',
    nextServiceDue: '',
    inspector: ''
  });

  const [safetyCheck, setSafetyCheck] = useState({
    item: '',
    status: 'compliant',
    notes: '',
    verifiedBy: ''
  });

  const chemicalTemplates = [
    {
      value: 'freeChlorine',
      label: 'Free Chlorine',
      unit: 'ppm',
      optimalRange: { min: 1, max: 3 }
    },
    {
      value: 'combinedChlorine',
      label: 'Combined Chlorine',
      unit: 'ppm',
      optimalRange: { min: 0, max: 0.2 }
    },
    {
      value: 'ph',
      label: 'pH',
      unit: '',
      optimalRange: { min: 7.2, max: 7.8 }
    },
    {
      value: 'alkalinity',
      label: 'Total Alkalinity',
      unit: 'ppm',
      optimalRange: { min: 80, max: 120 }
    },
    {
      value: 'calciumHardness',
      label: 'Calcium Hardness',
      unit: 'ppm',
      optimalRange: { min: 200, max: 400 }
    },
    {
      value: 'cyanuricAcid',
      label: 'Cyanuric Acid',
      unit: 'ppm',
      optimalRange: { min: 30, max: 50 }
    },
    {
      value: 'saltLevel',
      label: 'Salt Level',
      unit: 'ppm',
      optimalRange: { min: 3000, max: 3500 }
    },
    {
      value: 'custom',
      label: 'Custom'
    }
  ];

  const waterTestTemplates = [
    {
      value: 'ph',
      label: 'pH',
      unit: '',
      idealRange: { min: 7.2, max: 7.8 }
    },
    {
      value: 'freeChlorine',
      label: 'Free Chlorine',
      unit: 'ppm',
      idealRange: { min: 1, max: 3 }
    },
    {
      value: 'combinedChlorine',
      label: 'Combined Chlorine',
      unit: 'ppm',
      idealRange: { min: 0, max: 0.2 }
    },
    {
      value: 'alkalinity',
      label: 'Total Alkalinity',
      unit: 'ppm',
      idealRange: { min: 80, max: 120 }
    },
    {
      value: 'calciumHardness',
      label: 'Calcium Hardness',
      unit: 'ppm',
      idealRange: { min: 200, max: 400 }
    },
    {
      value: 'orp',
      label: 'ORP',
      unit: 'mV',
      idealRange: { min: 650, max: 750 }
    },
    {
      value: 'temperature',
      label: 'Water Temperature',
      unit: '°C',
      idealRange: { min: 26, max: 29 }
    },
    {
      value: 'custom',
      label: 'Custom'
    }
  ];

  const [selectedChemicalTemplate, setSelectedChemicalTemplate] = useState('custom');
  const [selectedWaterTemplate, setSelectedWaterTemplate] = useState('custom');

  const resetChemicalState = () => (
    setChemical({
      name: '',
      currentLevel: '',
      optimalRange: { min: '', max: '' },
      unit: '',
      status: 'optimal'
    })
  );

  const resetWaterTestState = () => (
    setWaterTest({
      parameter: '',
      reading: '',
      unit: '',
      idealRange: { min: '', max: '' },
      status: 'pass',
      sampleTime: '',
      notes: ''
    })
  );

  const handleChemicalTemplateChange = (e) => {
    const value = e.target.value;
    setSelectedChemicalTemplate(value);

    if (value === 'custom') {
      resetChemicalState();
      return;
    }

    const template = chemicalTemplates.find((option) => option.value === value);
    if (!template) return;

    setChemical({
      name: template.label,
      currentLevel: '',
      optimalRange: {
        min: template.optimalRange?.min !== undefined ? String(template.optimalRange.min) : '',
        max: template.optimalRange?.max !== undefined ? String(template.optimalRange.max) : ''
      },
      unit: template.unit || '',
      status: 'optimal'
    });
  };

  const handleWaterTemplateChange = (e) => {
    const value = e.target.value;
    setSelectedWaterTemplate(value);

    if (value === 'custom') {
      resetWaterTestState();
      return;
    }

    const template = waterTestTemplates.find((option) => option.value === value);
    if (!template) return;

    setWaterTest({
      parameter: template.label,
      reading: '',
      unit: template.unit || '',
      idealRange: {
        min: template.idealRange?.min !== undefined ? String(template.idealRange.min) : '',
        max: template.idealRange?.max !== undefined ? String(template.idealRange.max) : ''
      },
      status: 'pass',
      sampleTime: '',
      notes: ''
    });
  };

  useEffect(() => {
    fetchMaintenanceRecords();
  }, []);

  const fetchMaintenanceRecords = async () => {
    try {
      const { data } = await api.get('/maintenance');
      setMaintenanceRecords(data.data);
    } catch (err) {
      setError('Failed to fetch maintenance records');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numericFields = ['cost', 'incidentsReported'];
    const processedValue = numericFields.includes(name)
      ? (value === '' ? '' : Number(value))
      : value;
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const addChemical = () => {
    if (!chemical.name || !chemical.currentLevel || !chemical.unit) {
      setError('Please fill in all chemical fields');
      return;
    }
    const normalizedChemical = {
      ...chemical,
      currentLevel: Number(chemical.currentLevel),
      optimalRange: {
        min: chemical.optimalRange.min !== '' ? Number(chemical.optimalRange.min) : undefined,
        max: chemical.optimalRange.max !== '' ? Number(chemical.optimalRange.max) : undefined,
      }
    };
    setFormData(prev => ({
      ...prev,
      chemicals: [...prev.chemicals, normalizedChemical]
    }));
    resetChemicalState();
    setSelectedChemicalTemplate('custom');
  };

  const addSupply = () => {
    if (!supply.item || !supply.quantity || !supply.unit) {
      setError('Please fill in required supply fields');
      return;
    }
    const normalizedSupply = {
      ...supply,
      quantity: Number(supply.quantity),
      cost: supply.cost !== '' ? Number(supply.cost) : undefined
    };
    setFormData(prev => ({
      ...prev,
      supplies: [...prev.supplies, normalizedSupply]
    }));
    setSupply({
      item: '',
      quantity: '',
      unit: '',
      supplier: '',
      cost: ''
    });
  };

  const addTask = () => {
    if (!task.task) {
      setError('Please enter task description');
      return;
    }
    setFormData(prev => ({
      ...prev,
      tasks: [...prev.tasks, task]
    }));
    setTask({
      task: '',
      description: '',
      completed: false
    });
  };

  const addWaterTest = () => {
    if (!waterTest.parameter || !waterTest.reading || !waterTest.unit) {
      setError('Complete all required water test fields');
      return;
    }
    const normalizedTest = {
      ...waterTest,
      reading: Number(waterTest.reading),
      idealRange: {
        min: waterTest.idealRange.min !== '' ? Number(waterTest.idealRange.min) : undefined,
        max: waterTest.idealRange.max !== '' ? Number(waterTest.idealRange.max) : undefined,
      },
      sampleTime: waterTest.sampleTime ? new Date(waterTest.sampleTime) : undefined
    };
    setFormData(prev => ({
      ...prev,
      waterTests: [...prev.waterTests, normalizedTest]
    }));
    resetWaterTestState();
    setSelectedWaterTemplate('custom');
  };

  const addEquipmentInspection = () => {
    if (!equipmentInspection.equipmentName) {
      setError('Provide equipment name before adding inspection');
      return;
    }
    const normalizedInspection = {
      ...equipmentInspection,
      lastServicedDate: equipmentInspection.lastServicedDate ? new Date(equipmentInspection.lastServicedDate) : undefined,
      nextServiceDue: equipmentInspection.nextServiceDue ? new Date(equipmentInspection.nextServiceDue) : undefined
    };
    setFormData(prev => ({
      ...prev,
      equipmentInspections: [...prev.equipmentInspections, normalizedInspection]
    }));
    setEquipmentInspection({
      equipmentName: '',
      condition: 'good',
      issuesFound: '',
      correctiveActions: '',
      lastServicedDate: '',
      nextServiceDue: '',
      inspector: ''
    });
  };

  const addSafetyCheck = () => {
    if (!safetyCheck.item) {
      setError('Safety checklist item is required');
      return;
    }
    setFormData(prev => ({
      ...prev,
      safetyChecks: [...prev.safetyChecks, safetyCheck]
    }));
    setSafetyCheck({
      item: '',
      status: 'compliant',
      notes: '',
      verifiedBy: ''
    });
  };

  const removeChemical = (index) => {
    setFormData(prev => ({
      ...prev,
      chemicals: prev.chemicals.filter((_, i) => i !== index)
    }));
  };

  const removeSupply = (index) => {
    setFormData(prev => ({
      ...prev,
      supplies: prev.supplies.filter((_, i) => i !== index)
    }));
  };

  const removeTask = (index) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.filter((_, i) => i !== index)
    }));
  };

  const removeWaterTest = (index) => {
    setFormData(prev => ({
      ...prev,
      waterTests: prev.waterTests.filter((_, i) => i !== index)
    }));
  };

  const removeEquipmentInspection = (index) => {
    setFormData(prev => ({
      ...prev,
      equipmentInspections: prev.equipmentInspections.filter((_, i) => i !== index)
    }));
  };

  const removeSafetyCheck = (index) => {
    setFormData(prev => ({
      ...prev,
      safetyChecks: prev.safetyChecks.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post('/maintenance', formData);
      setSuccess('Maintenance report submitted successfully!');
      setShowForm(false);
      setFormData({
        title: '',
        type: 'routine',
        priority: 'medium',
        scheduledDate: '',
        description: '',
        poolStatus: 'open',
        poolClosureReason: '',
        estimatedReopenDate: '',
        chemicals: [],
        waterTests: [],
        supplies: [],
        tasks: [],
        equipmentInspections: [],
        safetyChecks: [],
        lifeguardCoverage: 'full',
        crowdLevel: 'low',
        incidentsReported: 0,
        cost: 0,
        notes: ''
      });
      fetchMaintenanceRecords();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit maintenance report');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      approved: 'bg-emerald-100 text-emerald-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-green-600',
      medium: 'text-yellow-600',
      high: 'text-orange-600',
      critical: 'text-red-600'
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Maintenance Dashboard</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            {showForm ? 'Cancel' : 'New Maintenance Report'}
          </button>
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

        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6">Create Maintenance Report</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="routine">Routine</option>
                    <option value="emergency">Emergency</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="inspection">Inspection</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scheduled Date
                  </label>
                  <input
                    type="datetime-local"
                    name="scheduledDate"
                    value={formData.scheduledDate}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pool Status
                  </label>
                  <select
                    name="poolStatus"
                    value={formData.poolStatus}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                    <option value="restricted">Restricted</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Cost ($)
                  </label>
                  <input
                    type="number"
                    name="cost"
                    value={formData.cost}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lifeguard Coverage
                  </label>
                  <select
                    name="lifeguardCoverage"
                    value={formData.lifeguardCoverage}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="full">Full</option>
                    <option value="partial">Partial</option>
                    <option value="none">None</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Crowd Level
                  </label>
                  <select
                    name="crowdLevel"
                    value={formData.crowdLevel}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="moderate">Moderate</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Incidents Reported
                  </label>
                  <input
                    type="number"
                    name="incidentsReported"
                    value={formData.incidentsReported}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {formData.poolStatus === 'closed' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Closure Reason
                    </label>
                    <input
                      type="text"
                      name="poolClosureReason"
                      value={formData.poolClosureReason}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Reopen Date
                    </label>
                    <input
                      type="datetime-local"
                      name="estimatedReopenDate"
                      value={formData.estimatedReopenDate}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Chemical Levels Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Chemical Levels</h3>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
                  <select
                    value={selectedChemicalTemplate}
                    onChange={handleChemicalTemplateChange}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    {chemicalTemplates.map((template) => (
                      <option key={template.value} value={template.value}>
                        {template.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Chemical Name"
                    value={chemical.name}
                    onChange={(e) => setChemical({...chemical, name: e.target.value})}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="Current Level"
                    value={chemical.currentLevel}
                    onChange={(e) => setChemical({...chemical, currentLevel: e.target.value})}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Unit (e.g., ppm)"
                    value={chemical.unit}
                    onChange={(e) => setChemical({...chemical, unit: e.target.value})}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <select
                    value={chemical.status}
                    onChange={(e) => setChemical({...chemical, status: e.target.value})}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="optimal">Optimal</option>
                    <option value="low">Low</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                  <button
                    type="button"
                    onClick={addChemical}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Add
                  </button>
                </div>
                
                {formData.chemicals.length > 0 && (
                  <div className="space-y-2">
                    {formData.chemicals.map((chem, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <span>{chem.name}: {chem.currentLevel} {chem.unit} - {chem.status}</span>
                        <button
                          type="button"
                          onClick={() => removeChemical(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Water Quality Tests */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Water Quality Panel</h3>
                <div className="grid grid-cols-1 md:grid-cols-8 gap-4 mb-4">
                  <select
                    value={selectedWaterTemplate}
                    onChange={handleWaterTemplateChange}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    {waterTestTemplates.map((template) => (
                      <option key={template.value} value={template.value}>
                        {template.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Parameter (e.g., pH)"
                    value={waterTest.parameter}
                    onChange={(e) => setWaterTest({ ...waterTest, parameter: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="Reading"
                    value={waterTest.reading}
                    onChange={(e) => setWaterTest({ ...waterTest, reading: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Unit"
                    value={waterTest.unit}
                    onChange={(e) => setWaterTest({ ...waterTest, unit: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={waterTest.idealRange.min}
                      onChange={(e) => setWaterTest({ ...waterTest, idealRange: { ...waterTest.idealRange, min: e.target.value } })}
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={waterTest.idealRange.max}
                      onChange={(e) => setWaterTest({ ...waterTest, idealRange: { ...waterTest.idealRange, max: e.target.value } })}
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <input
                    type="datetime-local"
                    value={waterTest.sampleTime}
                    onChange={(e) => setWaterTest({ ...waterTest, sampleTime: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <select
                    value={waterTest.status}
                    onChange={(e) => setWaterTest({ ...waterTest, status: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="pass">Pass</option>
                    <option value="monitor">Monitor</option>
                    <option value="fail">Fail</option>
                  </select>
                  <button
                    type="button"
                    onClick={addWaterTest}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Add Test
                  </button>
                </div>

                {formData.waterTests.length > 0 && (
                  <div className="space-y-2">
                    {formData.waterTests.map((test, index) => (
                      <div key={index} className="flex flex-wrap md:flex-nowrap items-center justify-between bg-gray-50 p-3 rounded-lg gap-2">
                        <span className="text-sm">
                          <strong>{test.parameter}</strong>: {test.reading} {test.unit}
                          {test.idealRange.min && test.idealRange.max && ` (Ideal ${test.idealRange.min}-${test.idealRange.max})`} – {test.status}
                          {test.sampleTime && ` | Sampled ${new Date(test.sampleTime).toLocaleString()}`}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeWaterTest(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Supplies Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Supplies Used</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Item"
                    value={supply.item}
                    onChange={(e) => setSupply({...supply, item: e.target.value})}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={supply.quantity}
                    onChange={(e) => setSupply({...supply, quantity: e.target.value})}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Unit"
                    value={supply.unit}
                    onChange={(e) => setSupply({...supply, unit: e.target.value})}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="Cost"
                    value={supply.cost}
                    onChange={(e) => setSupply({...supply, cost: e.target.value})}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={addSupply}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Add
                  </button>
                </div>

                {formData.supplies.length > 0 && (
                  <div className="space-y-2">
                    {formData.supplies.map((sup, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <span>{sup.item}: {sup.quantity} {sup.unit} {sup.cost && `- $${sup.cost}`}</span>
                        <button
                          type="button"
                          onClick={() => removeSupply(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Equipment Inspections */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Critical Equipment Inspections</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Equipment"
                    value={equipmentInspection.equipmentName}
                    onChange={(e) => setEquipmentInspection({ ...equipmentInspection, equipmentName: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <select
                    value={equipmentInspection.condition}
                    onChange={(e) => setEquipmentInspection({ ...equipmentInspection, condition: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                    <option value="out-of-service">Out of Service</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Inspector"
                    value={equipmentInspection.inspector}
                    onChange={(e) => setEquipmentInspection({ ...equipmentInspection, inspector: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={addEquipmentInspection}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Add Inspection
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Issues Found"
                    value={equipmentInspection.issuesFound}
                    onChange={(e) => setEquipmentInspection({ ...equipmentInspection, issuesFound: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Corrective Actions"
                    value={equipmentInspection.correctiveActions}
                    onChange={(e) => setEquipmentInspection({ ...equipmentInspection, correctiveActions: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={equipmentInspection.lastServicedDate}
                      onChange={(e) => setEquipmentInspection({ ...equipmentInspection, lastServicedDate: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="date"
                      value={equipmentInspection.nextServiceDue}
                      onChange={(e) => setEquipmentInspection({ ...equipmentInspection, nextServiceDue: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                {formData.equipmentInspections.length > 0 && (
                  <div className="space-y-2">
                    {formData.equipmentInspections.map((inspection, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">{inspection.equipmentName}</span>
                          <button
                            type="button"
                            onClick={() => removeEquipmentInspection(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="text-sm text-gray-600 grid grid-cols-1 md:grid-cols-2 gap-2">
                          <span>Condition: {inspection.condition}</span>
                          {inspection.inspector && <span>Inspector: {inspection.inspector}</span>}
                          {inspection.issuesFound && <span>Issues: {inspection.issuesFound}</span>}
                          {inspection.correctiveActions && <span>Actions: {inspection.correctiveActions}</span>}
                          {inspection.lastServicedDate && <span>Last Service: {new Date(inspection.lastServicedDate).toLocaleDateString()}</span>}
                          {inspection.nextServiceDue && <span>Next Due: {new Date(inspection.nextServiceDue).toLocaleDateString()}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tasks Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Tasks Performed</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Task"
                    value={task.task}
                    onChange={(e) => setTask({...task, task: e.target.value})}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={task.description}
                    onChange={(e) => setTask({...task, description: e.target.value})}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={addTask}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Add Task
                  </button>
                </div>

                {formData.tasks.length > 0 && (
                  <div className="space-y-2">
                    {formData.tasks.map((t, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <span>{t.task} {t.description && `- ${t.description}`}</span>
                        <button
                          type="button"
                          onClick={() => removeTask(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Safety & Compliance */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Safety & Compliance Checks</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Checklist Item"
                    value={safetyCheck.item}
                    onChange={(e) => setSafetyCheck({ ...safetyCheck, item: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <select
                    value={safetyCheck.status}
                    onChange={(e) => setSafetyCheck({ ...safetyCheck, status: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="compliant">Compliant</option>
                    <option value="needs-attention">Needs Attention</option>
                    <option value="non-compliant">Non-Compliant</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Verified By"
                    value={safetyCheck.verifiedBy}
                    onChange={(e) => setSafetyCheck({ ...safetyCheck, verifiedBy: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={addSafetyCheck}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Add Check
                  </button>
                </div>

                <textarea
                  placeholder="Notes / Remedial Actions"
                  value={safetyCheck.notes}
                  onChange={(e) => setSafetyCheck({ ...safetyCheck, notes: e.target.value })}
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />

                {formData.safetyChecks.length > 0 && (
                  <div className="space-y-2 mt-4">
                    {formData.safetyChecks.map((check, index) => (
                      <div key={index} className="flex flex-col md:flex-row md:items-center justify-between bg-gray-50 p-3 rounded-lg gap-2">
                        <span className="text-sm">
                          <strong>{check.item}</strong> - {check.status}
                          {check.verifiedBy && ` (Verified by ${check.verifiedBy})`}
                          {check.notes && ` – ${check.notes}`}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeSafetyCheck(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Maintenance Records List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Maintenance Records</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scheduled Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pool Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Operations
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Incidents
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {maintenanceRecords.map((record) => (
                  <tr key={record._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{record.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">{record.type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-semibold capitalize ${getPriorityColor(record.priority)}`}>
                        {record.priority}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(record.scheduledDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">{record.poolStatus}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">
                        {record.lifeguardCoverage || 'n/a'} / {record.crowdLevel || 'n/a'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {record.incidentsReported ?? 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceDashboard;
