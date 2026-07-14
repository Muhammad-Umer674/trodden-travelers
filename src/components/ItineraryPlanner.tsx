import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DESTINATIONS, PRESET_ITINERARIES, SERVICES } from '../data';
import { BookingFormState, PresetItinerary } from '../types';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, doc, getDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { 
  Compass, 
  Calendar, 
  Users, 
  MapPin, 
  ChevronRight, 
  Sparkles, 
  Send, 
  CheckCircle, 
  Clock, 
  BedDouble, 
  Plane, 
  Car,
  FileText,
  CloudLightning,
  RefreshCw,
  Search,
  Database
} from 'lucide-react';

interface ItineraryPlannerProps {
  initialDestinationId: string | null;
}

export default function ItineraryPlanner({ initialDestinationId }: ItineraryPlannerProps) {
  const [formData, setFormData] = useState<BookingFormState>({
    fullName: '',
    email: '',
    phone: '',
    serviceId: SERVICES[3].id, // Default to Customized Trip
    destinations: initialDestinationId ? [initialDestinationId] : [DESTINATIONS[0].id],
    durationDays: 5,
    travelers: 2,
    accommodationType: 'Deluxe',
    travelMode: 'Coaster/Car',
    startDate: '',
    specialRequests: '',
  });

  const [activeStep, setActiveStep] = useState<number>(1);
  const [currentItinerary, setCurrentItinerary] = useState<PresetItinerary | null>(null);
  const [customDays, setCustomDays] = useState<{ day: number; title: string; description: string }[]>([]);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Firestore Saved Itineraries states
  const [savedPlans, setSavedPlans] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [searchEmail, setSearchEmail] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Instant Cloud Backup States
  const [showBackupEmailForm, setShowBackupEmailForm] = useState<boolean>(false);
  const [backupNameInput, setBackupNameInput] = useState<string>('');
  const [backupEmailInput, setBackupEmailInput] = useState<string>('');
  const [isBackupSuccess, setIsBackupSuccess] = useState<boolean>(false);

  const loadSavedPlans = async () => {
    try {
      const localIdsString = localStorage.getItem('tt_booking_ids');
      const localIds = localIdsString ? JSON.parse(localIdsString) : [];
      if (localIds.length === 0) {
        setSavedPlans([]);
        return;
      }

      const fetched: any[] = [];
      for (const id of localIds) {
        if (!id) continue;
        try {
          const docRef = doc(db, 'bookings', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            fetched.push({ id: docSnap.id, ...docSnap.data() });
          }
        } catch (e) {
          console.warn("Could not load single doc:", id, e);
        }
      }
      setSavedPlans(fetched);
    } catch (error) {
      console.error("Error loading saved plans:", error);
      try {
        handleFirestoreError(error, OperationType.LIST, "bookings");
      } catch (e) {}
    }
  };

  const handleSearchByEmail = async (emailToSearch: string) => {
    if (!emailToSearch) return;
    setIsSearching(true);
    try {
      const q = query(
        collection(db, 'bookings'),
        where('email', '==', emailToSearch.trim().toLowerCase())
      );
      const querySnapshot = await getDocs(q);
      const fetched: any[] = [];
      querySnapshot.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() });
      });
      setSavedPlans(fetched);
      
      // Merge into local storage so they persist on refresh
      const localIdsString = localStorage.getItem('tt_booking_ids');
      const localIds = localIdsString ? JSON.parse(localIdsString) : [];
      const newIds = Array.from(new Set([...localIds, ...fetched.map(f => f.id)]));
      localStorage.setItem('tt_booking_ids', JSON.stringify(newIds));
    } catch (error) {
      console.error("Error searching bookings by email:", error);
      try {
        handleFirestoreError(error, OperationType.LIST, "bookings");
      } catch (e) {}
    } finally {
      setIsSearching(false);
    }
  };

  const handleInstantBackup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const finalName = formData.fullName || backupNameInput;
    const finalEmail = formData.email || backupEmailInput;

    if (!finalName || !finalEmail) {
      setShowBackupEmailForm(true);
      return;
    }

    setIsSaving(true);
    try {
      const docRef = await addDoc(collection(db, "bookings"), {
        fullName: finalName,
        email: finalEmail.trim().toLowerCase(),
        phone: formData.phone || 'Draft Mode',
        serviceId: formData.serviceId,
        destinations: formData.destinations,
        durationDays: formData.durationDays,
        travelers: formData.travelers,
        accommodationType: formData.accommodationType,
        travelMode: formData.travelMode,
        startDate: formData.startDate || 'Draft Itinerary',
        specialRequests: formData.specialRequests || 'Draft itinerary saved via instant backup',
        customDays,
        createdAt: serverTimestamp()
      });

      // Save ID to local storage for quick retrieval
      const localIdsString = localStorage.getItem('tt_booking_ids');
      const localIds = localIdsString ? JSON.parse(localIdsString) : [];
      if (!localIds.includes(docRef.id)) {
        localIds.push(docRef.id);
        localStorage.setItem('tt_booking_ids', JSON.stringify(localIds));
      }

      // Update form state if details were entered in the mini form
      setFormData(prev => ({
        ...prev,
        fullName: finalName,
        email: finalEmail
      }));

      setIsBackupSuccess(true);
      setShowBackupEmailForm(false);
      setBackupNameInput('');
      setBackupEmailInput('');
      
      setTimeout(() => {
        setIsBackupSuccess(false);
      }, 4000);

      await loadSavedPlans();
    } catch (err) {
      console.error("Instant backup failed:", err);
      handleFirestoreError(err, OperationType.WRITE, "bookings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadPlan = (plan: any) => {
    setFormData({
      fullName: plan.fullName || '',
      email: plan.email || '',
      phone: plan.phone || '',
      serviceId: plan.serviceId || SERVICES[3].id,
      destinations: plan.destinations || [],
      durationDays: plan.durationDays || 5,
      travelers: plan.travelers || 2,
      accommodationType: plan.accommodationType || 'Deluxe',
      travelMode: plan.travelMode || 'Coaster/Car',
      startDate: plan.startDate || '',
      specialRequests: plan.specialRequests || '',
    });
    if (plan.customDays) {
      setCustomDays(plan.customDays);
    }
    // Set step to preference setup and scroll
    setActiveStep(1);
    document.getElementById('itinerary-planner-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load saved plans on component mount
  useEffect(() => {
    loadSavedPlans();
  }, []);

  // Sync destination prop change to form selection
  useEffect(() => {
    if (initialDestinationId) {
      setFormData(prev => ({
        ...prev,
        destinations: [initialDestinationId]
      }));
    }
  }, [initialDestinationId]);

  // Update itinerary template when destination or days change
  useEffect(() => {
    const mainDestId = formData.destinations[0];
    const preset = PRESET_ITINERARIES.find(it => it.destinationId === mainDestId);
    
    if (preset) {
      setCurrentItinerary(preset);
      // Slice or stretch days based on chosen duration
      const adjustedDays = Array.from({ length: formData.durationDays }, (_, index) => {
        const dayNum = index + 1;
        const matchingPresetDay = preset.days.find(d => d.day === dayNum);
        
        if (matchingPresetDay) {
          return {
            day: dayNum,
            title: matchingPresetDay.title,
            description: matchingPresetDay.description
          };
        } else {
          // If custom duration exceeds preset days, generate realistic followups
          return {
            day: dayNum,
            title: `Explore neighboring spots in ${DESTINATIONS.find(d => d.id === mainDestId)?.name || 'Valley'}`,
            description: `Leisure day for customized local shopping, culinary exploration, photography, and high-altitude relaxation.`
          };
        }
      });
      setCustomDays(adjustedDays);
    }
  }, [formData.destinations, formData.durationDays]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDestinationToggle = (destId: string) => {
    setFormData(prev => {
      const alreadySelected = prev.destinations.includes(destId);
      let updated: string[];
      if (alreadySelected) {
        // Keep at least one destination
        updated = prev.destinations.length > 1 
          ? prev.destinations.filter(id => id !== destId) 
          : prev.destinations;
      } else {
        updated = [...prev.destinations, destId];
      }
      return { ...prev, destinations: updated };
    });
  };

  const handleDayTitleChange = (index: number, newTitle: string) => {
    setCustomDays(prev => {
      const copy = [...prev];
      copy[index].title = newTitle;
      return copy;
    });
  };

  const handleDayDescChange = (index: number, newDesc: string) => {
    setCustomDays(prev => {
      const copy = [...prev];
      copy[index].description = newDesc;
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Perform standard booking validation
    if (!formData.fullName || !formData.phone || !formData.startDate) {
      alert("Please fill in your Full Name, Phone Number, and Start Date to book.");
      return;
    }

    setIsSaving(true);
    try {
      // Save to Firestore first
      const docRef = await addDoc(collection(db, "bookings"), {
        fullName: formData.fullName,
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone,
        serviceId: formData.serviceId,
        destinations: formData.destinations,
        durationDays: formData.durationDays,
        travelers: formData.travelers,
        accommodationType: formData.accommodationType,
        travelMode: formData.travelMode,
        startDate: formData.startDate,
        specialRequests: formData.specialRequests,
        customDays,
        createdAt: serverTimestamp()
      });

      // Save ID to local storage for quick retrieval
      const localIdsString = localStorage.getItem('tt_booking_ids');
      const localIds = localIdsString ? JSON.parse(localIdsString) : [];
      if (!localIds.includes(docRef.id)) {
        localIds.push(docRef.id);
        localStorage.setItem('tt_booking_ids', JSON.stringify(localIds));
      }

      // Reload saved plans list
      await loadSavedPlans();
    } catch (err) {
      console.error("Failed to save booking to Firestore:", err);
      handleFirestoreError(err, OperationType.WRITE, "bookings");
    } finally {
      setIsSaving(false);
    }

    // Prepare WhatsApp Message Link
    const whatsAppNumber = '03224704286';
    const cleanNumber = whatsAppNumber.replace(/\D/g, ''); // 03224704286

    const selectedService = SERVICES.find(s => s.id === formData.serviceId)?.title || 'Customized Plan';
    const selectedDestNames = formData.destinations
      .map(id => DESTINATIONS.find(d => d.id === id)?.name || id)
      .join(', ');

    // Compile customized Day-by-Day itinerary markdown text for WhatsApp
    const dayByDayText = customDays
      .map(d => `*Day ${d.day}:* ${d.title}\n  _${d.description}_`)
      .join('\n\n');

    const messageText = `🟢 *NEW BOOKING ITINERARY* 🟢
*Agency:* Trodden Travelers Pakistan 🇵🇰

*Passenger Details:*
👤 *Name:* ${formData.fullName}
📞 *Phone:* ${formData.phone}
✉️ *Email:* ${formData.email || 'N/A'}

*Tour Specifications:*
🗺️ *Destinations:* ${selectedDestNames}
⚙️ *Service Requested:* ${selectedService}
📅 *Start Date:* ${formData.startDate}
⏱️ *Duration:* ${formData.durationDays} Days
👥 *Number of Travelers:* ${formData.travelers} Persons
🏨 *Accommodation:* ${formData.accommodationType} Stay
🚗 *Transport Preference:* ${formData.travelMode}

${formData.specialRequests ? `💬 *Special Requests:*\n"${formData.specialRequests}"\n` : ''}
📍 *Custom Day-by-Day Schedule:*
${dayByDayText}

---
Sent from Trodden Travelers Planner. Please confirm availability!`;

    // Format WhatsApp Web / App link
    const waLink = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(messageText)}`;
    
    // Open in new window safely
    window.open(waLink, '_blank', 'noopener,noreferrer');
    
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
    }, 5000);
  };

  return (
    <div id="itinerary-planner-section" className="bg-white rounded-3xl border border-zinc-200 p-6 md:p-8 shadow-xs relative">
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <Compass className="w-48 h-48 text-zinc-300" />
      </div>

      {/* Title Header */}
      <div className="mb-8 relative z-10">
        <span className="text-xs uppercase tracking-widest text-amber-600 font-mono font-bold flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Bespoke Adventure Engine
        </span>
        <h3 className="text-3xl font-extrabold text-zinc-900 tracking-tight mt-1.5">
          Tailor-Made Pakistan Itinerary Builder
        </h3>
        <p className="text-sm text-zinc-600 mt-2 max-w-2xl">
          Craft your dream Pakistani journey step-by-step. Select destinations, accommodations, and off-road options, customize your daily plan, and submit the booking directly to our WhatsApp concierge.
        </p>
      </div>

      {/* Tabs / Step Navigation */}
      <div className="flex border-b border-zinc-200 mb-8 overflow-x-auto gap-2 scrollbar-none">
        {[
          { num: 1, label: 'Preferences & Destination' },
          { num: 2, label: 'Itinerary Customizer' },
          { num: 3, label: 'Contact & Booking' }
        ].map((step) => (
          <button
            key={step.num}
            onClick={() => setActiveStep(step.num)}
            className={`flex items-center gap-2 px-5 py-3 text-xs uppercase tracking-wider font-mono font-bold border-b-2 transition-all whitespace-nowrap focus:outline-none ${
              activeStep === step.num 
                ? 'border-amber-500 text-amber-600' 
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              activeStep === step.num ? 'bg-amber-500 text-black font-extrabold' : 'bg-zinc-100 text-zinc-500'
            }`}>
              {step.num}
            </span>
            {step.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start relative z-10">
        
        {/* Step Contents */}
        <div className="xl:col-span-7 bg-zinc-50 p-6 rounded-2xl border border-zinc-100 min-h-[460px]">
          
          {/* STEP 1: PREFERENCES & DESTINATIONS */}
          {activeStep === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-xs uppercase tracking-wider font-mono font-bold text-zinc-500 mb-3">
                  1. Select Destination Nodes (Select one or more):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {DESTINATIONS.map((dest) => {
                    const isSelected = formData.destinations.includes(dest.id);
                    return (
                      <button
                        type="button"
                        key={dest.id}
                        onClick={() => handleDestinationToggle(dest.id)}
                        className={`p-3.5 rounded-xl text-left border flex flex-col justify-between transition-all aspect-[4/3] focus:outline-none relative overflow-hidden group ${
                          isSelected 
                            ? 'bg-amber-50/80 border-amber-500 text-zinc-950 shadow-xs' 
                            : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50/50'
                        }`}
                      >
                        <div className="absolute inset-0 bg-cover bg-center opacity-5 group-hover:opacity-10 transition-opacity" style={{ backgroundImage: `url(${dest.image})` }} />
                        <MapPin className={`w-4 h-4 ${isSelected ? 'text-amber-600' : 'text-zinc-400'}`} />
                        <div className="relative z-10">
                          <span className="text-[10px] uppercase font-mono tracking-wider opacity-60 block">{dest.region.split(' ')[0]}</span>
                          <span className="text-xs font-black block mt-0.5 leading-tight">{dest.name}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="serviceId" className="block text-xs uppercase tracking-wider font-mono font-bold text-zinc-500 mb-2">
                    2. Service Category:
                  </label>
                  <select
                    id="serviceId"
                    name="serviceId"
                    value={formData.serviceId}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 font-sans shadow-xs"
                  >
                    {SERVICES.map((s) => (
                      <option key={s.id} value={s.id}>{s.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="durationDays" className="block text-xs uppercase tracking-wider font-mono font-bold text-zinc-500 mb-2">
                    3. Duration:
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      id="durationDays"
                      type="range"
                      name="durationDays"
                      min="2"
                      max="14"
                      value={formData.durationDays}
                      onChange={handleInputChange}
                      className="w-full accent-amber-500"
                    />
                    <span className="font-mono text-sm text-amber-600 font-extrabold w-16 text-right bg-white py-1.5 px-3 rounded-lg border border-zinc-200 shadow-xs">
                      {formData.durationDays} Days
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label htmlFor="travelers" className="block text-xs uppercase tracking-wider font-mono font-bold text-zinc-500 mb-2">
                    4. Passengers:
                  </label>
                  <select
                    id="travelers"
                    name="travelers"
                    value={formData.travelers}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 font-sans shadow-xs"
                  >
                    {[1, 2, 3, 4, 5, 6, '7-10', '10-15', '20+'].map((num) => (
                      <option key={num} value={num}>{num} {typeof num === 'number' && num === 1 ? 'Person' : 'People'}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="accommodationType" className="block text-xs uppercase tracking-wider font-mono font-bold text-zinc-500 mb-2">
                    5. Stay Quality:
                  </label>
                  <select
                    id="accommodationType"
                    name="accommodationType"
                    value={formData.accommodationType}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 font-sans shadow-xs"
                  >
                    <option value="Standard">Standard (3-Star / Local Guest House)</option>
                    <option value="Deluxe">Deluxe (4-Star Premium Stay)</option>
                    <option value="Luxury">Luxury (5-Star / Royal Fort Resorts)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="travelMode" className="block text-xs uppercase tracking-wider font-mono font-bold text-zinc-500 mb-2">
                    6. Transit Vehicle:
                  </label>
                  <select
                    id="travelMode"
                    name="travelMode"
                    value={formData.travelMode}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 font-sans shadow-xs"
                  >
                    <option value="Coaster/Car">Grand Saloon Coaster / Private Sedan</option>
                    <option value="Jeep">Rugged 4x4 Mountain Jeep Safari</option>
                    <option value="By Air">By Air Luxury Domestics Flight</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  id="btn-goto-step2"
                  onClick={() => setActiveStep(2)}
                  className="bg-zinc-900 text-white hover:bg-zinc-800 transition-colors py-3.5 px-6 rounded-xl text-xs uppercase font-mono tracking-wider font-bold flex items-center gap-1.5 focus:outline-none shadow-sm"
                >
                  Configure Daily Schedule <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: DAILY ITINERARY CUSTOMIZER */}
          {activeStep === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-600 block font-bold">Itinerary Customizer</span>
                <h4 className="text-lg font-bold text-zinc-900 mt-1">Adjust Day-by-Day Descriptions</h4>
                <p className="text-xs text-zinc-500 mt-1">Feel free to rewrite or tailor the schedule blocks below. These changes sync instantly to your WhatsApp book payload!</p>
              </div>

              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent">
                {customDays.map((dayItem, index) => (
                  <div key={dayItem.day} className="bg-white border border-zinc-200 p-4 rounded-xl space-y-2.5 shadow-xs">
                    <div className="flex items-center gap-2 border-b border-zinc-100 pb-1.5">
                      <span className="bg-amber-500 text-black text-[10px] font-mono font-black w-14 py-0.5 rounded text-center">
                        DAY {dayItem.day}
                      </span>
                      <input
                        type="text"
                        value={dayItem.title}
                        onChange={(e) => handleDayTitleChange(index, e.target.value)}
                        className="bg-transparent text-sm text-zinc-950 font-extrabold w-full focus:outline-none border-b border-transparent focus:border-amber-500/40"
                      />
                    </div>
                    <textarea
                      rows={2}
                      value={dayItem.description}
                      onChange={(e) => handleDayDescChange(index, e.target.value)}
                      className="bg-transparent text-xs text-zinc-600 w-full focus:outline-none border-b border-transparent focus:border-amber-500/40 resize-none leading-relaxed"
                    />
                  </div>
                ))}
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  id="btn-back-step1"
                  onClick={() => setActiveStep(1)}
                  className="text-zinc-500 hover:text-zinc-900 transition-colors py-3 px-4 text-xs uppercase font-mono tracking-wider font-bold"
                >
                  Back to Prefs
                </button>
                <button
                  type="button"
                  id="btn-goto-step3"
                  onClick={() => setActiveStep(3)}
                  className="bg-zinc-900 text-white hover:bg-zinc-800 transition-colors py-3.5 px-6 rounded-xl text-xs uppercase font-mono tracking-wider font-bold flex items-center gap-1.5 focus:outline-none shadow-sm"
                >
                  Add Contact Info <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: CONTACT & BOOKING */}
          {activeStep === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-600 block font-bold">Personal Details</span>
                <h4 className="text-lg font-bold text-zinc-900 mt-1">Passenger Concierge Registry</h4>
                <p className="text-xs text-zinc-500 mt-1">Please provide your contact information to finalize the booking details.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="block text-xs font-mono uppercase tracking-wider font-bold text-zinc-500 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 shadow-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="block text-xs font-mono uppercase tracking-wider font-bold text-zinc-500 mb-2">
                      WhatsApp/Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="e.g., +92 321 1234567"
                      className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-800 focus:outline-none focus:border-amber-500 font-mono shadow-xs"
                    />
                  </div>

                  <div>
                    <label htmlFor="startDate" className="block text-xs font-mono uppercase tracking-wider font-bold text-zinc-500 mb-2">
                      Departure Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="startDate"
                      type="date"
                      name="startDate"
                      required
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-800 focus:outline-none focus:border-amber-500 font-mono shadow-xs"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-mono uppercase tracking-wider font-bold text-zinc-500 mb-2">
                    Email Address (Optional)
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="you@example.com"
                    className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-800 focus:outline-none focus:border-amber-500 font-mono shadow-xs"
                  />
                </div>

                <div>
                  <label htmlFor="specialRequests" className="block text-xs font-mono uppercase tracking-wider font-bold text-zinc-500 mb-2">
                    Special Requests, Customization Notes, Diet Preference:
                  </label>
                  <textarea
                    id="specialRequests"
                    name="specialRequests"
                    rows={2}
                    value={formData.specialRequests}
                    onChange={handleInputChange}
                    placeholder="e.g. Need high altitude medicines, interested in traditional polo matches, flight modifications..."
                    className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 shadow-xs"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center">
                <button
                  type="button"
                  id="btn-back-step2"
                  onClick={() => setActiveStep(2)}
                  className="text-zinc-500 hover:text-zinc-900 transition-colors py-3 px-4 text-xs uppercase font-mono tracking-wider font-bold"
                >
                  Adjust Schedule
                </button>
                <button
                  type="submit"
                  id="btn-whatsapp-submit"
                  className="bg-emerald-600 text-white hover:bg-emerald-500 transition-colors py-3.5 px-6 rounded-xl text-xs uppercase font-mono tracking-widest font-extrabold flex items-center gap-2 shadow-sm"
                >
                  Send Booking to WhatsApp <Send className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

        </div>

        {/* Live Bill & Summary Ticket Preview */}
        <div className="xl:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm relative overflow-hidden">
            {/* Border pattern */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-emerald-500 to-amber-500" />
            
            <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-400 font-mono block">Trip Ticket Preview</span>
            <div className="flex items-center justify-between mt-2 mb-4 border-b border-zinc-100 pb-3">
              <h4 className="text-lg font-extrabold text-zinc-900 tracking-tight">Trodden Travelers</h4>
              <span className="text-xs font-mono font-black text-amber-700 uppercase bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded">
                Ticket #0322
              </span>
            </div>

            {/* Quick Specs */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-amber-600" /> Route:</span>
                <span className="text-zinc-800 font-extrabold text-right truncate max-w-[200px]">
                  {formData.destinations.map(id => DESTINATIONS.find(d => d.id === id)?.name || id).join(' ➔ ')}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-amber-600" /> Start Date:</span>
                <span className="text-zinc-800 font-mono font-bold">{formData.startDate || 'Not selected'}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-amber-600" /> Duration:</span>
                <span className="text-zinc-800 font-mono font-bold">{formData.durationDays} Days</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500 flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-amber-600" /> Passengers:</span>
                <span className="text-zinc-800 font-mono font-bold">{formData.travelers} Pax</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500 flex items-center gap-1.5"><BedDouble className="w-3.5 h-3.5 text-amber-600" /> Stay Level:</span>
                <span className="text-zinc-800 font-extrabold font-mono">{formData.accommodationType} Class</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500 flex items-center gap-1.5"><Plane className="w-3.5 h-3.5 text-amber-600" /> Transit:</span>
                <span className="text-zinc-800 font-extrabold font-mono">{formData.travelMode}</span>
              </div>
            </div>

            {/* Price estimate block */}
            <div className="mt-5 p-4 rounded-xl bg-zinc-50 border border-zinc-100">
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block">Base Package Estimate</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl font-black text-amber-600">
                  {currentItinerary ? currentItinerary.priceEstimate.split(' ')[0] : 'PKR'} {currentItinerary ? currentItinerary.priceEstimate.split(' ')[1] : 'Consulting'}
                </span>
                <span className="text-[9px] font-mono text-zinc-400">/ person (excl. airfares)</span>
              </div>
              <p className="text-[10px] text-zinc-500 mt-1.5 italic">Note: Final invoice customizes according to hotel selection and season surges.</p>
            </div>
          </div>

          {/* Success Dialog Pop */}
          <AnimatePresence>
            {isSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-start gap-3"
              >
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-sm font-extrabold text-emerald-900">WhatsApp Connection Initiated!</h5>
                  <p className="text-xs text-emerald-700 mt-1">
                    Your bespoke itinerary was securely packaged into an encrypted block and sent to +92 322 4704286. Please continue in your WhatsApp chat box to finalize pricing!
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Firestore Cloud Synchronizer Section */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-2 mb-4 border-b border-zinc-100 pb-3">
              <Database className="w-5 h-5 text-amber-600" />
              <div>
                <h4 className="text-sm font-bold text-zinc-900 tracking-tight">Cloud Saved Itineraries</h4>
                <p className="text-[10px] text-zinc-500">Real-time backup via secure Google Firebase</p>
              </div>
            </div>

            {/* List Saved Plans */}
            {savedPlans.length > 0 ? (
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-200">
                {savedPlans.map((plan, idx) => {
                  const destNames = plan.destinations
                    ? plan.destinations.map((id: string) => DESTINATIONS.find(d => d.id === id)?.name || id).join(', ')
                    : 'Custom Route';
                  return (
                    <div key={plan.id || idx} className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 hover:border-zinc-200 transition-all flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-zinc-800 truncate">{destNames}</div>
                        <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                          {plan.durationDays} Days • {plan.travelers} Pax • {plan.startDate || 'No date'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleLoadPlan(plan)}
                        className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500 text-amber-600 hover:text-zinc-950 transition-colors rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider border border-amber-500/20"
                      >
                        Load
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-zinc-400 text-xs italic">
                No itineraries saved in this session yet. Submit a booking or search your email to restore past plans!
              </div>
            )}

            {/* Backup current draft section */}
            <div className="mt-4 pt-4 border-t border-zinc-100">
              {isBackupSuccess && (
                <div className="mb-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-[11px] text-emerald-700 font-semibold">
                  ✓ Itinerary backed up successfully to the cloud!
                </div>
              )}
              
              {showBackupEmailForm ? (
                <div className="space-y-3 bg-zinc-50 p-3.5 rounded-xl border border-zinc-200 mb-3 text-left">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-600 font-bold block">Backup Setup</span>
                  <p className="text-[10px] text-zinc-500">Enter your details to register this custom plan on the cloud.</p>
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Your Name"
                      value={backupNameInput}
                      onChange={(e) => setBackupNameInput(e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-800 focus:outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      required
                      placeholder="Your Email"
                      value={backupEmailInput}
                      onChange={(e) => setBackupEmailInput(e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-800 focus:outline-none font-mono"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleInstantBackup()}
                      disabled={isSaving}
                      className="flex-1 py-1.5 bg-amber-500 text-black font-extrabold font-mono text-[10px] uppercase tracking-wider rounded-lg hover:bg-amber-400 transition-colors"
                    >
                      {isSaving ? "Syncing..." : "Sync to Cloud"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowBackupEmailForm(false)}
                      className="px-3 py-1.5 bg-zinc-200 text-zinc-600 font-bold font-mono text-[10px] uppercase tracking-wider rounded-lg hover:text-zinc-800 hover:bg-zinc-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (formData.fullName && formData.email) {
                      handleInstantBackup();
                    } else {
                      setShowBackupEmailForm(true);
                    }
                  }}
                  disabled={isSaving}
                  className="w-full py-2.5 bg-zinc-50 hover:bg-zinc-100 text-amber-600 border border-zinc-200 hover:border-amber-500/40 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors mb-3 shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} /> 
                  {isSaving ? "Backing up..." : "Backup Current Draft to Cloud"}
                </button>
              )}
            </div>

            {/* Retrieve from Email */}
            <div className="mt-4 pt-4 border-t border-zinc-100">
              <label htmlFor="searchEmail" className="block text-[10px] font-mono uppercase tracking-wider font-bold text-zinc-500 mb-2">
                Retrieve from Cloud:
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="searchEmail"
                    type="email"
                    placeholder="Enter your email"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-800 focus:outline-none focus:border-amber-500 font-mono shadow-xs"
                  />
                </div>
                <button
                  type="button"
                  disabled={isSearching}
                  onClick={() => handleSearchByEmail(searchEmail)}
                  className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 disabled:bg-zinc-50 disabled:text-zinc-400 text-zinc-700 hover:text-zinc-900 transition-colors rounded-xl text-xs font-mono font-bold flex items-center justify-center shrink-0 border border-zinc-200"
                >
                  {isSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Fetch'}
                </button>
              </div>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
