import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, CheckCircle2, X, Search, Filter, Plus } from 'lucide-react';

/**
 * Client Portal component for self-service booking
 * Clients can view and book available time slots
 */
export const ClientPortal = ({
  showPortal,
  setShowPortal,
  crews,
  schedule,
  onBookingRequest,
  companyName = 'SafeMaster',
  companyLogo = null
}) => {
  const [selectedCrew, setSelectedCrew] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [clientInfo, setClientInfo] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    notes: ''
  });
  const [step, setStep] = useState(1); // 1=service, 2=crew, 3=time, 4=details, 5=confirm
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  // Service options (could be loaded from API)
  const services = [
    { id: 'height-safety', name: 'Height Safety Inspection', duration: 120, cost: 250, description: 'Comprehensive height safety inspection and certification' },
    { id: 'anchor-testing', name: 'Anchor Point Testing', duration: 90, cost: 200, description: 'Testing and certification of anchor points' },
    { id: 'static-line', name: 'Static Line Certification', duration: 60, cost: 150, description: 'Static line installation and certification' },
    { id: 'ewp-hire', name: 'EWP Hire with Operator', duration: 240, cost: 400, description: 'Elevating Work Platform hire with certified operator' },
    { id: 'rope-access', name: 'Rope Access Work', duration: 180, cost: 350, description: 'IRATA certified rope access services' },
    { id: 'confined-space', name: 'Confined Space Entry', duration: 120, cost: 300, description: 'Confined space entry and rescue certification' }
  ];

  // Get available crews for a service
  const getAvailableCrews = (service) => {
    if (!service) return crews;
    
    // Filter crews by required ticket
    const requiredTicket = getRequiredTicket(service.id);
    return crews.filter(crew => crew.tickets.includes(requiredTicket));
  };

  // Get required ticket for a service
  const getRequiredTicket = (serviceId) => {
    const ticketMap = {
      'height-safety': 'WAH',
      'anchor-testing': 'WAH',
      'static-line': 'WAH',
      'ewp-hire': 'EWP',
      'rope-access': 'ROPE',
      'confined-space': 'CSE'
    };
    return ticketMap[serviceId] || 'WAH';
  };

  // Get available time slots for a crew on a date
  const getAvailableTimeSlots = (crewId, date) => {
    if (!crewId || !date) return [];
    
    const crew = crews.find(c => c.id === crewId);
    if (!crew) return [];
    
    const workingHours = crew.workingHours || { start: '08:00', end: '17:00' };
    const [startHour, startMin] = workingHours.start.split(':').map(Number);
    const [endHour, endMin] = workingHours.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;
    const slotDuration = 30; // 30 minute slots
    
    // Get booked slots for this crew on this date
    const bookedSlots = schedule
      .filter(job => job.crewId === crewId && job.day === date)
      .map(job => {
        const [startH, startM] = (job.startTime || '09:00').split(':').map(Number);
        const [endH, endM] = (job.endTime || '17:00').split(':').map(Number);
        return {
          start: startH * 60 + startM,
          end: endH * 60 + endM
        };
      });
    
    const slots = [];
    for (let mins = startTime; mins + slotDuration <= endTime; mins += slotDuration) {
      const conflicts = bookedSlots.filter(slot => mins < slot.end && mins + slotDuration > slot.start);
      if (conflicts.length === 0) {
        slots.push({
          start: `${Math.floor(mins / 60).toString().padStart(2, '0')}:${(mins % 60).toString().padStart(2, '0')}`,
          end: `${Math.floor((mins + slotDuration) / 60).toString().padStart(2, '0')}:${((mins + slotDuration) % 60).toString().padStart(2, '0')}`,
          startMinutes: mins,
          endMinutes: mins + slotDuration
        });
      }
    }
    
    return slots;
  };

  // Handle service selection
  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setSelectedCrew(null);
    setSelectedDate(null);
    setStep(2);
  };

  // Handle crew selection
  const handleCrewSelect = (crew) => {
    setSelectedCrew(crew);
    setSelectedDate(null);
    setStep(3);
  };

  // Handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    const slots = getAvailableTimeSlots(selectedCrew.id, date);
    setAvailableSlots(slots);
    setStep(4);
  };

  // Handle slot selection
  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setStep(5);
  };

  // Handle client info change
  const handleClientInfoChange = (field, value) => {
    setClientInfo(prev => ({ ...prev, [field]: value }));
  };

  // Handle submission
  const handleSubmit = async () => {
    if (!selectedService || !selectedCrew || !selectedDate || !selectedSlot) {
      setSubmitError('Please complete all steps');
      return;
    }
    
    if (!clientInfo.name || !clientInfo.email) {
      setSubmitError('Please provide your name and email');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const booking = {
        service: selectedService,
        crew: selectedCrew,
        date: selectedDate,
        time: selectedSlot,
        client: clientInfo,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      await onBookingRequest(booking);
      
      setSubmitSuccess(true);
      setTimeout(() => {
        setShowPortal(false);
        resetForm();
      }, 3000);
      
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setStep(1);
    setSelectedService(null);
    setSelectedCrew(null);
    setSelectedDate(null);
    setSelectedSlot(null);
    setClientInfo({ name: '', email: '', phone: '', company: '', notes: '' });
    setAvailableSlots([]);
    setSubmitError(null);
    setSubmitSuccess(null);
  };

  // Handle cancel
  const handleCancel = () => {
    setShowPortal(false);
    resetForm();
  };

  // Handle back
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  if (!showPortal) return null;

  // Generate date options (next 30 days)
  const dateOptions = [];
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dateOptions.push({
      date: date.toISOString().split('T')[0],
      dayName: date.toLocaleDateString('en-AU', { weekday: 'long' }),
      dayShort: date.toLocaleDateString('en-AU', { weekday: 'short' }),
      dateDisplay: date.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })
    });
  }

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center sticky top-0">
          <div className="flex items-center gap-3">
            {companyLogo ? (
              <img src={companyLogo} alt={companyName} className="h-8 w-8 rounded" />
            ) : (
              <div className="p-2 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg">
                <span className="text-slate-950 font-bold text-sm">{companyName.slice(0, 2)}</span>
              </div>
            )}
            <div>
              <h3 className="text-white font-semibold">{companyName} Client Portal</h3>
              <p className="text-xs text-slate-400">Self-service booking for height safety services</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={handleCancel}
            className="text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6">
          
          {/* Progress Steps */}
          <div className="flex justify-between items-center mb-6">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  step >= s 
                    ? 'bg-teal-500 text-slate-950' 
                    : 'bg-slate-800 text-slate-500'
                }`}>
                  {step > s ? <Check className="h-4 w-4" /> : s}
                </div>
                {s < 5 && (
                  <div className={`w-12 sm:w-20 h-1 mx-1 rounded-full ${
                    step > s ? 'bg-teal-500' : 'bg-slate-800'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Select Service */}
          {step === 1 && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-white">Select a Service</h4>
              <p className="text-xs text-slate-400">Choose the type of service you need</p>
              
              <div className="grid gap-3">
                {services.map(service => (
                  <button
                    key={service.id}
                    onClick={() => handleServiceSelect(service)}
                    className={`p-4 rounded-lg border border-slate-800 text-left transition-all ${
                      selectedService?.id === service.id
                        ? 'bg-teal-500/10 border-teal-700 ring-2 ring-teal-500'
                        : 'bg-slate-900/50 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="text-sm font-semibold text-white">{service.name}</h5>
                        <p className="text-xs text-slate-400 mt-1">{service.description}</p>
                        <div className="flex gap-3 mt-2">
                          <span className="text-xs text-slate-500">
                            <Clock className="h-3 w-3 inline mr-0.5" />
                            {service.duration} min
                          </span>
                          <span className="text-xs text-emerald-400">
                            <span className="text-slate-400">$</span>{service.cost}
                          </span>
                        </div>
                      </div>
                      {selectedService?.id === service.id && (
                        <CheckCircle2 className="h-5 w-5 text-teal-500" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Select Crew */}
          {step === 2 && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-white">Select a Certified Inspector</h4>
              <p className="text-xs text-slate-400">
                Choose from our certified height safety inspectors
              </p>
              
              <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800">
                <p className="text-xs text-slate-400 mb-1">Required Certification</p>
                <span className="text-xs bg-teal-500/10 text-teal-400 px-2 py-1 rounded">
                  {getRequiredTicket(selectedService?.id) || 'WAH'}
                </span>
              </div>
              
              <div className="grid gap-3">
                {getAvailableCrews(selectedService).map(crew => (
                  <button
                    key={crew.id}
                    onClick={() => handleCrewSelect(crew)}
                    className={`p-4 rounded-lg border border-slate-800 text-left transition-all ${
                      selectedCrew?.id === crew.id
                        ? 'bg-teal-500/10 border-teal-700 ring-2 ring-teal-500'
                        : 'bg-slate-900/50 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="text-sm font-semibold text-white">{crew.name}</h5>
                        <p className="text-xs text-slate-400 mt-1">{crew.baseLocation}</p>
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {crew.tickets.map(ticket => (
                            <span 
                              key={ticket} 
                              className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded"
                            >
                              {ticket}
                            </span>
                          ))}
                        </div>
                      </div>
                      {selectedCrew?.id === crew.id && (
                        <CheckCircle2 className="h-5 w-5 text-teal-500" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-between gap-2 pt-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-lg transition-all"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Select Date */}
          {step === 3 && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-white">Select a Date</h4>
              <p className="text-xs text-slate-400">
                Choose an available date for {selectedCrew?.name}
              </p>
              
              <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800">
                <p className="text-xs text-slate-400 mb-1">Working Hours</p>
                <p className="text-xs text-slate-300">
                  {selectedCrew?.workingHours?.start || '08:00'} - {selectedCrew?.workingHours?.end || '17:00'}
                </p>
              </div>
              
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {dateOptions.map(dateOption => {
                  const hasAvailability = true; // In real app, check availability
                  const isSelected = selectedDate === dateOption.date;
                  
                  return (
                    <button
                      key={dateOption.date}
                      onClick={() => handleDateSelect(dateOption.date)}
                      disabled={!hasAvailability}
                      className={`p-2 rounded-lg border text-xs transition-all ${
                        isSelected
                          ? 'bg-teal-500 text-slate-950 border-teal-700'
                          : hasAvailability
                            ? 'bg-slate-900/50 text-slate-300 border-slate-800 hover:bg-slate-800/50'
                            : 'bg-slate-950 text-slate-600 border-slate-900 cursor-not-allowed'
                      }`}
                    >
                      <div className="text-center">
                        <div className="font-semibold">{dateOption.dayShort}</div>
                        <div className="text-slate-400">{dateOption.dateDisplay}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between gap-2 pt-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-lg transition-all"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Select Time Slot */}
          {step === 4 && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-white">Select a Time Slot</h4>
              <p className="text-xs text-slate-400">
                Available time slots for {selectedCrew?.name} on {selectedDate}
              </p>
              
              {availableSlots.length === 0 ? (
                <div className="p-4 bg-amber-900/20 border border-amber-700 rounded-lg text-center">
                  <p className="text-sm text-amber-300">No available time slots</p>
                  <p className="text-xs text-amber-400 mt-1">
                    {selectedCrew?.name} is fully booked on this date
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {availableSlots.map(slot => {
                    const isSelected = selectedSlot?.start === slot.start;
                    return (
                      <button
                        key={slot.start}
                        onClick={() => handleSlotSelect(slot)}
                        className={`p-2 rounded-lg border text-xs transition-all ${
                          isSelected
                            ? 'bg-teal-500 text-slate-950 border-teal-700'
                            : 'bg-slate-900/50 text-slate-300 border-slate-800 hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="text-center">
                          <div className="font-semibold">{slot.start}</div>
                          <div className="text-slate-400">to {slot.end}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="flex justify-between gap-2 pt-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-lg transition-all"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Enter Details & Confirm */}
          {step === 5 && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-white">Your Details</h4>
              <p className="text-xs text-slate-400">
                Please provide your contact information
              </p>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={clientInfo.name}
                    onChange={(e) => handleClientInfoChange('name', e.target.value)}
                    placeholder="John Smith"
                    required
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={clientInfo.email}
                    onChange={(e) => handleClientInfoChange('email', e.target.value)}
                    placeholder="john@company.com"
                    required
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={clientInfo.phone}
                    onChange={(e) => handleClientInfoChange('phone', e.target.value)}
                    placeholder="0412 345 678"
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    value={clientInfo.company}
                    onChange={(e) => handleClientInfoChange('company', e.target.value)}
                    placeholder="Your Company Name"
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">
                    Special Requirements
                  </label>
                  <textarea
                    value={clientInfo.notes}
                    onChange={(e) => handleClientInfoChange('notes', e.target.value)}
                    placeholder="Any special requirements or notes..."
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>
              </div>

              {/* Booking Summary */}
              <div className="p-4 bg-slate-950/50 rounded-lg border border-slate-800">
                <h5 className="text-xs font-semibold text-white mb-3">Booking Summary</h5>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Service:</span>
                    <span className="text-slate-200">{selectedService?.name}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Inspector:</span>
                    <span className="text-slate-200">{selectedCrew?.name}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Date:</span>
                    <span className="text-slate-200">{selectedDate}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Time:</span>
                    <span className="text-slate-200">{selectedSlot?.start} - {selectedSlot?.end}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Duration:</span>
                    <span className="text-slate-200">{selectedService?.duration} minutes</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Cost:</span>
                    <span className="text-slate-200">${selectedService?.cost}</span>
                  </div>
                </div>
              </div>

              {/* Status Messages */}
              {submitError && (
                <div className="p-3 bg-rose-900/20 border border-rose-700 rounded-lg">
                  <p className="text-xs text-rose-400">{submitError}</p>
                </div>
              )}
              
              {submitSuccess && (
                <div className="p-3 bg-emerald-900/20 border border-emerald-700 rounded-lg">
                  <p className="text-xs text-emerald-400">Booking request submitted successfully!</p>
                  <p className="text-xs text-emerald-400 mt-1">
                    We'll contact you shortly to confirm your booking.
                  </p>
                </div>
              )}

              <div className="flex justify-between gap-2 pt-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-lg transition-all"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Submit Booking Request
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Client Portal Entry Point (for embedding in your website)
export const ClientPortalEntry = ({
  companyName,
  companyLogo,
  crews,
  schedule,
  onBookingRequest
}) => {
  const [showPortal, setShowPortal] = useState(false);

  return (
    <div className="bg-slate-900 rounded-lg p-6 text-center">
      <h3 className="text-white font-semibold mb-2">{companyName} Booking Portal</h3>
      <p className="text-slate-400 text-sm mb-4">
        Book your height safety inspections online
      </p>
      <button
        onClick={() => setShowPortal(true)}
        className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-lg transition-all flex items-center gap-2 mx-auto"
      >
        <Calendar className="h-4 w-4" />
        Book Now
      </button>
      
      <ClientPortal
        showPortal={showPortal}
        setShowPortal={setShowPortal}
        crews={crews}
        schedule={schedule}
        onBookingRequest={onBookingRequest}
        companyName={companyName}
        companyLogo={companyLogo}
      />
    </div>
  );
};

export default ClientPortal;
