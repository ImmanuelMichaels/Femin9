// src/components/EmbryoTracker.jsx
import { useState, useEffect, useCallback } from 'react';
import './EmbryoTracker.css';

const STORAGE_KEY = 'embryo_tracker_data';
const AUDIT_LOG_KEY = 'embryo_audit_log';

const GRADE_OPTIONS = [
  { value: 'AA', label: 'AA - Excellent', color: '#2E7D32', description: 'Perfect symmetry, even cells, no fragmentation' },
  { value: 'AB', label: 'AB - Very Good', color: '#43A047', description: 'Good symmetry, minimal fragmentation' },
  { value: 'BA', label: 'BA - Good', color: '#66BB6A', description: 'Fair symmetry, some fragmentation' },
  { value: 'BB', label: 'BB - Fair', color: '#FFA726', description: 'Moderate asymmetry, noticeable fragmentation' },
  { value: 'BC', label: 'BC - Poor', color: '#EF5350', description: 'Poor symmetry, significant fragmentation' },
  { value: 'CB', label: 'CB - Very Poor', color: '#E53935', description: 'Severe asymmetry, high fragmentation' },
  { value: 'CC', label: 'CC - Lowest', color: '#C62828', description: 'Highly fragmented, poor development' },
];

const STAGES = [
  { day: 1, name: 'Fertilisation', icon: '🔬', description: 'Egg meets sperm' },
  { day: 2, name: 'Cleavage Stage', icon: '🧬', description: '2-4 cell stage' },
  { day: 3, name: 'Early Morula', icon: '🌱', description: '8-16 cell stage' },
  { day: 4, name: 'Morula', icon: '🍇', description: '16-32 cell stage' },
  { day: 5, name: 'Early Blastocyst', icon: '🫧', description: 'Cavity formation begins' },
  { day: 6, name: 'Expanded Blastocyst', icon: '⭐', description: 'Ready for transfer' },
  { day: 7, name: 'Hatching Blastocyst', icon: '🐣', description: 'Emerging from shell' },
];

const STATUS_OPTIONS = [
  { value: 'culturing', label: '🔬 Culturing', color: '#9B8FD8' },
  { value: 'transfer-ready', label: '✅ Ready for Transfer', color: '#4CAF50' },
  { value: 'frozen', label: '❄️ Frozen', color: '#2196F3' },
  { value: 'biopsied', label: '🧬 Biopsied', color: '#FF9800' },
  { value: 'discarded', label: '🗑️ Discarded', color: '#9E9E9E' },
  { value: 'transferred', label: '🔄 Transferred', color: '#9C27B0' },
];

