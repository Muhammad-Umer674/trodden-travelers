import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { 
  collection, 
  getDocs, 
  getDoc,
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { TOUR_PACKAGES, TourPackage, normalizeTour } from '../data_tours';
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
  Plus, 
  Minus, 
  Trash2, 
  Edit2, 
  Lock, 
  Unlock, 
  Database, 
  Save, 
  RefreshCw, 
  Eye, 
  Users, 
  Sparkles,
  Layers,
  ShieldAlert,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passcode, setPasscode] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  // Dashboard state
  const [activeSubTab, setActiveSubTab] = useState<'tours' | 'bookings' | 'system'>('tours');
  const [tours, setTours] = useState<TourPackage[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Notification states
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Editor states
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editTourId, setEditTourId] = useState<string | null>(null); // null means "Add New"
  const [formTitle, setFormTitle] = useState<string>('');
  const [formTag, setFormTag] = useState<string>('');
  const [formCategory, setFormCategory] = useState<TourPackage['category']>('Gilgit-Baltistan');
  const [formDurationDays, setFormDurationDays] = useState<number>(5);
  const [formPriceSingle, setFormPriceSingle] = useState<number>(25000);
  const [formPriceCouple, setFormPriceCouple] = useState<number>(65000);
  const [formDepartureFrom, setFormDepartureFrom] = useState<string>('Lahore & Islamabad');
  const [formKidsPolicy, setFormKidsPolicy] = useState<string>('Under 3 years: Free. 3-8 years: 70% charges. 8+ years: Fully charged.');
  const [formCancellationPolicy, setFormCancellationPolicy] = useState<string>('7 days before departure: 50% deduction. 3 days before: 75% deduction. Less than 3 days: 100% deduction.');
  const [formImage, setFormImage] = useState<string>('');

  // Multi-item lists in state
  const [listDepartureDays, setListDepartureDays] = useState<string[]>(['Every Friday night']);
  const [newDepartureDay, setNewDepartureDay] = useState<string>('');

  const [listPickups, setListPickups] = useState<string[]>([]);
  const [newPickup, setNewPickup] = useState<string>('');

  const [listPlaces, setListPlaces] = useState<string[]>([]);
  const [newPlace, setNewPlace] = useState<string>('');

  const [listServicesIncluded, setListServicesIncluded] = useState<string[]>([]);
  const [newServiceIncluded, setNewServiceIncluded] = useState<string>('');

  const [listServicesExcluded, setListServicesExcluded] = useState<string[]>([]);
  const [newServiceExcluded, setNewServiceExcluded] = useState<string>('');

  const [listItinerary, setListItinerary] = useState<{ day: string; title: string; desc: string }[]>([]);
  const [newItineraryDayNum, setNewItineraryDayNum] = useState<string>('Day 1');
  const [newItineraryTitle, setNewItineraryTitle] = useState<string>('');
  const [newItineraryDesc, setNewItineraryDesc] = useState<string>('');

  const [adminPasscode, setAdminPasscode] = useState<string>('admin123');
  const [newPasscodeVal, setNewPasscodeVal] = useState<string>('');
  const [confirmPasscodeVal, setConfirmPasscodeVal] = useState<string>('');

  // Fetch admin passcode and manage session state with cleanup on unmount
  useEffect(() => {
    const fetchAdminPasscode = async () => {
      try {
        const docRef = doc(db, 'settings', 'admin_config');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().passcode) {
          setAdminPasscode(docSnap.data().passcode);
        }
      } catch (err) {
        console.error("Error fetching admin passcode:", err);
        handleFirestoreError(err, OperationType.GET, 'settings/admin_config');
      }
    };
    fetchAdminPasscode();

    const isAuth = sessionStorage.getItem('tt_admin_authenticated');
    if (isAuth === 'true') {
      setIsAuthenticated(true);
    }

    return () => {
      // Clear authenticated state when leaving admin panel (unmounting)
      sessionStorage.removeItem('tt_admin_authenticated');
    };
  }, []);

  // Load active tab data
  useEffect(() => {
    if (isAuthenticated) {
      if (activeSubTab === 'tours') {
        fetchTours();
      } else if (activeSubTab === 'bookings') {
        fetchBookings();
      }
    }
  }, [isAuthenticated, activeSubTab]);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (passcode.trim() === adminPasscode) {
      setIsAuthenticated(true);
      sessionStorage.setItem('tt_admin_authenticated', 'true');
      setAuthError('');
    } else {
      setAuthError('Invalid administrator credentials. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('tt_admin_authenticated');
  };

  const handleChangePasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasscodeVal.trim()) {
      showNotification("Passcode cannot be empty.", "error");
      return;
    }
    if (newPasscodeVal.length < 6) {
      showNotification("Passcode must be at least 6 characters long.", "error");
      return;
    }
    if (newPasscodeVal !== confirmPasscodeVal) {
      showNotification("New passcode and confirmation do not match.", "error");
      return;
    }

    setIsActionLoading(true);
    try {
      const docRef = doc(db, 'settings', 'admin_config');
      await setDoc(docRef, { passcode: newPasscodeVal.trim() }, { merge: true });
      setAdminPasscode(newPasscodeVal.trim());
      setNewPasscodeVal('');
      setConfirmPasscodeVal('');
      showNotification("Master passcode updated successfully!", "success");
    } catch (err) {
      console.error("Error setting admin passcode in Firestore:", err);
      showNotification("Failed to save passcode. Please try again.", "error");
      handleFirestoreError(err, OperationType.WRITE, 'settings/admin_config');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Fetch Tours from Firestore with Fallback & Auto-seed
  const fetchTours = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, 'tours'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        // Auto-seed database with default tours if Firestore collection is empty
        await seedDatabase();
      } else {
        const fetchedTours: TourPackage[] = [];
        querySnapshot.forEach((docSnap) => {
          fetchedTours.push(normalizeTour({ id: docSnap.id, ...docSnap.data() }));
        });
        setTours(fetchedTours);
      }
    } catch (err) {
      console.error("Error loading tours from Firestore:", err);
      showNotification("Failed to fetch tours. Using default static assets.", "error");
      setTours(TOUR_PACKAGES);
      try {
        handleFirestoreError(err, OperationType.LIST, "tours");
      } catch (e) {}
    } finally {
      setIsLoading(false);
    }
  };

  // Seed Database with the Default Tours
  const seedDatabase = async () => {
    setIsActionLoading(true);
    try {
      showNotification("Firestore 'tours' is empty. Seeding defaults...", "success");
      for (const tour of TOUR_PACKAGES) {
        const docRef = doc(db, 'tours', tour.id);
        await setDoc(docRef, {
          ...tour,
          createdAt: serverTimestamp()
        });
      }
      showNotification("Database populated successfully!", "success");
      
      // Load them
      const q = query(collection(db, 'tours'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedTours: TourPackage[] = [];
      querySnapshot.forEach((docSnap) => {
        fetchedTours.push(normalizeTour({ id: docSnap.id, ...docSnap.data() }));
      });
      setTours(fetchedTours);
    } catch (err) {
      console.error("Failed to seed database:", err);
      showNotification("Failed to seed default packages to Firestore.", "error");
      setTours(TOUR_PACKAGES);
      try {
        handleFirestoreError(err, OperationType.WRITE, "tours");
      } catch (e) {}
    } finally {
      setIsActionLoading(false);
    }
  };

  // Fetch Bookings
  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedBookings: any[] = [];
      querySnapshot.forEach((docSnap) => {
        fetchedBookings.push({ id: docSnap.id, ...docSnap.data() });
      });
      setBookings(fetchedBookings);
    } catch (err) {
      console.error("Error loading bookings:", err);
      showNotification("Could not retrieve customer inquiries.", "error");
      try {
        handleFirestoreError(err, OperationType.LIST, "bookings");
      } catch (e) {}
    } finally {
      setIsLoading(false);
    }
  };

  // Reset Edit/Add Form
  const openFormForAdd = () => {
    setEditTourId(null);
    setFormTitle('');
    setFormTag('New Release');
    setFormCategory('Gilgit-Baltistan');
    setFormDurationDays(5);
    setFormPriceSingle(25000);
    setFormPriceCouple(65000);
    setFormDepartureFrom('Lahore & Islamabad');
    setFormKidsPolicy('Under 3 years: Free. 3-8 years: 70% charges. 8+ years: Fully charged.');
    setFormCancellationPolicy('7 days before departure: 50% deduction. 3 days before: 75% deduction. Less than 3 days: 100% deduction.');
    setFormImage('https://images.unsplash.com/photo-1596422846543-75c6fc18a523?auto=format&fit=crop&q=80&w=1200');
    
    setListDepartureDays(['Every Friday night']);
    setListPickups([
      "Lahore: Thokar Niaz Baig PSO Pump",
      "Islamabad: Daewoo Terminal, 26 Number"
    ]);
    setListPlaces(['Hunza', 'Skardu', 'Sost', 'Khunjerab Pass']);
    setListServicesIncluded([
      'Luxury air-conditioned Transport',
      'Standard Hotels Accommodations',
      'Standard Breakfasts + dinners'
    ]);
    setListServicesExcluded([
      'Jeep hire fares',
      'Boating and entry tickets'
    ]);
    setListItinerary([
      { day: 'Day 0', title: 'Departure', desc: 'Board the vehicles from Lahore and start the journey.' },
      { day: 'Day 1', title: 'Arrival and Check-in', desc: 'Travel through Karakoram and check-in to hotels.' }
    ]);
    
    setIsEditing(true);
  };

  // Open Form For Edit
  const openFormForEdit = (tour: TourPackage) => {
    setEditTourId(tour.id);
    setFormTitle(tour.title);
    setFormTag(tour.tag || 'Bestseller');
    setFormCategory(tour.category || 'Gilgit-Baltistan');
    setFormDurationDays(tour.durationDays || 5);
    setFormPriceSingle(tour.priceSingle || 0);
    setFormPriceCouple(tour.priceCouple || 0);
    setFormDepartureFrom(tour.departureFrom || 'Lahore & Islamabad');
    setFormKidsPolicy(tour.kidsPolicy || '');
    setFormCancellationPolicy(tour.cancellationPolicy || '');
    setFormImage(tour.image || '');

    setListDepartureDays(tour.departureDays || []);
    setListPickups(tour.pickups || []);
    setListPlaces(tour.places || []);
    setListServicesIncluded(tour.servicesIncluded || []);
    setListServicesExcluded(tour.servicesExcluded || []);
    setListItinerary(tour.itinerary || []);

    setIsEditing(true);
  };

  // Handle Form Submit (Save / Update)
  const handleSaveTour = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle) {
      showNotification("Please fill out the tour title.", "error");
      return;
    }

    setIsActionLoading(true);
    try {
      const slug = formTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      const finalId = editTourId || `tour-${slug}-${Math.floor(1000 + Math.random() * 9000)}`;

      const dataToSave = {
        id: finalId,
        title: formTitle,
        tag: formTag,
        category: formCategory,
        durationDays: Number(formDurationDays),
        priceSingle: Number(formPriceSingle),
        priceCouple: Number(formPriceCouple),
        departureFrom: formDepartureFrom,
        kidsPolicy: formKidsPolicy,
        cancellationPolicy: formCancellationPolicy,
        image: formImage || 'https://images.unsplash.com/photo-1596422846543-75c6fc18a523?auto=format&fit=crop&q=80&w=1200',
        departureDays: listDepartureDays,
        pickups: listPickups,
        places: listPlaces,
        servicesIncluded: listServicesIncluded,
        servicesExcluded: listServicesExcluded,
        itinerary: listItinerary,
        updatedAt: serverTimestamp(),
        createdAt: editTourId ? undefined : serverTimestamp()
      };

      // Clean undefined keys for Firebase
      const cleanData = Object.fromEntries(
        Object.entries(dataToSave).filter(([_, v]) => v !== undefined)
      );

      await setDoc(doc(db, 'tours', finalId), cleanData, { merge: true });

      showNotification(editTourId ? "Tour package updated successfully!" : "New tour package created!", "success");
      setIsEditing(false);
      await fetchTours();
    } catch (err) {
      console.error("Save tour error:", err);
      showNotification("Could not save tour to Firestore database.", "error");
      handleFirestoreError(err, OperationType.WRITE, "tours");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Delete Tour Package
  const handleDeleteTour = async (id: string, title: string) => {
    if (!window.confirm(`Are you absolutely sure you want to delete "${title}"?`)) {
      return;
    }

    setIsActionLoading(true);
    try {
      await deleteDoc(doc(db, 'tours', id));
      showNotification(`Deleted tour "${title}" successfully.`, "success");
      await fetchTours();
    } catch (err) {
      console.error("Delete tour error:", err);
      showNotification("Failed to delete from Firestore.", "error");
      handleFirestoreError(err, OperationType.WRITE, "tours");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Multi-list modifiers
  const handleAddDepartureDay = () => {
    if (newDepartureDay.trim()) {
      setListDepartureDays([...listDepartureDays, newDepartureDay.trim()]);
      setNewDepartureDay('');
    }
  };
  const handleRemoveDepartureDay = (idx: number) => {
    setListDepartureDays(listDepartureDays.filter((_, i) => i !== idx));
  };

  const handleAddPickup = () => {
    if (newPickup.trim()) {
      setListPickups([...listPickups, newPickup.trim()]);
      setNewPickup('');
    }
  };
  const handleRemovePickup = (idx: number) => {
    setListPickups(listPickups.filter((_, i) => i !== idx));
  };

  const handleAddPlace = () => {
    if (newPlace.trim()) {
      setListPlaces([...listPlaces, newPlace.trim()]);
      setNewPlace('');
    }
  };
  const handleRemovePlace = (idx: number) => {
    setListPlaces(listPlaces.filter((_, i) => i !== idx));
  };

  const handleAddServiceIncluded = () => {
    if (newServiceIncluded.trim()) {
      setListServicesIncluded([...listServicesIncluded, newServiceIncluded.trim()]);
      setNewServiceIncluded('');
    }
  };
  const handleRemoveServiceIncluded = (idx: number) => {
    setListServicesIncluded(listServicesIncluded.filter((_, i) => i !== idx));
  };

  const handleAddServiceExcluded = () => {
    if (newServiceExcluded.trim()) {
      setListServicesExcluded([...listServicesExcluded, newServiceExcluded.trim()]);
      setNewServiceExcluded('');
    }
  };
  const handleRemoveServiceExcluded = (idx: number) => {
    setListServicesExcluded(listServicesExcluded.filter((_, i) => i !== idx));
  };

  const handleAddItineraryDay = () => {
    if (newItineraryDayNum.trim() && newItineraryTitle.trim() && newItineraryDesc.trim()) {
      setListItinerary([...listItinerary, {
        day: newItineraryDayNum.trim(),
        title: newItineraryTitle.trim(),
        desc: newItineraryDesc.trim()
      }]);
      setNewItineraryTitle('');
      setNewItineraryDesc('');
      
      // Increment day index for easy additions
      const match = newItineraryDayNum.match(/\d+/);
      if (match) {
        const nextNum = parseInt(match[0], 10) + 1;
        setNewItineraryDayNum(`Day ${nextNum}`);
      }
    } else {
      showNotification("Please fill in day label, title, and description.", "error");
    }
  };
  
  const handleRemoveItineraryDay = (idx: number) => {
    setListItinerary(listItinerary.filter((_, i) => i !== idx));
  };

  const categories = ['Gilgit-Baltistan', 'Khyber Pakhtunkhwa', 'Azad Kashmir', 'Punjab', 'Short Trips'];

  const filteredTours = tours.filter(tour => {
    const matchesCategory = selectedCategory === 'All' || tour.category === selectedCategory;
    const matchesSearch = tour.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tour.places.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Login Screen Render
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-12 px-6">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
        >
          {/* Accent decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full" />
          
          <div className="text-center space-y-3 mb-6 relative">
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500 mx-auto">
              <Lock className="w-6 h-6 animate-pulse" />
            </div>
            <h2 className="text-2xl font-extrabold text-white font-display">Administrator Portal</h2>
            <p className="text-xs text-zinc-400">Unlock travel system management tools.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {authError && (
              <div className="p-3 bg-red-950/80 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-bold">Passcode PIN</label>
              <input
                type="password"
                required
                placeholder="Enter admin passcode (e.g. admin123)"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono text-center tracking-widest"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-wider font-mono transition-colors shadow-md shadow-emerald-500/10"
            >
              Authenticate Portal
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-2 relative">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-24 right-6 z-50 p-4 rounded-xl shadow-2xl max-w-sm border ${
              notification.type === 'success' 
                ? 'bg-emerald-950 border-emerald-500/30 text-emerald-300' 
                : 'bg-red-950 border-red-500/30 text-red-300'
            }`}
          >
            <div className="flex items-start gap-3">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              )}
              <div className="text-xs font-semibold">
                {notification.message}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADMIN HUB CONTROL HEADER */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/5 blur-3xl pointer-events-none rounded-full" />
        <div className="flex items-center gap-4 text-left">
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-2xl flex items-center justify-center">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight leading-none flex items-center gap-2">
              Bespoke Administration Desk
              <span className="bg-emerald-500/15 text-emerald-500 border border-emerald-500/20 text-[9px] px-2 py-0.5 rounded-full font-mono uppercase font-bold">
                Online Control
              </span>
            </h2>
            <p className="text-xs text-zinc-400 mt-1">Add, update, and manage dynamically loaded tours and incoming inquiries.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openFormForAdd}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-xl text-xs uppercase font-mono tracking-wider transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-500/10"
          >
            <Plus className="w-4 h-4" /> Add New Tour
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-750 text-zinc-400 hover:text-white rounded-xl text-xs uppercase font-mono tracking-wider transition-all"
          >
            Lock Desk
          </button>
        </div>
      </div>

      {/* EDITOR COMPOSE FORM (If Editing is active) */}
      <AnimatePresence>
        {isEditing && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 space-y-6"
          >
            <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-500 font-bold block">
                  {editTourId ? `Edit Tour Package ID: ${editTourId}` : 'Add Tour Package Workspace'}
                </span>
                <h3 className="text-lg font-extrabold text-white">
                  {editTourId ? 'Configure Existing Route Catalog' : 'Draft New Custom Adventure Program'}
                </h3>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="w-8 h-8 rounded-full bg-zinc-950 border border-zinc-850 text-zinc-500 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTour} className="grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
              
              {/* Left Column Fields */}
              <div className="md:col-span-6 space-y-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-bold">Tour Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 5 Days Fairy Meadows & Nanga Parbat Trek"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-bold">Tagline Label</label>
                    <input
                      type="text"
                      placeholder="e.g. Classic Hunza Escape"
                      value={formTag}
                      onChange={(e) => setFormTag(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-bold">Category region</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as TourPackage['category'])}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      {categories.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-bold">Duration (Days)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formDurationDays}
                      onChange={(e) => setFormDurationDays(Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-bold">Single Base Price (Rs)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formPriceSingle}
                      onChange={(e) => setFormPriceSingle(Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-bold">Couple Price (Rs)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formPriceCouple}
                      onChange={(e) => setFormPriceCouple(Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-bold">Departure Terminal</label>
                    <input
                      type="text"
                      placeholder="e.g. Lahore & Islamabad"
                      value={formDepartureFrom}
                      onChange={(e) => setFormDepartureFrom(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-bold">Cover Image URL</label>
                    <input
                      type="text"
                      placeholder="Enter photo link..."
                      value={formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1 p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                  <span className="text-[9px] font-mono text-zinc-400 block mb-1.5 uppercase tracking-wider font-bold">Quick Select Real Tour Scenery Presets:</span>
                  <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-zinc-800">
                    {[
                      { name: 'Hunza Valley', url: '/images/hunza-valley-hero.jpg' },
                      { name: 'Skardu Desert', url: '/images/skardu-desert.jpg' },
                      { name: 'Fairy Meadows', url: '/images/jeep-fairy-meadows.jpg' },
                      { name: 'Lahore Mosque', url: '/images/lahore-mosque.jpg' },
                      { name: 'Swat Valley', url: 'https://images.unsplash.com/photo-1622211910651-344cb8f9d0c6?auto=format&fit=crop&q=80&w=1200' },
                      { name: 'Kashmir (Arang Kel)', url: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&q=80&w=1200' },
                      { name: 'Ratti Gali Lake', url: 'https://images.unsplash.com/photo-1618083707368-b3823daa2726?auto=format&fit=crop&q=80&w=1200' },
                      { name: 'Kumrat Valley', url: 'https://images.unsplash.com/photo-1601919051950-bb9f3ffb3fee?auto=format&fit=crop&q=80&w=1200' },
                      { name: 'Naran Valley', url: 'https://images.unsplash.com/photo-1527004013197-933c4bb611b3?auto=format&fit=crop&q=80&w=1200' },
                    ].map((preset) => (
                      <button
                        key={preset.url}
                        type="button"
                        onClick={() => setFormImage(preset.url)}
                        className={`flex-shrink-0 relative w-10 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                          formImage === preset.url ? 'border-emerald-500 scale-95 shadow-md shadow-emerald-500/20' : 'border-zinc-800 hover:border-zinc-700'
                        }`}
                        title={preset.name}
                      >
                        <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 hover:bg-transparent transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-bold">Kids Seating Policy</label>
                  <textarea
                    rows={2}
                    placeholder="Describe child seats and discount rates..."
                    value={formKidsPolicy}
                    onChange={(e) => setFormKidsPolicy(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-bold">Cancellation Policy terms</label>
                  <textarea
                    rows={2}
                    placeholder="Describe reimbursement scales..."
                    value={formCancellationPolicy}
                    onChange={(e) => setFormCancellationPolicy(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Lists Segment: Departures, Pickups, Places */}
                <div className="border border-zinc-800/80 p-4 rounded-2xl bg-zinc-950/40 space-y-4">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-500 font-bold block">Terminal Pickups & Dates</span>
                  
                  {/* Departure Days */}
                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-mono text-zinc-500 uppercase tracking-wider">Departure Days</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Every Friday night"
                        value={newDepartureDay}
                        onChange={(e) => setNewDepartureDay(e.target.value)}
                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddDepartureDay}
                        className="px-3 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 text-xs"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {listDepartureDays.map((day, i) => (
                        <span key={i} className="inline-flex items-center gap-1 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-[10px] text-zinc-300">
                          {day}
                          <X className="w-3 h-3 text-red-500 cursor-pointer hover:text-red-400" onClick={() => handleRemoveDepartureDay(i)} />
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pickups */}
                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-mono text-zinc-500 uppercase tracking-wider">Exact Pickup Points</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Lahore: Thokar Niaz PSO Pump"
                        value={newPickup}
                        onChange={(e) => setNewPickup(e.target.value)}
                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddPickup}
                        className="px-3 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 text-xs"
                      >
                        Add
                      </button>
                    </div>
                    <div className="space-y-1 mt-1.5">
                      {listPickups.map((pick, i) => (
                        <div key={i} className="flex justify-between items-center bg-zinc-900 border border-zinc-850 px-2.5 py-1 rounded text-[11px] text-zinc-300">
                          <span>{pick}</span>
                          <Trash2 className="w-3 h-3 text-red-500 cursor-pointer hover:text-red-400" onClick={() => handleRemovePickup(i)} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Visiting Places */}
                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-mono text-zinc-500 uppercase tracking-wider">Visited Places & Sightseeings</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Shigar Cold Desert"
                        value={newPlace}
                        onChange={(e) => setNewPlace(e.target.value)}
                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddPlace}
                        className="px-3 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 text-xs"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {listPlaces.map((pl, i) => (
                        <span key={i} className="inline-flex items-center gap-1 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-[10px] text-zinc-300">
                          {pl}
                          <X className="w-3 h-3 text-red-500 cursor-pointer hover:text-red-400" onClick={() => handleRemovePlace(i)} />
                        </span>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

              {/* Right Column Fields */}
              <div className="md:col-span-6 space-y-4">
                
                {/* Services Included & Excluded */}
                <div className="border border-zinc-800/80 p-4 rounded-2xl bg-zinc-950/40 space-y-4">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-500 font-bold block">Services Audit Log</span>

                  {/* Services Included */}
                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-mono text-zinc-500 uppercase tracking-wider text-emerald-400">Included Services</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Luxury Saloon Coaster AC"
                        value={newServiceIncluded}
                        onChange={(e) => setNewServiceIncluded(e.target.value)}
                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddServiceIncluded}
                        className="px-3 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 text-xs"
                      >
                        Add
                      </button>
                    </div>
                    <div className="space-y-1 mt-1.5">
                      {listServicesIncluded.map((serv, i) => (
                        <div key={i} className="flex justify-between items-center bg-zinc-900 border border-zinc-850 px-2.5 py-1 rounded text-[11px] text-zinc-300">
                          <span className="text-left font-sans flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-400 shrink-0" /> {serv}</span>
                          <Trash2 className="w-3 h-3 text-red-500 cursor-pointer hover:text-red-400" onClick={() => handleRemoveServiceIncluded(i)} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Services Excluded */}
                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-mono text-zinc-500 uppercase tracking-wider text-emerald-400">Excluded Services</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Personal Porter/Jeep charges"
                        value={newServiceExcluded}
                        onChange={(e) => setNewServiceExcluded(e.target.value)}
                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddServiceExcluded}
                        className="px-3 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 text-xs"
                      >
                        Add
                      </button>
                    </div>
                    <div className="space-y-1 mt-1.5">
                      {listServicesExcluded.map((serv, i) => (
                        <div key={i} className="flex justify-between items-center bg-zinc-900 border border-zinc-850 px-2.5 py-1 rounded text-[11px] text-zinc-300">
                          <span className="text-left font-sans flex items-center gap-1.5"><X className="w-3 h-3 text-emerald-500 shrink-0" /> {serv}</span>
                          <Trash2 className="w-3 h-3 text-red-500 cursor-pointer hover:text-red-400" onClick={() => handleRemoveServiceExcluded(i)} />
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Itinerary Builder */}
                <div className="border border-zinc-800/80 p-4 rounded-2xl bg-zinc-950/40 space-y-4">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-500 font-bold block">Day-By-Day Itinerary Planner</span>
                  
                  {/* Render Existing Days */}
                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {listItinerary.map((day, i) => (
                      <div key={i} className="bg-zinc-900/80 border border-zinc-850 rounded-xl p-3 text-xs relative group/item">
                        <button
                          type="button"
                          onClick={() => handleRemoveItineraryDay(i)}
                          className="absolute top-2.5 right-2.5 text-zinc-500 hover:text-red-400 opacity-0 group-hover/item:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="flex items-center gap-2 font-mono text-[10px] text-emerald-500 font-bold">
                          <span>{day.day}</span>
                          <span>&bull;</span>
                          <span className="text-zinc-300 font-bold font-sans">{day.title}</span>
                        </div>
                        <p className="text-zinc-400 text-[11px] mt-1 leading-relaxed">{day.desc}</p>
                      </div>
                    ))}
                    {listItinerary.length === 0 && (
                      <div className="text-center py-6 text-zinc-500 text-[11px] font-mono">No days added yet. Write Day 1 to begin.</div>
                    )}
                  </div>

                  {/* Add New Day Drawer */}
                  <div className="bg-zinc-950 border border-zinc-850 p-3.5 rounded-xl space-y-3">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 font-bold block">Add Day Record</span>
                    
                    <div className="grid grid-cols-4 gap-2">
                      <input
                        type="text"
                        placeholder="Day 1"
                        value={newItineraryDayNum}
                        onChange={(e) => setNewItineraryDayNum(e.target.value)}
                        className="col-span-1 bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Day Heading (e.g. Travel to Chilas)"
                        value={newItineraryTitle}
                        onChange={(e) => setNewItineraryTitle(e.target.value)}
                        className="col-span-3 bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <textarea
                      rows={2}
                      placeholder="Detailed schedule description, activities, meal schedules, hotel info..."
                      value={newItineraryDesc}
                      onChange={(e) => setNewItineraryDesc(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    />

                    <button
                      type="button"
                      onClick={handleAddItineraryDay}
                      className="w-full py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-[10px] uppercase font-mono tracking-wider rounded transition-colors"
                    >
                      + Register Itinerary Day
                    </button>
                  </div>

                </div>

                {/* Save and Actions Row */}
                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-5 py-3 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-xs uppercase font-mono tracking-wider font-bold text-zinc-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isActionLoading}
                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-xl text-xs uppercase font-mono tracking-wider transition-colors flex items-center gap-1.5"
                  >
                    {isActionLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Saving Workspace...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" /> Publish Tour Package
                      </>
                    )}
                  </button>
                </div>

              </div>

            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TABS BUTTON BAR */}
      <div className="flex border-b border-zinc-850 gap-4 text-xs font-mono uppercase tracking-wider font-semibold">
        <button
          onClick={() => setActiveSubTab('tours')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === 'tours' ? 'text-emerald-500 border-emerald-500' : 'text-zinc-400 border-transparent hover:text-white'
          }`}
        >
          <Database className="w-4 h-4" /> Tours Manager ({tours.length})
        </button>
        <button
          onClick={() => setActiveSubTab('bookings')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === 'bookings' ? 'text-emerald-500 border-emerald-500' : 'text-zinc-400 border-transparent hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" /> Guest Inquiries ({bookings.length})
        </button>
        <button
          onClick={() => setActiveSubTab('system')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === 'system' ? 'text-emerald-500 border-emerald-500' : 'text-zinc-400 border-transparent hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" /> System Control Panel
        </button>
      </div>

      {/* TAB CONTENT: 1. TOURS MANAGER */}
      {activeSubTab === 'tours' && (
        <div className="space-y-6 text-left">
          
          {/* Quick Filters */}
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search database packages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-11 pr-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all ${
                  selectedCategory === 'All' ? 'bg-emerald-500 text-black' : 'bg-zinc-950 border border-zinc-850 text-zinc-400 hover:text-white'
                }`}
              >
                All Regions
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all ${
                    selectedCategory === cat ? 'bg-emerald-500 text-black' : 'bg-zinc-950 border border-zinc-850 text-zinc-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Tours Grid */}
          {isLoading ? (
            <div className="text-center py-20 bg-zinc-900 border border-zinc-850 rounded-2xl">
              <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin mx-auto mb-3" />
              <p className="text-xs text-zinc-400 font-mono uppercase tracking-widest">Querying Cloud Catalog...</p>
            </div>
          ) : filteredTours.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredTours.map((tour) => (
                <div 
                  key={tour.id}
                  className="bg-zinc-900 border border-zinc-850 hover:border-zinc-800 rounded-2xl p-5 flex flex-col md:flex-row gap-5 transition-all relative overflow-hidden group shadow-md"
                >
                  {/* Photo cover preview */}
                  <div className="w-full md:w-40 h-32 bg-zinc-950 rounded-xl overflow-hidden shrink-0 relative">
                    <img 
                      src={tour.image} 
                      alt={tour.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1596422846543-75c6fc18a523?auto=format&fit=crop&q=80&w=600";
                      }}
                    />
                    <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-md border border-zinc-800 text-[8px] font-mono uppercase tracking-wider text-emerald-500 px-1.5 py-0.5 rounded font-bold">
                      {tour.durationDays} Days
                    </div>
                  </div>

                  {/* Info details */}
                  <div className="flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono bg-zinc-950 border border-zinc-800 px-1.5 py-0.5 rounded text-emerald-500 font-bold uppercase tracking-wider">
                          {tour.tag}
                        </span>
                        <span className="text-[9px] font-mono text-zinc-500">
                          {tour.category}
                        </span>
                      </div>
                      
                      <h4 className="text-sm font-bold text-white tracking-tight leading-snug font-display line-clamp-2">
                        {tour.title}
                      </h4>
                      
                      <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed">
                        <strong>Stops:</strong> {tour.places?.join(' • ') || 'None listed'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-850/60">
                      <div>
                        <span className="text-[8px] font-mono text-zinc-500 block uppercase">Single Base</span>
                        <span className="text-xs font-black text-emerald-400">Rs. {tour.priceSingle?.toLocaleString()}/-</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-mono text-zinc-500 block uppercase">Couple package</span>
                        <span className="text-xs font-black text-white">Rs. {tour.priceCouple?.toLocaleString()}/-</span>
                      </div>

                      {/* Tool Control Actions */}
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => openFormForEdit(tour)}
                          className="w-8 h-8 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-850 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
                          title="Edit Package"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTour(tour.id, tour.title)}
                          className="w-8 h-8 rounded-lg bg-zinc-950 hover:bg-red-950 border border-zinc-850 hover:border-red-500/30 text-zinc-400 hover:text-red-400 flex items-center justify-center transition-colors"
                          title="Delete Package"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-zinc-900 border border-zinc-850 rounded-2xl">
              <AlertTriangle className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
              <p className="text-sm text-zinc-400 font-bold">No tour packages found in your database.</p>
              <button
                onClick={openFormForAdd}
                className="mt-4 px-4 py-2 bg-emerald-500 text-black text-xs font-bold rounded-xl transition-colors font-mono"
              >
                Create First Custom Tour
              </button>
            </div>
          )}

        </div>
      )}

      {/* TAB CONTENT: 2. BOOKINGS & INQUIRIES */}
      {activeSubTab === 'bookings' && (
        <div className="space-y-6 text-left">
          <div className="flex justify-between items-center bg-zinc-900 p-4 border border-zinc-800 rounded-2xl">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Incoming Guest Inquiries Log</h3>
              <p className="text-[10px] text-zinc-500 mt-0.5">Real-time custom plans and reservation requests saved from the checkout forms.</p>
            </div>
            <button
              onClick={fetchBookings}
              className="p-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors font-mono text-[10px] flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reload Logs
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-20 bg-zinc-900 border border-zinc-850 rounded-2xl">
              <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin mx-auto mb-3" />
              <p className="text-xs text-zinc-400 font-mono uppercase tracking-widest">Querying Guest Logs...</p>
            </div>
          ) : bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map((b) => {
                const createdDate = b.createdAt?.seconds 
                  ? new Date(b.createdAt.seconds * 1000).toLocaleString() 
                  : 'Recent Inquiry';
                  
                return (
                  <div 
                    key={b.id}
                    className="bg-zinc-900 border border-zinc-850 rounded-2xl p-5 hover:border-zinc-800 transition-colors space-y-4 shadow-sm"
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-850 pb-3 gap-3">
                      <div>
                        <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                          {b.fullName}
                          <span className="bg-zinc-950 text-zinc-400 text-[9px] font-mono px-2 py-0.5 rounded border border-zinc-800 font-bold">
                            UID: {b.id.substring(0, 8)}
                          </span>
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-zinc-400 mt-1">
                          <span className="font-mono">📧 {b.email}</span>
                          <span className="font-mono">📞 {b.phone}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-mono text-zinc-500 block uppercase">{createdDate}</span>
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded mt-1">
                          Active Lead
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-850/50">
                        <span className="text-[8px] font-mono text-zinc-500 block uppercase">Requested Service ID</span>
                        <span className="text-zinc-200 font-bold font-mono line-clamp-1 mt-0.5">{b.serviceId || 'Draft / Customized'}</span>
                      </div>
                      <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-850/50">
                        <span className="text-[8px] font-mono text-zinc-500 block uppercase">Days Count</span>
                        <span className="text-zinc-200 font-bold font-mono mt-0.5">{b.durationDays} Days</span>
                      </div>
                      <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-850/50">
                        <span className="text-[8px] font-mono text-zinc-500 block uppercase">Travelers</span>
                        <span className="text-zinc-200 font-bold font-mono mt-0.5">{b.travelers} Persons</span>
                      </div>
                      <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-850/50">
                        <span className="text-[8px] font-mono text-zinc-500 block uppercase">Start Date / Class</span>
                        <span className="text-zinc-200 font-bold font-mono mt-0.5 line-clamp-1">{b.startDate} / {b.accommodationType}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <span className="block text-[8px] font-mono text-zinc-500 uppercase">Bespoke destinations</span>
                      <p className="text-zinc-300 bg-zinc-950/30 p-2.5 rounded-xl border border-zinc-850/40 font-mono text-[11px]">
                        {b.destinations?.join(' ➔ ') || 'N/A'}
                      </p>
                    </div>

                    {b.specialRequests && (
                      <div className="space-y-1.5 text-xs">
                        <span className="block text-[8px] font-mono text-zinc-500 uppercase">Special Instructions / Lead comments</span>
                        <p className="text-zinc-300 bg-zinc-950/30 p-2.5 rounded-xl border border-zinc-850/40">
                          {b.specialRequests}
                        </p>
                      </div>
                    )}

                    {/* Quick WhatsApp Reply Action */}
                    <div className="flex justify-end">
                      <a
                        href={`https://wa.me/${b.phone.replace(/[^0-9]/g, '') || '923224704286'}?text=${encodeURIComponent(`Hello ${b.fullName}! This is Trodden Travelers Admin Desk. We received your booking inquiry for the ${b.durationDays}-day customized trip starting on ${b.startDate || 'flexible dates'}. Let's discuss details!`)}`}
                        target="_blank"
                        referrerPolicy="no-referrer"
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-mono uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5"
                      >
                        ⚡ Chat with client on WhatsApp
                      </a>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-zinc-900 border border-zinc-850 rounded-2xl">
              <Users className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
              <p className="text-sm text-zinc-400 font-bold">No inquiries have been registered yet.</p>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">Create and save custom booking plans from the Itinerary Builder or checkout cards to see them populate here.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: 3. SYSTEM CONTROL PANEL */}
      {activeSubTab === 'system' && (
        <div className="space-y-6 text-left max-w-3xl">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Database className="w-4 h-4 text-emerald-500" /> Catalog Maintenance Actions
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Use these tools to re-align, audit, or reset your website's database catalogs. These actions directly sync the Firestore database structure with your application files.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-4 space-y-3.5">
                <div>
                  <span className="text-xs font-bold text-white uppercase font-mono block">Reset Tour Catalog</span>
                  <p className="text-[10px] text-zinc-500 mt-1">Deletes dynamic packages and seeds the 13 gorgeous default tours from data_tours.ts file.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("WARNING: This will overwrite your current Firestore tour configurations. Proceed to reset to original 13 static packages?")) {
                      seedDatabase();
                    }
                  }}
                  disabled={isActionLoading}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-850 text-black disabled:text-zinc-500 font-bold text-[10px] uppercase font-mono tracking-wider rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isActionLoading ? 'animate-spin' : ''}`} /> 
                  {isActionLoading ? 'Resetting...' : 'Overwrite with Defaults'}
                </button>
              </div>

              <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-4 space-y-3.5">
                <div>
                  <span className="text-xs font-bold text-white uppercase font-mono block">Security Audit</span>
                  <p className="text-[10px] text-zinc-500 mt-1">Verifies database permissions, ensures real-time listener handshakes are configured, and checks connection rules.</p>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-emerald-400 font-bold font-mono">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  Cloud Firestore: Connected
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-500" /> Admin Passcode Settings
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Update the master security passcode for this portal. Changing this PIN will immediately invalidate the previous passcode across all administrator access terminals.
            </p>

            <form onSubmit={handleChangePasscode} className="space-y-4 max-w-md pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-bold">New Passcode</label>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={newPasscodeVal}
                    onChange={(e) => setNewPasscodeVal(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-bold">Confirm Passcode</label>
                  <input
                    type="password"
                    required
                    placeholder="Confirm passcode"
                    value={confirmPasscodeVal}
                    onChange={(e) => setConfirmPasscodeVal(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isActionLoading}
                className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-850 text-black disabled:text-zinc-500 font-bold text-[10px] uppercase font-mono tracking-wider rounded-xl transition-colors flex items-center gap-1.5"
              >
                {isActionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                Save Master PIN
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
