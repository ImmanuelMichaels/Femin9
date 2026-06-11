import { useState, useEffect, useCallback } from 'react';
import {
  Calendar as CalendarIcon,
  Plus, Edit2, Trash2, Clock, MapPin,
  User, Phone, Stethoscope, Baby, Heart,
  ChevronLeft, ChevronRight, X, Bell, Loader2
} from 'lucide-react';
import { 
  getUserAppointments, 
  saveAppointment, 
  deleteAppointment,
  getUpcomingAppointments,
  getAppointmentsByDate
} from '../../services/appointmentService';
import { useApp } from '../../context/useApp';
import './Calendar.css';

// Appointment types based on user's journey - no hardcoded types, these are suggestions
const getAppointmentTypes = (journeyType) => {
  const baseTypes = [
    { id: 'gp', label: 'GP Appointment', icon: <User size={16} />, color: '#1976d2' },
    { id: 'nurse', label: 'Nurse', icon: <Stethoscope size={16} />, color: '#2e9e67' }
  ];
  
  switch(journeyType) {
    case 'pregnant':
      return [
        ...baseTypes,
        { id: 'midwife', label: 'Midwife', icon: <Baby size={16} />, color: '#d63a6e' },
        { id: 'antenatal', label: 'Antenatal Class', icon: <Heart size={16} />, color: '#e57c1a' },
        { id: 'scan', label: 'Ultrasound Scan', icon: <Heart size={16} />, color: '#7b1fa2' }
      ];
    case 'mom':
      return [
        ...baseTypes,
        { id: 'health_visitor', label: 'Health Visitor', icon: <Baby size={16} />, color: '#d63a6e' },
        { id: 'postnatal', label: 'Postnatal Check', icon: <Heart size={16} />, color: '#e57c1a' }
      ];
    case 'ivf':
      return [
        ...baseTypes,
        { id: 'fertility', label: 'Fertility Specialist', icon: <Heart size={16} />, color: '#7b1fa2' },
        { id: 'scan', label: 'Fertility Scan', icon: <Heart size={16} />, color: '#e57c1a' }
      ];
    case 'menopause':
      return [
        ...baseTypes,
        { id: 'menopause', label: 'Menopause Specialist', icon: <Heart size={16} />, color: '#7b1fa2' },
        { id: 'hrt', label: 'HRT Review', icon: <CalendarIcon size={16} />, color: '#e57c1a' }
      ];
    default:
      return baseTypes;
  }
};