export default function EmbryoTracker({ cycleId, onEmbryoUpdate }) {
  const [embryos, setEmbryos] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [selectedEmbryo, setSelectedEmbryo] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [stats, setStats] = useState({
    total: 0,
    transferReady: 0,
    frozen: 0,
    transferred: 0,
    discarded: 0,
  });

  // Load data from localStorage
  useEffect(() => {
    loadData();
  }, [cycleId]);

  const loadData = () => {
    const savedEmbryos = localStorage.getItem(`${STORAGE_KEY}_${cycleId}`);
    const savedAudit = localStorage.getItem(`${AUDIT_LOG_KEY}_${cycleId}`);
    
    if (savedEmbryos) {
      setEmbryos(JSON.parse(savedEmbryos));
    }
    if (savedAudit) {
      setAuditLog(JSON.parse(savedAudit));
    }
  };

  // Save data and update stats
  const saveData = useCallback((newEmbryos, newAuditEntry = null) => {
    localStorage.setItem(`${STORAGE_KEY}_${cycleId}`, JSON.stringify(newEmbryos));
    setEmbryos(newEmbryos);
    
    if (newAuditEntry) {
      const updatedAudit = [newAuditEntry, ...auditLog];
      localStorage.setItem(`${AUDIT_LOG_KEY}_${cycleId}`, JSON.stringify(updatedAudit));
      setAuditLog(updatedAudit);
    }
    
    // Update stats
    const newStats = {
      total: newEmbryos.length,
      transferReady: newEmbryos.filter(e => e.status === 'transfer-ready').length,
      frozen: newEmbryos.filter(e => e.status === 'frozen').length,
      transferred: newEmbryos.filter(e => e.status === 'transferred').length,
      discarded: newEmbryos.filter(e => e.status === 'discarded').length,
    };
    setStats(newStats);
    
    // Notify parent component
    if (onEmbryoUpdate) {
      onEmbryoUpdate(newEmbryos);
    }
  }, [cycleId, auditLog, onEmbryoUpdate]);

  // Add new embryo
  const addEmbryo = (embryoData) => {
    const newEmbryo = {
      id: Date.now(),
      ...embryoData,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      developmentHistory: [{
        date: new Date().toISOString(),
        stage: embryoData.day,
        grade: embryoData.grade,
        note: 'Embryo added to tracking system',
      }],
    };
    
    const newEmbryos = [...embryos, newEmbryo];
    const auditEntry = {
      id: Date.now(),
      action: 'CREATE',
      embryoId: newEmbryo.id,
      embryoName: newEmbryo.label,
      details: `Added new embryo ${newEmbryo.label}`,
      timestamp: new Date().toISOString(),
      user: 'Current User',
    };
    
    saveData(newEmbryos, auditEntry);
    setShowAddModal(false);
  };

  // Update embryo
  const updateEmbryo = (embryoId, updates) => {
    const updatedEmbryos = embryos.map(embryo => {
      if (embryo.id === embryoId) {
        const changes = [];
        Object.keys(updates).forEach(key => {
          if (embryo[key] !== updates[key]) {
            changes.push(`${key}: ${embryo[key]} → ${updates[key]}`);
          }
        });
        
        const auditEntry = {
          id: Date.now(),
          action: 'UPDATE',
          embryoId: embryo.id,
          embryoName: embryo.label,
          details: `Updated: ${changes.join(', ')}`,
          timestamp: new Date().toISOString(),
          user: 'Current User',
        };
        
        setAuditLog(prev => [auditEntry, ...prev]);
        
        return {
          ...embryo,
          ...updates,
          lastUpdated: new Date().toISOString(),
          developmentHistory: [
            ...embryo.developmentHistory,
            {
              date: new Date().toISOString(),
              stage: updates.day || embryo.day,
              grade: updates.grade || embryo.grade,
              note: updates.note || 'Embryo updated',
            },
          ],
        };
      }
      return embryo;
    });
    
    saveData(updatedEmbryos);
    setShowEditModal(false);
    setSelectedEmbryo(null);
  };

  // Delete embryo
  const deleteEmbryo = (embryoId) => {
    if (window.confirm('Are you sure you want to delete this embryo? This action cannot be undone.')) {
      const embryoToDelete = embryos.find(e => e.id === embryoId);
      const filteredEmbryos = embryos.filter(e => e.id !== embryoId);
      
      const auditEntry = {
        id: Date.now(),
        action: 'DELETE',
        embryoId: embryoId,
        embryoName: embryoToDelete?.label,
        details: `Deleted embryo ${embryoToDelete?.label}`,
        timestamp: new Date().toISOString(),
        user: 'Current User',
      };
      
      saveData(filteredEmbryos, auditEntry);
      setSelectedEmbryo(null);
    }
  };

  // Filter and sort embryos
  const getFilteredAndSortedEmbryos = () => {
    let filtered = [...embryos];
    
    if (filter !== 'all') {
      filtered = filtered.filter(e => e.status === filter);
    }
    
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === 'grade') {
        const gradeOrder = { 'AA': 7, 'AB': 6, 'BA': 5, 'BB': 4, 'BC': 3, 'CB': 2, 'CC': 1 };
        return (gradeOrder[b.grade] || 0) - (gradeOrder[a.grade] || 0);
      } else if (sortBy === 'day') {
        return b.day - a.day;
      }
      return 0;
    });
    
    return filtered;
  };

  // Add Modal Component
  const AddEmbryoModal = () => (
    <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>➕ Add New Embryo</h2>
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          addEmbryo({
            label: formData.get('label'),
            grade: formData.get('grade'),
            day: parseInt(formData.get('day')),
            status: formData.get('status'),
            notes: formData.get('notes'),
            quality: formData.get('quality'),
          });
        }}>
          <div className="form-group">
            <label>Embryo Label *</label>
            <input name="label" placeholder="e.g., Embryo A, #1, Lucky" required />
          </div>
          
          <div className="form-group">
            <label>Development Day *</label>
            <select name="day" required>
              <option value="">Select day</option>
              {STAGES.map(stage => (
                <option key={stage.day} value={stage.day}>
                  Day {stage.day} - {stage.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Grade</label>
            <select name="grade">
              <option value="">Select grade</option>
              {GRADE_OPTIONS.map(grade => (
                <option key={grade.value} value={grade.value}>
                  {grade.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Status</label>
            <select name="status" defaultValue="culturing">
              {STATUS_OPTIONS.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Quality Assessment</label>
            <select name="quality">
              <option value="">Select quality</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Notes</label>
            <textarea name="notes" rows="3" placeholder="Any additional notes about this embryo..." />
          </div>
          
          <div className="modal-buttons">
            <button type="button" onClick={() => setShowAddModal(false)}>Cancel</button>
            <button type="submit" className="primary">Add Embryo</button>
          </div>
        </form>
      </div>
    </div>
  );

  // Edit Modal Component
  const EditEmbryoModal = () => (
    <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>✏️ Edit Embryo</h2>
        {selectedEmbryo && (
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            updateEmbryo(selectedEmbryo.id, {
              grade: formData.get('grade'),
              day: parseInt(formData.get('day')),
              status: formData.get('status'),
              quality: formData.get('quality'),
              notes: formData.get('notes'),
            });
          }}>
            <div className="form-group">
              <label>Label</label>
              <input value={selectedEmbryo.label} disabled />
            </div>
            
            <div className="form-group">
              <label>Development Day</label>
              <select name="day" defaultValue={selectedEmbryo.day}>
                {STAGES.map(stage => (
                  <option key={stage.day} value={stage.day}>
                    Day {stage.day} - {stage.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Grade</label>
              <select name="grade" defaultValue={selectedEmbryo.grade || ''}>
                <option value="">Select grade</option>
                {GRADE_OPTIONS.map(grade => (
                  <option key={grade.value} value={grade.value}>
                    {grade.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Status</label>
              <select name="status" defaultValue={selectedEmbryo.status}>
                {STATUS_OPTIONS.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Quality</label>
              <select name="quality" defaultValue={selectedEmbryo.quality || ''}>
                <option value="">Select quality</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Notes</label>
              <textarea name="notes" rows="3" defaultValue={selectedEmbryo.notes || ''} />
            </div>
            
            <div className="modal-buttons">
              <button type="button" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button type="button" onClick={() => deleteEmbryo(selectedEmbryo.id)} className="danger">Delete</button>
              <button type="submit" className="primary">Save Changes</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );

  // Audit Log Modal
  const AuditModal = () => (
    <div className="modal-overlay" onClick={() => setShowAuditModal(false)}>
      <div className="modal-content large" onClick={e => e.stopPropagation()}>
        <h2>📋 Activity Log</h2>
        <div className="audit-list">
          {auditLog.slice(0, 50).map(log => (
            <div key={log.id} className="audit-item">
              <div className="audit-header">
                <span className={`audit-action ${log.action.toLowerCase()}`}>{log.action}</span>
                <span className="audit-time">{new Date(log.timestamp).toLocaleString()}</span>
              </div>
              <div className="audit-details">
                <strong>{log.embryoName}</strong>: {log.details}
              </div>
            </div>
          ))}
          {auditLog.length === 0 && (
            <p className="no-data">No activity logged yet</p>
          )}
        </div>
        <button onClick={() => setShowAuditModal(false)}>Close</button>
      </div>
    </div>
  );

  const filteredEmbryos = getFilteredAndSortedEmbryos();

  return (
    <div className="embryo-tracker">
      {/* Header Stats */}
      <div className="tracker-header">
        <h2>🔬 Embryo Tracker</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Embryos</span>
          </div>
          <div className="stat-card success">
            <span className="stat-value">{stats.transferReady}</span>
            <span className="stat-label">Transfer Ready</span>
          </div>
          <div className="stat-card info">
            <span className="stat-value">{stats.frozen}</span>
            <span className="stat-label">Frozen</span>
          </div>
          <div className="stat-card warning">
            <span className="stat-value">{stats.transferred}</span>
            <span className="stat-label">Transferred</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="tracker-controls">
        <div className="filter-group">
          <label>Filter:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Embryos</option>
            <option value="culturing">Culturing</option>
            <option value="transfer-ready">Transfer Ready</option>
            <option value="frozen">Frozen</option>
            <option value="transferred">Transferred</option>
            <option value="discarded">Discarded</option>
          </select>
        </div>
        
        <div className="sort-group">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="date">Date Added</option>
            <option value="grade">Grade</option>
            <option value="day">Development Day</option>
          </select>
        </div>
        
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          + Add Embryo
        </button>
        
        <button className="btn-secondary" onClick={() => setShowAuditModal(true)}>
          📋 View Activity Log
        </button>
      </div>

      {/* Embryos Grid */}
      <div className="embryos-grid">
        {filteredEmbryos.map(embryo => {
          const gradeInfo = GRADE_OPTIONS.find(g => g.value === embryo.grade);
          const stageInfo = STAGES.find(s => s.day === embryo.day);
          const statusInfo = STATUS_OPTIONS.find(s => s.value === embryo.status);
          
          return (
            <div key={embryo.id} className={`embryo-card ${embryo.status}`}>
              <div className="embryo-header">
                <div className="embryo-icon">
                  {stageInfo?.icon || '🧬'}
                </div>
                <div className="embryo-title">
                  <h3>{embryo.label}</h3>
                  <p>Day {embryo.day}: {stageInfo?.name || 'Developing'}</p>
                </div>
                <button 
                  className="edit-btn"
                  onClick={() => {
                    setSelectedEmbryo(embryo);
                    setShowEditModal(true);
                  }}
                >
                  ✏️
                </button>
              </div>
              
              <div className="embryo-body">
                {embryo.grade && (
                  <div className="grade-badge" style={{ background: gradeInfo?.color || '#9E9E9E' }}>
                    Grade {embryo.grade}
                  </div>
                )}
                
                <div className="status-badge" style={{ background: statusInfo?.color || '#9E9E9E' }}>
                  {statusInfo?.label || embryo.status}
                </div>
                
                {embryo.quality && (
                  <div className="quality-badge">
                    Quality: {embryo.quality}
                  </div>
                )}
                
                {embryo.notes && (
                  <p className="embryo-notes">{embryo.notes}</p>
                )}
                
                <div className="embryo-meta">
                  <small>Added: {new Date(embryo.createdAt).toLocaleDateString()}</small>
                  <small>Updated: {new Date(embryo.lastUpdated).toLocaleDateString()}</small>
                </div>
              </div>
              
              {/* Development Timeline */}
              {embryo.developmentHistory && embryo.developmentHistory.length > 1 && (
                <div className="development-timeline">
                  <details>
                    <summary>📊 Development History</summary>
                    {embryo.developmentHistory.slice(-5).reverse().map((event, idx) => (
                      <div key={idx} className="timeline-event">
                        <span className="event-date">
                          {new Date(event.date).toLocaleDateString()}
                        </span>
                        <span className="event-details">
                          Day {event.stage} | Grade {event.grade || 'N/A'}
                        </span>
                      </div>
                    ))}
                  </details>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {filteredEmbryos.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🔬</div>
          <h3>No embryos tracked yet</h3>
          <p>Click "Add Embryo" to start tracking your embryo development</p>
        </div>
      )}
      
      {/* Modals */}
      {showAddModal && <AddEmbryoModal />}
      {showEditModal && <EditEmbryoModal />}
      {showAuditModal && <AuditModal />}
    </div>
  );
}