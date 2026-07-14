import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TOUR_PACKAGES, TourPackage, normalizeTour } from '../data_tours';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { 
  Search, 
  MapPin, 
  Clock, 
  DollarSign, 
  Calendar, 
  Tag, 
  ArrowRight, 
  X, 
  Check, 
  AlertTriangle, 
  Phone, 
  ChevronDown, 
  ChevronUp, 
  Users, 
  Plane, 
  Car, 
  Plus, 
  Minus,
  Sparkles,
  Database,
  RefreshCw
} from 'lucide-react';

export default function ToursPage() {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<number>(40000);
  const [selectedTour, setSelectedTour] = useState<TourPackage | null>(null);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  // Dynamic tours loading
  const [tours, setTours] = useState<TourPackage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const q = query(collection(db, 'tours'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          // Fallback to static packages
          setTours(TOUR_PACKAGES);
        } else {
          const fetched: TourPackage[] = [];
          querySnapshot.forEach(docSnap => {
            fetched.push(normalizeTour({ id: docSnap.id, ...docSnap.data() }));
          });
          setTours(fetched);
        }
      } catch (e) {
        console.error("Could not load Firestore tours, using static defaults:", e);
        setTours(TOUR_PACKAGES);
        try {
          handleFirestoreError(e, OperationType.LIST, "tours");
        } catch (err) {
          // Log/throw standard format
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchTours();
  }, []);

  // Pricing calculator state inside modal
  const [calcPax, setCalcPax] = useState<number>(2);
  const [calcType, setCalcType] = useState<'single' | 'couple'>('single');

  // Booking form inside modal
  const [bookingName, setBookingName] = useState<string>('');
  const [bookingEmail, setBookingEmail] = useState<string>('');
  const [bookingPhone, setBookingPhone] = useState<string>('');
  const [bookingDate, setBookingDate] = useState<string>('');
  const [bookingNotes, setBookingNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);

  // Categories list
  const categories = ['All', 'Gilgit-Baltistan', 'Khyber Pakhtunkhwa', 'Azad Kashmir', 'Short Trips'];

  // Filter package items
  const filteredTours = tours.filter(tour => {
    const matchesCategory = activeCategory === 'All' || tour.category === activeCategory;
    const matchesSearch = tour.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tour.places.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPrice = (calcType === 'couple' ? tour.priceCouple : tour.priceSingle) <= maxPrice || tour.priceSingle <= maxPrice;
    return matchesCategory && matchesSearch && matchesPrice;
  });

  const handleOpenTourDetails = (tour: TourPackage) => {
    setSelectedTour(tour);
    setExpandedDay(0); // expand Day 1 or 0 by default
    setCalcPax(2);
    setCalcType('single');
    // Clear booking state
    setBookingName('');
    setBookingEmail('');
    setBookingPhone('');
    setBookingDate('');
    setBookingNotes('');
    setBookingSuccess(false);
  };

  const handleBookTour = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTour) return;

    if (!bookingName || !bookingEmail || !bookingPhone || !bookingDate) {
      alert("Please complete all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Write to Firebase Firestore database
      const docRef = await addDoc(collection(db, "bookings"), {
        fullName: bookingName,
        email: bookingEmail.trim().toLowerCase(),
        phone: bookingPhone,
        serviceId: selectedTour.id,
        destinations: selectedTour.places.slice(0, 5),
        durationDays: selectedTour.durationDays,
        travelers: calcPax,
        accommodationType: calcType === 'couple' ? 'Couple Room' : 'Sharing Room',
        travelMode: calcPax > 15 ? 'Coaster Bus' : 'Grand Cabin',
        startDate: bookingDate,
        specialRequests: `Tour Package: ${selectedTour.title}. Notes: ${bookingNotes}`,
        createdAt: serverTimestamp()
      });

      // 2. Push booking ID to localStorage so user can retrieve it later
      const localIdsString = localStorage.getItem('tt_booking_ids');
      const localIds = localIdsString ? JSON.parse(localIdsString) : [];
      if (!localIds.includes(docRef.id)) {
        localIds.push(docRef.id);
        localStorage.setItem('tt_booking_ids', JSON.stringify(localIds));
      }

      setBookingSuccess(true);

      // 3. Prepare formatted WhatsApp message
      const calculatedCost = calcType === 'couple' 
        ? selectedTour.priceCouple 
        : selectedTour.priceSingle * calcPax;

      const whatsappText = `Hello Trodden Travelers! I would like to book a tour:
--------------------------------------------
Tour: ${selectedTour.title} (${selectedTour.durationDays} Days)
Client Name: ${bookingName}
Contact Phone: ${bookingPhone}
Email: ${bookingEmail}
Preferred Start Date: ${bookingDate}
Travelers Count: ${calcPax}
Package Type: ${calcType === 'couple' ? 'Couple Package (Separate Room)' : 'Standard Sharing'}
Estimated Price: Rs. ${calculatedCost.toLocaleString()}/-
Special Notes: ${bookingNotes}
--------------------------------------------
Thank you! Please confirm my reservation and seats.`;

      const encryptedText = encodeURIComponent(whatsappText);
      const whatsappURL = `https://wa.me/923224704286?text=${encryptedText}`;

      // Wait a moment for UX before opening
      setTimeout(() => {
        window.open(whatsappURL, '_blank', 'noreferrer');
      }, 1200);

    } catch (err) {
      console.error("Booking error:", err);
      alert("Something went wrong saving your booking to the Cloud database. We are continuing with WhatsApp.");
      handleFirestoreError(err, OperationType.WRITE, "bookings");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-12 py-4">
      
      {/* Search and Filters Hub */}
      <div className="bg-white border border-zinc-200 p-6 rounded-3xl shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tours or specific destinations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-zinc-200 rounded-xl pl-11 pr-4 py-3 text-sm text-zinc-800 focus:outline-none focus:border-emerald-500 shadow-xs"
            />
          </div>

          {/* Pricing slider */}
          <div className="w-full md:w-72 space-y-2">
            <div className="flex justify-between text-xs font-mono text-zinc-500 font-bold">
              <span>Max Cost Target:</span>
              <span className="text-emerald-600 font-extrabold">Rs. {maxPrice.toLocaleString()}/-</span>
            </div>
            <input
              type="range"
              min="9000"
              max="90000"
              step="1000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-emerald-500 bg-zinc-100 h-1 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex flex-wrap gap-2.5">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
                activeCategory === cat
                  ? 'bg-emerald-500 border-emerald-500 text-black'
                  : 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-zinc-800 hover:border-zinc-300 shadow-xs'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Tours */}
      {isLoading ? (
        <div className="text-center py-24 bg-white border border-zinc-200 rounded-3xl shadow-xs flex flex-col items-center justify-center space-y-4">
          <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin" />
          <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 font-bold">Loading custom tour catalogs...</p>
        </div>
      ) : filteredTours.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTours.map((tour, idx) => {
            const hasCouplePrice = tour.priceCouple > 0;
            return (
              <motion.div
                key={tour.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="bg-white border border-zinc-200 rounded-3xl overflow-hidden hover:border-zinc-350 transition-all flex flex-col group shadow-xs hover:shadow-sm"
              >
                
                {/* Tour Banner Area */}
                <div className="h-48 relative overflow-hidden bg-zinc-50">
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/10 z-10" />
                  <img
                    src={tour.image}
                    alt={tour.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1596422846543-75c6fc18a523?auto=format&fit=crop&q=80&w=600";
                    }}
                  />
                  <div className="absolute top-4 left-4 z-10">
                    <span className="bg-emerald-500 text-black text-[10px] font-mono font-black tracking-widest uppercase px-2.5 py-1 rounded-md">
                      {tour.tag}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4 z-10">
                    <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded-md border border-white/20">
                      {tour.durationDays} Days
                    </span>
                  </div>
                </div>

                {/* Tour Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-extrabold text-zinc-900 tracking-tight leading-snug line-clamp-2">
                      {tour.title}
                    </h4>
                    <p className="text-[11px] text-zinc-500 leading-relaxed line-clamp-3">
                      <strong>Visiting:</strong> {tour.places.join(' • ')}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-400 block font-bold">Single Person Base</span>
                      <span className="text-sm font-black text-emerald-600">Rs. {tour.priceSingle.toLocaleString()}/-</span>
                    </div>
                    {hasCouplePrice && (
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-zinc-400 block font-bold">Couple Separate Room</span>
                        <span className="text-sm font-black text-zinc-800">Rs. {tour.priceCouple.toLocaleString()}/-</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleOpenTourDetails(tour)}
                    className="w-full bg-zinc-50 hover:bg-emerald-500 text-zinc-700 hover:text-black border border-zinc-100 hover:border-emerald-500 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-xs"
                  >
                    View Full Itinerary <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                </div>

              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-zinc-200 rounded-3xl shadow-xs">
          <AlertTriangle className="w-10 h-10 text-emerald-500 mx-auto mb-3 animate-pulse" />
          <p className="text-sm text-zinc-600 font-bold">No packages found matching your criteria.</p>
          <button
            onClick={() => { setSearchQuery(''); setMaxPrice(90000); setActiveCategory('All'); }}
            className="mt-4 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs rounded-xl transition-colors font-mono font-bold border border-zinc-200"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Itinerary & Booking Modal */}
      <AnimatePresence>
        {selectedTour && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-zinc-200 rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col"
            >
              
              {/* Modal Header */}
              <div className="p-6 border-b border-zinc-200 bg-zinc-50/50 flex items-center justify-between shrink-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-200 text-[9px] font-mono font-bold tracking-widest uppercase px-2 py-0.5 rounded">
                      {selectedTour.tag}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono font-bold">
                      {selectedTour.durationDays} Days Tour
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-zinc-950 tracking-tight leading-none">
                    {selectedTour.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedTour(null)}
                  className="p-2 text-zinc-500 hover:text-zinc-900 bg-white border border-zinc-200 hover:border-zinc-300 rounded-xl transition-colors focus:outline-none"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal scrollable body split into left details and right billing */}
              <div className="overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left side: Itineraries & Service inclusions */}
                <div className="lg:col-span-7 space-y-8">
                  
                  {/* Departures, places highlights */}
                  <div className="space-y-3 bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                    <div className="text-xs text-zinc-600">
                      <strong>Departures:</strong> {selectedTour.departureDays.join(' and ')} from {selectedTour.departureFrom}.
                    </div>
                    <div className="text-xs text-zinc-600">
                      <strong>All key locations:</strong> {selectedTour.places.join(', ')}.
                    </div>
                  </div>

                  {/* Day-by-Day Accordions */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-mono uppercase tracking-widest font-extrabold text-zinc-900 border-b border-zinc-200 pb-1.5">
                      Day-by-Day Expedition Itinerary
                    </h4>
                    <div className="space-y-2">
                      {selectedTour.itinerary.map((dayPlan, idx) => {
                        const isExpanded = expandedDay === idx;
                        return (
                          <div key={idx} className="border border-zinc-200 rounded-xl overflow-hidden bg-zinc-50/20">
                            <button
                              type="button"
                              onClick={() => setExpandedDay(isExpanded ? null : idx)}
                              className="w-full text-left p-4 flex items-center justify-between gap-3 text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded font-mono text-[10px] border border-emerald-200/50">
                                  {dayPlan.day}
                                </span>
                                <span className="text-zinc-900 font-extrabold tracking-tight">{dayPlan.title}</span>
                              </div>
                              {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                            </button>
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="px-4 pb-4 pt-1 text-xs text-zinc-600 leading-relaxed border-t border-zinc-100"
                                >
                                  {dayPlan.desc}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Services In & Out */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2.5">
                      <h5 className="text-[10px] font-mono uppercase tracking-wider font-bold text-emerald-600 border-b border-zinc-200 pb-1">Services Included:</h5>
                      <ul className="space-y-1.5 text-[11px] text-zinc-500">
                        {selectedTour.servicesIncluded.map((si, i) => (
                          <li key={i} className="flex items-start gap-1.5 font-medium">
                            <span className="text-emerald-600 font-bold shrink-0">✓</span>
                            <span>{si}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2.5">
                      <h5 className="text-[10px] font-mono uppercase tracking-wider font-bold text-red-600 border-b border-zinc-200 pb-1">Not Included:</h5>
                      <ul className="space-y-1.5 text-[11px] text-zinc-500">
                        {selectedTour.servicesExcluded.map((se, i) => (
                          <li key={i} className="flex items-start gap-1.5 font-medium">
                            <span className="text-red-500 font-bold shrink-0">×</span>
                            <span>{se}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Specific terms / kids policy warning */}
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 space-y-2 text-[11px] text-zinc-600 leading-relaxed font-medium">
                    <div className="flex items-center gap-1.5 text-emerald-700 font-mono font-bold">
                      <AlertTriangle className="w-4 h-4" /> Specific Tour Guidelines
                    </div>
                    <div><strong>Kids Policy:</strong> {selectedTour.kidsPolicy}</div>
                    <div><strong>Cancellation:</strong> {selectedTour.cancellationPolicy}</div>
                  </div>

                </div>

                {/* Right side: Cost Calculator & Reservation Card */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* Dynamic Pricing Calculator */}
                  <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-100 space-y-4">
                    <h4 className="text-xs font-mono uppercase tracking-widest font-extrabold text-zinc-800 flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-emerald-600" /> Interactive Cost Estimate
                    </h4>

                    {/* Sharing Toggle */}
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <button
                        type="button"
                        onClick={() => setCalcType('single')}
                        className={`py-2 rounded-xl border ${
                          calcType === 'single'
                            ? 'bg-emerald-500 border-emerald-500 text-black font-extrabold'
                            : 'bg-white border-zinc-200 text-zinc-500'
                        }`}
                      >
                        Single Sharing
                      </button>
                      <button
                        type="button"
                        onClick={() => setCalcType('couple')}
                        className={`py-2 rounded-xl border ${
                          calcType === 'couple'
                            ? 'bg-emerald-500 border-emerald-500 text-black font-extrabold'
                            : 'bg-white border-zinc-200 text-zinc-500'
                        }`}
                      >
                        Separate Couple
                      </button>
                    </div>

                    {/* Quantity selectors */}
                    {calcType === 'single' && (
                      <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-zinc-200/80">
                        <span className="text-xs text-zinc-600 font-bold">Total Pax / Persons:</span>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setCalcPax(p => Math.max(1, p - 1))}
                            className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-800 font-bold flex items-center justify-center hover:bg-zinc-200 border border-zinc-200"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-sm font-bold font-mono text-zinc-800">{calcPax}</span>
                          <button
                            type="button"
                            onClick={() => setCalcPax(p => p + 1)}
                            className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-800 font-bold flex items-center justify-center hover:bg-zinc-200 border border-zinc-200"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Display final estimated price */}
                    <div className="pt-3 border-t border-zinc-200/80 flex items-center justify-between">
                      <span className="text-xs text-zinc-500 font-bold">Total Package Cost:</span>
                      <div className="text-right">
                        <span className="text-lg font-black text-emerald-600 block">
                          Rs. {
                            (calcType === 'couple' 
                              ? selectedTour.priceCouple 
                              : selectedTour.priceSingle * calcPax
                            ).toLocaleString()
                          }/-
                        </span>
                        <span className="text-[9px] font-mono text-zinc-400 font-bold">Requires 30% advance seat booking</span>
                      </div>
                    </div>
                  </div>

                  {/* Booking form directly saved in Firebase Firestore bookings */}
                  <form onSubmit={handleBookTour} className="bg-zinc-50 p-5 rounded-2xl border border-zinc-100 space-y-4">
                    <h4 className="text-xs font-mono uppercase tracking-widest font-extrabold text-zinc-800 flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-emerald-600" /> Book Seats Online
                    </h4>

                    {bookingSuccess ? (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center space-y-3">
                        <Check className="w-8 h-8 text-emerald-600 mx-auto" />
                        <h5 className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Plan Saved to Cloud!</h5>
                        <p className="text-[11px] text-emerald-600 leading-relaxed font-bold">
                          Your reservation has been created in our Firestore database. Redirecting you to our WhatsApp concierge desk (+92 322 4704286) to confirm seat numbers and schedule advance transfers!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3.5">
                        <div className="grid grid-cols-1 gap-3">
                          <div>
                            <label className="block text-[10px] font-mono text-zinc-500 font-bold mb-1">Your Full Name *</label>
                            <input
                              type="text"
                              required
                              value={bookingName}
                              onChange={(e) => setBookingName(e.target.value)}
                              placeholder="e.g., Abdullah"
                              className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:border-emerald-500 shadow-xs focus:ring-1 focus:ring-emerald-500/20"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-mono text-zinc-500 font-bold mb-1">Email Address *</label>
                              <input
                                type="email"
                                required
                                value={bookingEmail}
                                onChange={(e) => setBookingEmail(e.target.value)}
                                placeholder="e.g., mail@gmail.com"
                                className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:border-emerald-500 shadow-xs focus:ring-1 focus:ring-emerald-500/20"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-mono text-zinc-500 font-bold mb-1">Phone Number *</label>
                              <input
                                type="tel"
                                required
                                value={bookingPhone}
                                onChange={(e) => setBookingPhone(e.target.value)}
                                placeholder="e.g., 03001234567"
                                className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:border-emerald-500 font-mono shadow-xs focus:ring-1 focus:ring-emerald-500/20"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-mono text-zinc-500 font-bold mb-1">Departure Date *</label>
                              <input
                                type="date"
                                required
                                value={bookingDate}
                                onChange={(e) => setBookingDate(e.target.value)}
                                className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:border-emerald-500 font-mono shadow-xs focus:ring-1 focus:ring-emerald-500/20"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-mono text-zinc-500 font-bold mb-1">Accompanied Pax</label>
                              <input
                                type="text"
                                disabled
                                value={calcType === 'couple' ? 'Couple separate' : `${calcPax} Persons`}
                                className="w-full bg-white/60 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-450 cursor-not-allowed font-mono shadow-xs"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono text-zinc-500 font-bold mb-1">Special instructions / requests</label>
                            <textarea
                              rows={2}
                              value={bookingNotes}
                              onChange={(e) => setBookingNotes(e.target.value)}
                              placeholder="Any dietary constraints or pick-up points..."
                              className="w-full bg-white border border-zinc-200 rounded-xl p-3 text-xs text-zinc-800 focus:outline-none focus:border-emerald-500 resize-none shadow-xs focus:ring-1 focus:ring-emerald-500/20"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-100 text-black py-3 rounded-xl text-xs font-mono font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-xs"
                        >
                          {isSubmitting ? "Saving to Cloud..." : "Book seats & open WhatsApp"} <ArrowRight className="w-4 h-4" />
                        </button>
                        
                        <span className="block text-[9px] text-zinc-400 font-bold italic text-center leading-normal">
                          By clicking above, your reservation details are written securely to Firestore and our verified WhatsApp agent is loaded instantly.
                        </span>
                      </div>
                    )}
                  </form>

                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
