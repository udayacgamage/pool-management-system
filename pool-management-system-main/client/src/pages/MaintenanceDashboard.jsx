import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

const MaintenanceDashboard = () => {
  const { logout } = useAuth();
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const createSectionRef = useRef(null);
  const recordsSectionRef = useRef(null);

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
      <div className="h-[100dvh] md:h-screen w-screen bg-[#fafbfc] flex items-center justify-center">
        <div
          className="w-10 h-10 border-4 border-slate-200 rounded-full animate-spin"
          style={{ borderTopColor: 'var(--mg)' }}
          aria-label="Loading"
        ></div>
      </div>
    );
  }

  const scrollTo = (ref) => {
    ref?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleNav = (id) => {
    if (id === 'create') {
      setShowForm(true);
      setTimeout(() => scrollTo(createSectionRef), 0);
    }
    if (id === 'records') {
      setShowForm(false);
      setTimeout(() => scrollTo(recordsSectionRef), 0);
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="h-[100dvh] md:h-screen w-screen bg-[#fafbfc] flex font-sans overflow-hidden">
      {/* Mobile sidebar overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-[#5a0000] text-white rounded-2xl shadow-xl border border-[#5a0000] active:scale-95 transition-all"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
      >
        {isMobileMenuOpen ? '✕' : '☰'}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          ${isSidebarOpen ? 'w-72' : 'w-24'}
          ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
          fixed lg:relative h-full z-50 flex-shrink-0
          bg-[#5a0000] text-white transition-all duration-300 flex flex-col
        `}
      >
        <div className="p-8 border-b border-slate-800/50">
          <Logo size="md" dark showText={isSidebarOpen} />
        </div>

        <nav className="flex-1 px-4 mt-8 space-y-2 text-[11px] font-black uppercase tracking-widest overflow-y-auto custom-scrollbar">
          <button
            type="button"
            onClick={() => handleNav('create')}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all text-slate-200 hover:bg-[#6a0000]/50 hover:text-white"
          >
            <span className="text-xl">📝</span>
            {isSidebarOpen && <span>Create Report</span>}
          </button>
          <button
            type="button"
            onClick={() => handleNav('records')}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all text-slate-200 hover:bg-[#6a0000]/50 hover:text-white"
          >
            <span className="text-xl">📋</span>
            {isSidebarOpen && <span>Records</span>}
          </button>
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all text-slate-200 hover:bg-[#6a0000]/50 hover:text-white"
          >
            <span className="text-xl">🏠</span>
            {isSidebarOpen && <span>Home</span>}
          </Link>
        </nav>

        <div className="p-6 mt-auto space-y-3">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center gap-4 px-4 py-4 text-slate-200 hover:bg-white/10 rounded-2xl transition-all"
          >
            <span className="text-xl">↔</span>
            {isSidebarOpen && <span className="font-bold">Toggle Sidebar</span>}
          </button>
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-4 px-4 py-4 text-rose-300 hover:bg-rose-500/10 hover:text-rose-200 rounded-2xl transition-all"
          >
            <span className="text-xl">🚪</span>
            {isSidebarOpen && <span className="font-bold">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 h-full overflow-y-auto p-6 lg:p-10 scroll-smooth">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-800">Maintenance Dashboard</h1>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-widest italic">Maintenance Portal</p>
          </div>

          <button
            type="button"
            onClick={() => {
              const next = !showForm;
              setShowForm(next);
              if (next) setTimeout(() => scrollTo(createSectionRef), 0);
            }}
            className="btn-maroon px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg"
          >
            {showForm ? 'Close Form' : '+ New Report'}
          </button>
        </header>

        {(error || success) && (
          <div
            className={`mb-8 p-5 rounded-2xl flex items-center gap-4 border ${
              error
                ? 'bg-rose-50 text-rose-700 border-rose-100'
                : 'bg-emerald-50 text-emerald-700 border-emerald-100'
            }`}
          >
            <span className="text-xl">{error ? '🚫' : '💎'}</span>
            <p className="font-black text-[10px] uppercase tracking-widest">{error || success}</p>
          </div>
        )}

        {showForm && (
          <div ref={createSectionRef} className="card p-6 mb-8">
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
                    className="input-field !px-4 !py-2"
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
                    className="input-field !px-4 !py-2"
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
                    className="input-field !px-4 !py-2"
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
                    className="input-field !px-4 !py-2"
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
                    className="input-field !px-4 !py-2"
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
                    className="input-field !px-4 !py-2"
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
                    className="input-field !px-4 !py-2"
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
                    className="input-field !px-4 !py-2"
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
                    className="input-field !px-4 !py-2"
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
                      className="input-field !px-4 !py-2"
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
                      className="input-field !px-4 !py-2"
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
                  className="input-field !px-4 !py-2"
                />
              </div>

              {/* Chemical Levels Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Chemical Levels</h3>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
                  <select
                    value={selectedChemicalTemplate}
                    onChange={handleChemicalTemplateChange}
                    className="input-field !px-4 !py-2"
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
                    className="input-field !px-4 !py-2"
                  />
                  <input
                    type="number"
                    placeholder="Current Level"
                    value={chemical.currentLevel}
                    onChange={(e) => setChemical({...chemical, currentLevel: e.target.value})}
                    className="input-field !px-4 !py-2"
                  />
                  <input
                    type="text"
                    placeholder="Unit (e.g., ppm)"
                    value={chemical.unit}
                    onChange={(e) => setChemical({...chemical, unit: e.target.value})}
                    className="input-field !px-4 !py-2"
                  />
                  <select
                    value={chemical.status}
                    onChange={(e) => setChemical({...chemical, status: e.target.value})}
                    className="input-field !px-4 !py-2"
                  >
                    <option value="optimal">Optimal</option>
                    <option value="low">Low</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                  <button
                    type="button"
                    onClick={addChemical}
                    className="btn-outline motion-soft !px-4 !py-2"
                  >
                    Add
                  </button>
                </div>
                
                {formData.chemicals.length > 0 && (
                  <div className="space-y-2">
                    {formData.chemicals.map((chem, index) => (
                      <div key={index} className="flex items-center justify-between bg-white/70 border border-slate-200 p-3 rounded-2xl">
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
                    className="input-field !px-4 !py-2"
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
                    className="input-field !px-4 !py-2"
                  />
                  <input
                    type="number"
                    placeholder="Reading"
                    value={waterTest.reading}
                    onChange={(e) => setWaterTest({ ...waterTest, reading: e.target.value })}
                    className="input-field !px-4 !py-2"
                  />
                  <input
                    type="text"
                    placeholder="Unit"
                    value={waterTest.unit}
                    onChange={(e) => setWaterTest({ ...waterTest, unit: e.target.value })}
                    className="input-field !px-4 !py-2"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={waterTest.idealRange.min}
                      onChange={(e) => setWaterTest({ ...waterTest, idealRange: { ...waterTest.idealRange, min: e.target.value } })}
                      className="input-field !px-4 !py-2"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={waterTest.idealRange.max}
                      onChange={(e) => setWaterTest({ ...waterTest, idealRange: { ...waterTest.idealRange, max: e.target.value } })}
                      className="input-field !px-4 !py-2"
                    />
                  </div>
                  <input
                    type="datetime-local"
                    value={waterTest.sampleTime}
                    onChange={(e) => setWaterTest({ ...waterTest, sampleTime: e.target.value })}
                    className="input-field !px-4 !py-2"
                  />
                  <select
                    value={waterTest.status}
                    onChange={(e) => setWaterTest({ ...waterTest, status: e.target.value })}
                    className="input-field !px-4 !py-2"
                  >
                    <option value="pass">Pass</option>
                    <option value="monitor">Monitor</option>
                    <option value="fail">Fail</option>
                  </select>
                  <button
                    type="button"
                    onClick={addWaterTest}
                    className="btn-outline motion-soft !px-4 !py-2"
                  >
                    Add Test
                  </button>
                </div>

                {formData.waterTests.length > 0 && (
                  <div className="space-y-2">
                    {formData.waterTests.map((test, index) => (
                      <div key={index} className="flex flex-wrap md:flex-nowrap items-center justify-between bg-white/70 border border-slate-200 p-3 rounded-2xl gap-2">
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
                    className="input-field !px-4 !py-2"
                  />
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={supply.quantity}
                    onChange={(e) => setSupply({...supply, quantity: e.target.value})}
                    className="input-field !px-4 !py-2"
                  />
                  <input
                    type="text"
                    placeholder="Unit"
                    value={supply.unit}
                    onChange={(e) => setSupply({...supply, unit: e.target.value})}
                    className="input-field !px-4 !py-2"
                  />
                  <input
                    type="number"
                    placeholder="Cost"
                    value={supply.cost}
                    onChange={(e) => setSupply({...supply, cost: e.target.value})}
                    className="input-field !px-4 !py-2"
                  />
                  <button
                    type="button"
                    onClick={addSupply}
                    className="btn-outline motion-soft !px-4 !py-2"
                  >
                    Add
                  </button>
                </div>

                {formData.supplies.length > 0 && (
                  <div className="space-y-2">
                    {formData.supplies.map((sup, index) => (
                      <div key={index} className="flex items-center justify-between bg-white/70 border border-slate-200 p-3 rounded-2xl">
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
                    className="input-field !px-4 !py-2"
                  />
                  <select
                    value={equipmentInspection.condition}
                    onChange={(e) => setEquipmentInspection({ ...equipmentInspection, condition: e.target.value })}
                    className="input-field !px-4 !py-2"
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
                    className="input-field !px-4 !py-2"
                  />
                  <button
                    type="button"
                    onClick={addEquipmentInspection}
                    className="btn-outline motion-soft !px-4 !py-2"
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
                    className="input-field !px-4 !py-2"
                  />
                  <input
                    type="text"
                    placeholder="Corrective Actions"
                    value={equipmentInspection.correctiveActions}
                    onChange={(e) => setEquipmentInspection({ ...equipmentInspection, correctiveActions: e.target.value })}
                    className="input-field !px-4 !py-2"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={equipmentInspection.lastServicedDate}
                      onChange={(e) => setEquipmentInspection({ ...equipmentInspection, lastServicedDate: e.target.value })}
                      className="input-field !px-4 !py-2"
                    />
                    <input
                      type="date"
                      value={equipmentInspection.nextServiceDue}
                      onChange={(e) => setEquipmentInspection({ ...equipmentInspection, nextServiceDue: e.target.value })}
                      className="input-field !px-4 !py-2"
                    />
                  </div>
                </div>

                {formData.equipmentInspections.length > 0 && (
                  <div className="space-y-2">
                    {formData.equipmentInspections.map((inspection, index) => (
                      <div key={index} className="bg-white/70 border border-slate-200 p-4 rounded-2xl flex flex-col gap-2">
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
                    className="input-field !px-4 !py-2"
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={task.description}
                    onChange={(e) => setTask({...task, description: e.target.value})}
                    className="input-field !px-4 !py-2"
                  />
                  <button
                    type="button"
                    onClick={addTask}
                    className="btn-outline motion-soft !px-4 !py-2"
                  >
                    Add Task
                  </button>
                </div>

                {formData.tasks.length > 0 && (
                  <div className="space-y-2">
                    {formData.tasks.map((t, index) => (
                      <div key={index} className="flex items-center justify-between bg-white/70 border border-slate-200 p-3 rounded-2xl">
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
                    className="input-field !px-4 !py-2"
                  />
                  <select
                    value={safetyCheck.status}
                    onChange={(e) => setSafetyCheck({ ...safetyCheck, status: e.target.value })}
                    className="input-field !px-4 !py-2"
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
                    className="input-field !px-4 !py-2"
                  />
                  <button
                    type="button"
                    onClick={addSafetyCheck}
                    className="btn-outline motion-soft !px-4 !py-2"
                  >
                    Add Check
                  </button>
                </div>

                <textarea
                  placeholder="Notes / Remedial Actions"
                  value={safetyCheck.notes}
                  onChange={(e) => setSafetyCheck({ ...safetyCheck, notes: e.target.value })}
                  rows="2"
                  className="input-field !px-4 !py-2"
                />

                {formData.safetyChecks.length > 0 && (
                  <div className="space-y-2 mt-4">
                    {formData.safetyChecks.map((check, index) => (
                      <div key={index} className="flex flex-col md:flex-row md:items-center justify-between bg-white/70 border border-slate-200 p-3 rounded-2xl gap-2">
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
                  className="input-field !px-4 !py-2"
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-outline motion-soft !px-6 !py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-maroon motion-soft !px-6 !py-2"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Maintenance Records List */}
        <div ref={recordsSectionRef} className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-800">Maintenance Records</h2>
            <button
              type="button"
              onClick={() => handleNav('create')}
              className="btn-outline motion-soft !px-4 !py-2 text-xs uppercase tracking-widest"
            >
              + Create
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-white/60">
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
              <tbody className="bg-white divide-y divide-slate-200">
                {maintenanceRecords.map((record) => (
                  <tr key={record._id} className="hover:bg-slate-50">
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

        {/* Spacer for mobile scroll */}
        <div className="h-10" />
      </main>
    </div>
  );
};

export default MaintenanceDashboard;