export default function Calendar() {
  const { journeyType } = useApp();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [syncing, setSyncing] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    duration: 30,
    location: '',
    providerName: '',
    providerPhone: '',
    notes: '',
    reminders: true
  });
  
  const appointmentTypes = getAppointmentTypes(journeyType);
  
  // Load appointments from Firestore
  const loadAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUserAppointments();
      setAppointments(data);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);
  
  // Get appointments for a specific date
  const getAppointmentsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments
      .filter(apt => apt.date === dateStr)
      .sort((a, b) => a.time.localeCompare(b.time));
  };
  
  // Get upcoming appointments (next 30 days)
  const getUpcomingAppointmentsList = () => {
    const today = new Date().toISOString().split('T')[0];
    return appointments
      .filter(apt => apt.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 10);
  };
  
  // Handle form submit - saves to Firestore
  const handleSubmit = async () => {
    setSyncing(true);
    try {
      const saved = await saveAppointment(formData);
      if (editingAppointment) {
        setAppointments(prev => prev.map(apt => 
          apt.id === editingAppointment.id ? saved : apt
        ));
      } else {
        setAppointments(prev => [...prev, saved]);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving appointment:', error);
      alert('Failed to save appointment. Please try again.');
    } finally {
      setSyncing(false);
    }
  };
  
  // Handle edit
  const handleEdit = (appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      title: appointment.title || '',
      type: appointment.type || '',
      date: appointment.date,
      time: appointment.time,
      duration: appointment.duration || 30,
      location: appointment.location || '',
      providerName: appointment.providerName || '',
      providerPhone: appointment.providerPhone || '',
      notes: appointment.notes || '',
      reminders: appointment.reminders !== false
    });
    setShowModal(true);
  };
  
  // Handle delete - removes from Firestore
  const handleDelete = async (appointment) => {
    if (confirm(`Delete appointment on ${appointment.date} at ${appointment.time}?`)) {
      setSyncing(true);
      try {
        await deleteAppointment(appointment.id);
        setAppointments(prev => prev.filter(apt => apt.id !== appointment.id));
      } catch (error) {
        console.error('Error deleting appointment:', error);
        alert('Failed to delete appointment. Please try again.');
      } finally {
        setSyncing(false);
      }
    }
  };
  
  // Reset form
  const resetForm = () => {
    setShowModal(false);
    setEditingAppointment(null);
    setFormData({
      title: '',
      type: appointmentTypes[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      duration: 30,
      location: '',
      providerName: '',
      providerPhone: '',
      notes: '',
      reminders: true
    });
  };
  
  // Calendar navigation
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };
  
  // Calendar rendering
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    const prevMonthDays = firstDay.getDay();
    for (let i = prevMonthDays - 1; i >= 0; i--) {
      days.push({ date: new Date(year, month, -i), isCurrentMonth: false });
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    
    return days;
  };
  
  const days = getDaysInMonth(currentMonth);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingAppointments = getUpcomingAppointmentsList();
  
  if (loading) {
    return (
      <div className="calendar-loading">
        <Loader2 size={32} className="calendar-spinner" />
        <p>Loading your appointments...</p>
      </div>
    );
  }
  
  return (
    <div className="calendar-root">
      {/* Header */}
      <div className="calendar-header">
        <h2 className="calendar-title">📅 Appointments</h2>
        <button className="calendar-add-btn" onClick={() => setShowModal(true)} disabled={syncing}>
          <Plus size={18} /> New Appointment
        </button>
      </div>
      
      {/* Upcoming Appointments Section */}
      {upcomingAppointments.length > 0 && (
        <div className="calendar-upcoming">
          <h3 className="calendar-section-title">📋 Upcoming Appointments</h3>
          <div className="calendar-upcoming-list">
            {upcomingAppointments.map(apt => {
              const aptType = appointmentTypes.find(t => t.id === apt.type) || appointmentTypes[0];
              const aptDate = new Date(apt.date);
              const isToday = apt.date === todayStr;
              
              return (
                <div key={apt.id} className="calendar-upcoming-card" style={{ borderLeftColor: aptType?.color || '#7C5CBF' }}>
                  <div className="calendar-upcoming-date">
                    <span className="calendar-upcoming-day">{aptDate.getDate()}</span>
                    <span className="calendar-upcoming-month">{aptDate.toLocaleString('default', { month: 'short' })}</span>
                  </div>
                  <div className="calendar-upcoming-details">
                    <div className="calendar-upcoming-title">
                      {aptType?.icon}
                      <span>{apt.title || aptType?.label || 'Appointment'}</span>
                      {isToday && <span className="calendar-today-badge">Today</span>}
                    </div>
                    <div className="calendar-upcoming-time">
                      <Clock size={14} /> {apt.time} • {apt.duration} min
                    </div>
                    {apt.location && (
                      <div className="calendar-upcoming-location">
                        <MapPin size={14} /> {apt.location}
                      </div>
                    )}
                  </div>
                  <div className="calendar-upcoming-actions">
                    <button onClick={() => handleEdit(apt)} className="calendar-edit-btn">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(apt)} className="calendar-delete-btn">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Calendar Grid */}
      <div className="calendar-grid-container">
        <div className="calendar-month-nav">
          <button onClick={prevMonth} className="calendar-nav-btn">
            <ChevronLeft size={20} />
          </button>
          <h3 className="calendar-month-title">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <button onClick={nextMonth} className="calendar-nav-btn">
            <ChevronRight size={20} />
          </button>
        </div>
        
        <div className="calendar-weekdays">
          {weekdayNames.map(day => (
            <div key={day} className="calendar-weekday">{day}</div>
          ))}
        </div>
        
        <div className="calendar-days">
          {days.map((day, index) => {
            const dateStr = day.date.toISOString().split('T')[0];
            const dayAppointments = getAppointmentsForDate(day.date);
            const isSelected = selectedDate && dateStr === selectedDate.toISOString().split('T')[0];
            const isToday = dateStr === todayStr;
            
            return (
              <div
                key={index}
                className={`calendar-day ${!day.isCurrentMonth ? 'calendar-day-other' : ''} ${isSelected ? 'calendar-day-selected' : ''}`}
                onClick={() => setSelectedDate(day.date)}
              >
                <div className={`calendar-day-number ${isToday ? 'calendar-day-today' : ''}`}>
                  {day.date.getDate()}
                </div>
                <div className="calendar-day-appointments">
                  {dayAppointments.slice(0, 3).map(apt => {
                    const aptType = appointmentTypes.find(t => t.id === apt.type) || appointmentTypes[0];
                    return (
                      <div
                        key={apt.id}
                        className="calendar-day-dot"
                        style={{ background: aptType?.color || '#7C5CBF' }}
                        title={apt.title || aptType?.label}
                      />
                    );
                  })}
                  {dayAppointments.length > 3 && (
                    <div className="calendar-day-more">+{dayAppointments.length - 3}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Selected Date Appointments */}
      {selectedDate && (
        <div className="calendar-selected-date">
          <h3 className="calendar-section-title">
            📍 {selectedDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h3>
          <div className="calendar-appointments-list">
            {getAppointmentsForDate(selectedDate).map(apt => {
              const aptType = appointmentTypes.find(t => t.id === apt.type) || appointmentTypes[0];
              return (
                <div key={apt.id} className="calendar-appointment-card" style={{ background: `${aptType?.color}10`, borderLeftColor: aptType?.color || '#7C5CBF' }}>
                  <div className="calendar-appointment-time">
                    <Clock size={16} /> {apt.time} ({apt.duration} min)
                  </div>
                  <div className="calendar-appointment-content">
                    <div className="calendar-appointment-type" style={{ color: aptType?.color || '#7C5CBF' }}>
                      {aptType?.icon} {apt.title || aptType?.label}
                    </div>
                    {apt.providerName && (
                      <div className="calendar-appointment-provider">
                        <User size={14} /> {apt.providerName}
                      </div>
                    )}
                    {apt.location && (
                      <div className="calendar-appointment-location">
                        <MapPin size={14} /> {apt.location}
                      </div>
                    )}
                    {apt.providerPhone && (
                      <div className="calendar-appointment-phone">
                        <Phone size={14} /> {apt.providerPhone}
                      </div>
                    )}
                    {apt.notes && (
                      <div className="calendar-appointment-notes">
                        📝 {apt.notes}
                      </div>
                    )}
                  </div>
                  <div className="calendar-appointment-actions">
                    <button onClick={() => handleEdit(apt)} className="calendar-edit-btn">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(apt)} className="calendar-delete-btn">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
            {getAppointmentsForDate(selectedDate).length === 0 && (
              <div className="calendar-no-appointments">
                <p>No appointments scheduled for this date</p>
                <button onClick={() => {
                  setFormData(prev => ({ ...prev, date: selectedDate.toISOString().split('T')[0] }));
                  setShowModal(true);
                }} className="calendar-add-small">
                  + Add Appointment
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Add/Edit Modal */}
      {showModal && (
        <div className="calendar-modal-overlay" onClick={resetForm}>
          <div className="calendar-modal" onClick={e => e.stopPropagation()}>
            <div className="calendar-modal-header">
              <h3>{editingAppointment ? 'Edit Appointment' : 'New Appointment'}</h3>
              <button onClick={resetForm} className="calendar-modal-close">
                <X size={20} />
              </button>
            </div>
            
            <div className="calendar-modal-body">
              <div className="calendar-form-group">
                <label>Appointment Type *</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                  required
                >
                  <option value="">Select type...</option>
                  {appointmentTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="calendar-form-group">
                <label>Title (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., 20-week scan, Annual checkup"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              
              <div className="calendar-form-row">
                <div className="calendar-form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="calendar-form-group">
                  <label>Time *</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                    required
                  />
                </div>
                <div className="calendar-form-group">
                  <label>Duration (min)</label>
                  <select
                    value={formData.duration}
                    onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  >
                    <option value={15}>15 min</option>
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>
              </div>
              
              <div className="calendar-form-row">
                <div className="calendar-form-group">
                  <label>Provider Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Dr. Smith, Midwife Sarah"
                    value={formData.providerName}
                    onChange={e => setFormData({ ...formData, providerName: e.target.value })}
                  />
                </div>
                <div className="calendar-form-group">
                  <label>Provider Phone</label>
                  <input
                    type="tel"
                    placeholder="Clinic phone number"
                    value={formData.providerPhone}
                    onChange={e => setFormData({ ...formData, providerPhone: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="calendar-form-group">
                <label>Location / Address</label>
                <input
                  type="text"
                  placeholder="Clinic name and address"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              
              <div className="calendar-form-group">
                <label>Notes / Preparation</label>
                <textarea
                  rows="3"
                  placeholder="e.g., Bring urine sample, Drink 1L water before scan, Fasting required..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </div>
            
            <div className="calendar-modal-footer">
              <button onClick={resetForm} className="calendar-cancel-btn">
                Cancel
              </button>
              <button 
                onClick={handleSubmit} 
                className="calendar-save-btn"
                disabled={syncing || !formData.type || !formData.date || !formData.time}
              >
                {syncing ? <Loader2 size={16} className="calendar-spinner" /> : (editingAppointment ? 'Update' : 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Sync indicator */}
      {syncing && (
        <div className="calendar-syncing">
          <Loader2 size={16} className="calendar-spinner" />
          <span>Saving...</span>
        </div>
      )}
    </div>
  );
}