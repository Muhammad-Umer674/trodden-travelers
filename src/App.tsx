/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import PakistanMap from './components/PakistanMap';
import ServicesGrid from './components/ServicesGrid';
import ItineraryPlanner from './components/ItineraryPlanner';
import ToursPage from './components/ToursPage';
import ReviewsPage from './components/ReviewsPage';
import AboutPage from './components/AboutPage';
import TermsPage from './components/TermsPage';
import AdminPanel from './components/AdminPanel';
import { DESTINATIONS, IMAGES } from './data';
import { TOUR_PACKAGES, normalizeTour } from './data_tours';
import { db } from './firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import logoUrl from './assets/images/logo_asset_1784026738185.jpg';
import { 
  Compass, 
  MapPin, 
  Plane, 
  Sparkles, 
  ShieldCheck, 
  Award, 
  HeartHandshake, 
  PhoneCall, 
  HelpCircle, 
  Star, 
  Menu, 
  X, 
  ArrowRight,
  ChevronRight,
  Clock,
  Navigation,
  FileText,
  MessageSquare,
  Image as ImageIcon,
  BookOpen,
  Info,
  Lock,
  Facebook,
  Instagram,
  Youtube,
  ShoppingBag
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedDestId, setSelectedDestId] = useState<string | null>('hunza');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [heroBgIdx, setHeroBgIdx] = useState(0);

  const heroSlides = [
    {
      img: IMAGES.hunza,
      title: 'Venture into the Shangri-La of Pakistan',
      tag: 'Hunza Valley & Karakoram Highway',
      desc: 'Behold the golden sun rising behind Mount Rakaposhi, walk ancient silk forts, and cross Attabad\'s turquoise waters.'
    },
    {
      img: IMAGES.skardu,
      title: 'Where Cold Deserts Meet Sky-High Giants',
      tag: 'Skardu & Baltistan Kingdoms',
      desc: 'Stand on the vast, high-altitude sands of Katpana, explore 17th-century palaces, and gaze upon K2\'s gateways.'
    },
    {
      img: IMAGES.jeep,
      title: 'Conquer the Untrodden Mountain Trails',
      tag: 'Fairy Meadows Off-Road Safari',
      desc: 'Board vintage 4x4 open Jeeps on rocky cliffside curves leading to green meadows at the direct foot of Nanga Parbat.'
    }
  ];

  const navigateToTab = (tabName: string) => {
    setActiveTab(tabName);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [tours, setTours] = useState<any[]>(TOUR_PACKAGES);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const q = query(collection(db, 'tours'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const fetched: any[] = [];
          querySnapshot.forEach(docSnap => {
            fetched.push(normalizeTour({ id: docSnap.id, ...docSnap.data() }));
          });
          setTours(fetched);
        }
      } catch (e) {
        console.error("Could not load Firestore tours for home page, using static defaults:", e);
      }
    };
    fetchTours();
  }, [activeTab]);

  // Autoplay hero background
  useEffect(() => {
    if (activeTab !== 'home') return;
    const interval = setInterval(() => {
      setHeroBgIdx((prev) => (prev + 1) % heroSlides.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-white text-zinc-800 font-sans selection:bg-emerald-100 selection:text-emerald-900 antialiased relative overflow-x-hidden">
      
      {/* FLOATING WHATSAPP BUTTON (BOTTOM-RIGHT) */}
      <a 
        href="https://wa.me/923224704286"
        target="_blank"
        rel="noopener noreferrer"
        referrerPolicy="no-referrer"
        className="fixed bottom-6 right-6 z-50 bg-emerald-500 hover:bg-emerald-600 text-white p-3.5 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 group cursor-pointer border border-emerald-400"
        title="Chat on WhatsApp"
      >
        <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.97C16.528 1.967 14.06 1.94 11.914 1.94c-5.438 0-9.863 4.374-9.867 9.802-.001 1.814.48 3.589 1.393 5.161L2.441 21.66l4.206-1.506zm8.13-5.495c-.3-.15-1.77-.875-2.045-.975s-.475-.15-.675.15-.775.975-.95 1.175-.35.225-.65.075c-.3-.15-1.265-.467-2.41-1.485-.89-.79-1.49-1.77-1.665-2.07-.175-.3-.02-.46.13-.61.135-.135.3-.35.45-.525.15-.175.2-.3.3-.5s.05-.375-.025-.525-.675-1.625-.925-2.225c-.244-.589-.48-.51-.66-.519-.17-.008-.365-.01-.56-.01s-.51.075-.775.35c-.265.275-1.01.99-1.01 2.415s1.035 2.785 1.18 2.985c.145.2 2.035 3.11 4.93 4.36.688.298 1.225.476 1.645.609.693.22 1.324.19 1.82.115.553-.083 1.7-.695 1.94-1.365.24-.67.24-1.24.17-1.365-.07-.125-.26-.2-.56-.35z"/>
        </svg>
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2.5 transition-all duration-300 text-xs font-mono font-extrabold whitespace-nowrap text-white">
          Chat With Us
        </span>
      </a>

      {/* Premium UI/UX glow spheres */}
      <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-emerald-500/[0.03] blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[40%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-emerald-500/[0.02] blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-emerald-500/[0.02] blur-[120px] pointer-events-none z-0" />
      
      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200/60 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Logo Brand */}
          <button 
            onClick={() => navigateToTab('home')}
            className="flex items-center gap-3 focus:outline-none group text-left"
          >
            <img 
              src={logoUrl} 
              className="w-12 h-12 rounded-xl object-cover border border-emerald-500/30 shadow-sm group-hover:scale-[1.03] transition-transform" 
              alt="Trodden Travelers Logo" 
            />
            <div>
              <h1 className="text-lg font-extrabold text-zinc-900 font-display tracking-tight leading-none flex items-center gap-1">
                Adventure With Bilal
              </h1>
              <span className="text-[10px] font-mono tracking-widest text-emerald-600 uppercase font-black">Mountains Are Calling</span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-mono uppercase tracking-wider font-semibold text-zinc-500">
            <button 
              onClick={() => navigateToTab('home')} 
              className={`py-1 transition-all border-b-2 ${activeTab === 'home' ? 'text-zinc-950 border-emerald-500 font-bold' : 'border-transparent hover:text-zinc-950'}`}
            >
              Home
            </button>
            <button 
              onClick={() => navigateToTab('tours')} 
              className={`py-1 transition-all border-b-2 ${activeTab === 'tours' ? 'text-zinc-950 border-emerald-500 font-bold' : 'border-transparent hover:text-zinc-950'}`}
            >
              Tour Packages
            </button>
            <button 
              onClick={() => navigateToTab('about')} 
              className={`py-1 transition-all border-b-2 ${activeTab === 'about' ? 'text-zinc-950 border-emerald-500 font-bold' : 'border-transparent hover:text-zinc-950'}`}
            >
              About Us
            </button>
            <button 
              onClick={() => navigateToTab('policies')} 
              className={`py-1 transition-all border-b-2 ${activeTab === 'policies' ? 'text-zinc-950 border-emerald-500 font-bold' : 'border-transparent hover:text-zinc-950'}`}
            >
              Terms & Policies
            </button>
            <button 
              onClick={() => navigateToTab('admin')} 
              className={`py-1 transition-all border-b-2 flex items-center gap-1.5 ${activeTab === 'admin' ? 'text-emerald-600 border-emerald-500 font-bold' : 'border-transparent hover:text-zinc-950'}`}
            >
              <Lock className="w-3.5 h-3.5" /> Admin
            </button>
          </nav>

          {/* Action Header Button */}
          <div className="hidden lg:flex items-center gap-4">
            <a 
              href="https://wa.me/923224704286"
              target="_blank"
              rel="noopener noreferrer"
              referrerPolicy="no-referrer"
              className="border-2 border-emerald-600 hover:bg-emerald-600 hover:text-white px-4 py-2 rounded-full text-emerald-700 text-xs font-mono font-black tracking-wider transition-all shadow-xs flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              +92 322 4704286
            </a>
            <button
              onClick={() => navigateToTab('tours')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-xs uppercase font-mono tracking-wider font-extrabold transition-all hover:scale-[1.02] shadow-sm"
            >
              Book Now
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-zinc-500 hover:text-zinc-900 transition-colors focus:outline-none"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-b border-zinc-200 absolute left-0 right-0 z-30 overflow-hidden shadow-lg"
          >
            <div className="px-6 py-8 flex flex-col gap-6 text-sm font-mono uppercase tracking-widest text-zinc-600">
              <button onClick={() => navigateToTab('home')} className={`text-left ${activeTab === 'home' ? 'text-emerald-600 font-bold' : ''}`}>Home</button>
              <button onClick={() => navigateToTab('tours')} className={`text-left ${activeTab === 'tours' ? 'text-emerald-600 font-bold' : ''}`}>Tour Packages</button>
              <button onClick={() => navigateToTab('about')} className={`text-left ${activeTab === 'about' ? 'text-emerald-600 font-bold' : ''}`}>About Us</button>
              <button onClick={() => navigateToTab('policies')} className={`text-left ${activeTab === 'policies' ? 'text-emerald-600 font-bold' : ''}`}>Terms & Policies</button>
              <button onClick={() => navigateToTab('admin')} className={`text-left flex items-center gap-2 ${activeTab === 'admin' ? 'text-emerald-600 font-bold' : ''}`}>
                <Lock className="w-4 h-4 text-emerald-500" /> Admin Panel
              </button>
              
              <div className="pt-6 border-t border-zinc-100 flex flex-col gap-4">
                <a 
                  href="https://wa.me/923224704286"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full border border-emerald-600 text-emerald-700 py-3 rounded-full text-center font-black uppercase text-xs font-mono tracking-wider shadow-xs hover:bg-emerald-50"
                >
                  +92 322 4704286
                </a>
                <button
                  onClick={() => navigateToTab('tours')}
                  className="w-full bg-emerald-600 text-white py-3 rounded-xl text-center font-extrabold uppercase text-xs font-mono tracking-wider shadow-sm"
                >
                  Book My Tour
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TAB CONTENT MULTIPAGE SYSTEM */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.35 }}
        >
          {activeTab === 'home' && (
            <>
              {/* HERO CAROUSEL */}
              <section className="relative h-[90vh] min-h-[600px] w-full flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={heroBgIdx}
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 1 }}
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${heroSlides[heroBgIdx].img})` }}
                    />
                  </AnimatePresence>
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-black/40 to-black/70" />
                </div>

                <div className="max-w-7xl mx-auto px-6 w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-10">
                  <div className="lg:col-span-8 space-y-6">
                    <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/40 px-3.5 py-1.5 rounded-full text-emerald-300">
                      <Sparkles className="w-4 h-4 animate-pulse text-emerald-400" />
                      <span className="text-xs font-mono uppercase tracking-widest font-bold text-emerald-200">
                        {heroSlides[heroBgIdx].tag}
                      </span>
                    </div>

                    <h2 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight font-display max-w-3xl">
                      {heroSlides[heroBgIdx].title.split(/(Shangri-La|Cold Deserts|Untrodden)/).map((part, i) => {
                        if (part === 'Shangri-La' || part === 'Cold Deserts' || part === 'Untrodden') {
                          return (
                            <span key={i} className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-emerald-300 font-black">
                              {part}
                            </span>
                          );
                        }
                        return part;
                      })}
                    </h2>

                    <p className="text-zinc-200 text-sm sm:text-base leading-relaxed max-w-xl">
                      {heroSlides[heroBgIdx].desc}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      <button
                        onClick={() => navigateToTab('tours')}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-4 px-8 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-lg hover:scale-[1.01]"
                      >
                        Explore Tour Packages <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="lg:col-span-4 flex lg:flex-col gap-3 justify-center lg:justify-start pt-6 lg:pt-0">
                    {heroSlides.map((slide, idx) => (
                      <button
                        key={idx}
                        onClick={() => setHeroBgIdx(idx)}
                        className={`p-4 rounded-xl border text-left transition-all focus:outline-none w-full max-w-[280px] lg:max-w-none ${
                          heroBgIdx === idx
                            ? 'bg-white/95 border-emerald-500 text-zinc-950 shadow-lg scale-[1.02]'
                            : 'bg-black/45 border-white/10 text-zinc-400 hover:text-white hover:border-white/30'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono">0{idx + 1}</span>
                          <span className="text-xs font-bold line-clamp-1">{slide.tag.split('&')[0]}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white to-transparent h-20 pointer-events-none" />
              </section>

              {/* HOME MAIN SECTION MAP & PLANNERS */}
              <main className="max-w-7xl mx-auto px-6 py-16 space-y-28">
                
                {/* TRUST SIGNALS */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-8 border-y border-zinc-200/60 py-10">
                  <div className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-zinc-100 shadow-xs">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-100">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900 uppercase tracking-wider font-display">100% Secure & Insured</h4>
                      <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                        Complete trip safety standards, certified rugged mountain drivers, and registered professional local guides.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-zinc-100 shadow-xs">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-100">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900 uppercase tracking-wider font-display">Government Registered</h4>
                      <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                        A legally licensed facilitator under the tourism ministry of Pakistan. Direct resort and local 4x4 offroad jeep partnerships.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-zinc-100 shadow-xs">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-100">
                      <HeartHandshake className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900 uppercase tracking-wider font-display">Instant WhatsApp Desk</h4>
                      <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                        Direct support link with our team (+92 322 4704286) to adjust schedules, confirm booking references, and custom tours.
                      </p>
                    </div>
                  </div>
                </section>

                {/* FEATURED TOURS (LIMIT 6) */}
                <section className="space-y-10">
                  <div className="text-center max-w-3xl mx-auto space-y-3">
                    <span className="text-xs uppercase tracking-widest text-emerald-600 font-mono font-bold bg-emerald-50 px-3.5 py-1.5 rounded-full">
                      Specially Curated Journeys
                    </span>
                    <h3 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight font-display">
                      Featured Tour Packages
                    </h3>
                    <p className="text-sm text-zinc-600 leading-relaxed">
                      Explore our most popular family plans and customized northern expeditions. Book with 100% confidence, secure local payments, and verified luxury logistics.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {tours.slice(0, 6).map((tour) => (
                      <div 
                        key={tour.id} 
                        className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-emerald-500/40 transition-all group flex flex-col h-full"
                      >
                        <div className="relative h-48 overflow-hidden bg-zinc-100">
                          <img 
                            src={tour.image} 
                            alt={tour.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLImageElement).onerror = null;
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1596422846543-75c6fc18a523?auto=format&fit=crop&q=80&w=1200';
                            }}
                          />
                          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md text-[10px] font-mono font-black uppercase tracking-wider text-emerald-700 px-2.5 py-1 rounded-md border border-emerald-100">
                            {tour.durationDays} Days
                          </div>
                          <div className="absolute top-3 right-3 bg-emerald-600 text-white text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded shadow-xs">
                            {tour.category}
                          </div>
                        </div>

                        <div className="p-5 flex flex-col flex-grow justify-between">
                          <div className="space-y-3">
                            <h4 className="text-sm font-extrabold text-zinc-900 group-hover:text-emerald-700 transition-colors line-clamp-2">
                              {tour.title}
                            </h4>
                            
                            <div className="flex flex-wrap gap-1.5">
                              {tour.places.slice(0, 4).map((place: string, idx: number) => (
                                <span key={idx} className="bg-zinc-50 border border-zinc-100 text-[10px] text-zinc-500 px-2 py-0.5 rounded">
                                  {place}
                                </span>
                              ))}
                              {tour.places.length > 4 && (
                                <span className="text-[10px] text-zinc-400 font-mono font-medium self-center pl-1">
                                  +{tour.places.length - 4} more
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="pt-5 mt-5 border-t border-zinc-100 flex items-center justify-between">
                            <div>
                              <span className="text-[9px] text-zinc-400 font-bold uppercase block tracking-wider">Starting From</span>
                              <span className="text-sm font-black text-emerald-600">Rs. {tour.priceSingle.toLocaleString()}/-</span>
                            </div>
                            <button 
                              onClick={() => {
                                setActiveTab('tours');
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="px-4 py-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-xl text-xs font-mono font-bold transition-all border border-emerald-100 flex items-center gap-1"
                            >
                              Details <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-center pt-4">
                    <button
                      onClick={() => {
                        setActiveTab('tours');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-8 py-4 rounded-xl text-xs uppercase tracking-wider font-mono shadow-md hover:scale-[1.01] transition-all"
                    >
                      View All Tours ({tours.length} Packages) <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </section>

                {/* WHY CHOOSE US (WHY USE) */}
                <section className="space-y-10 bg-emerald-500/[0.02] border border-emerald-500/10 rounded-3xl p-8 sm:p-12">
                  <div className="text-center max-w-2xl mx-auto space-y-3">
                    <span className="text-xs uppercase tracking-widest text-emerald-600 font-mono font-bold bg-white border border-emerald-200 px-3 py-1 rounded-full">
                      Our Credentials
                    </span>
                    <h3 className="text-3xl font-extrabold text-zinc-900 tracking-tight font-display">
                      Why Choose Trodden Travelers?
                    </h3>
                    <p className="text-sm text-zinc-600 leading-relaxed">
                      We set the benchmark for adventure travel in Pakistan. From family road trips to extreme treks, your comfort and safety are our highest priorities.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-zinc-200/60 shadow-xs space-y-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                        <ShieldCheck className="w-5.5 h-5.5" />
                      </div>
                      <h4 className="text-sm font-extrabold text-zinc-900">100% Insured & Safe</h4>
                      <p className="text-xs text-zinc-500 leading-relaxed">
                        Our drivers are certified mountain professionals, and all tours strictly adhere to government-licensed security protocols.
                      </p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-zinc-200/60 shadow-xs space-y-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                        <Award className="w-5.5 h-5.5" />
                      </div>
                      <h4 className="text-sm font-extrabold text-zinc-900">Registered Operator</h4>
                      <p className="text-xs text-zinc-500 leading-relaxed">
                        Licensed under the Ministry of Tourism in Pakistan. We run official partnerships with local resorts and 4x4 offroad jeep handlers.
                      </p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-zinc-200/60 shadow-xs space-y-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                        <Compass className="w-5.5 h-5.5" />
                      </div>
                      <h4 className="text-sm font-extrabold text-zinc-900">Tailored Flexibility</h4>
                      <p className="text-xs text-zinc-500 leading-relaxed">
                        We handle corporate trips and customized couple gateways. Simply name your budget and duration, and our team will craft it.
                      </p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-zinc-200/60 shadow-xs space-y-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                        <HeartHandshake className="w-5.5 h-5.5" />
                      </div>
                      <h4 className="text-sm font-extrabold text-zinc-900">Local Handlers & Guides</h4>
                      <p className="text-xs text-zinc-500 leading-relaxed">
                        We employ verified local cultural experts in Baltistan, Swat, and Hunza to guarantee deep localized knowledge and community support.
                      </p>
                    </div>
                  </div>
                </section>

                {/* DIRECT SUPPORT BANNER */}
                <section className="bg-gradient-to-r from-emerald-600 to-emerald-800 rounded-3xl p-8 sm:p-10 shadow-xl text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                  <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] rounded-full bg-white/10 blur-2xl pointer-events-none" />
                  <div className="space-y-3 relative z-10 max-w-2xl">
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] bg-black/10 px-3 py-1 rounded-full font-bold">24/7 Adventure Concierge</span>
                    <h3 className="text-2xl sm:text-3xl font-black tracking-tight font-display">
                      Need custom advice or direct booking?
                    </h3>
                    <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-sans font-medium">
                      Skip the forms and chat directly with our Travel Director on WhatsApp. We can customize any northern itinerary, book luxury flights, or arrange professional 4x4 safaris instantly.
                    </p>
                  </div>
                  <div className="shrink-0 relative z-10 w-full md:w-auto">
                    <a 
                      href="https://wa.me/923224704286" 
                      target="_blank"
                      referrerPolicy="no-referrer"
                      className="w-full md:w-auto bg-white hover:bg-zinc-50 text-emerald-950 transition-all py-4 px-8 rounded-xl text-xs uppercase tracking-wider font-mono font-bold flex items-center justify-center gap-2 hover:scale-[1.02] shadow-lg shadow-black/10"
                    >
                      <PhoneCall className="w-4 h-4 animate-bounce text-emerald-600" /> Start Live WhatsApp Chat
                    </a>
                  </div>
                </section>

              </main>
            </>
          )}

          {/* DYNAMIC TAB OUTLETS */}
          {activeTab !== 'home' && (
            <main className="max-w-7xl mx-auto px-6 py-10 min-h-[60vh]">
              {activeTab === 'tours' && <ToursPage />}
              {activeTab === 'about' && <AboutPage />}
              {activeTab === 'policies' && <TermsPage />}
              {activeTab === 'admin' && <AdminPanel />}
            </main>
          )}
        </motion.div>
      </AnimatePresence>

      {/* FOOTER */}
      <footer className="bg-zinc-100 border-t border-zinc-200/80 pt-16 pb-8 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-zinc-200">
          
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <img 
                src={logoUrl} 
                className="w-10 h-10 rounded-lg object-cover border border-emerald-500/20 shadow-xs" 
                alt="Trodden Travelers Logo" 
              />
              <h1 className="text-base font-extrabold text-zinc-900 font-display tracking-tight leading-none">
                Adventure With Bilal
              </h1>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed max-w-sm">
              Trodden Travelers is Pakistan’s leading boutique adventure and customized tourism operator. We curate extreme jeep treks, corporate retreats, domestic fly-in luxury plans, and family mountain escapes.
            </p>
            <div className="flex items-center gap-1 font-mono text-[10px] text-zinc-500">
              <span>Officially Verified Operator</span>
              <Star className="w-3 h-3 fill-emerald-500 text-emerald-500" />
              <Star className="w-3 h-3 fill-emerald-500 text-emerald-500" />
              <Star className="w-3 h-3 fill-emerald-500 text-emerald-500" />
              <Star className="w-3 h-3 fill-emerald-500 text-emerald-500" />
              <Star className="w-3 h-3 fill-emerald-500 text-emerald-500" />
            </div>
            
            {/* SOCIAL LINKS (IMPROVED AND MODERN) */}
            <div className="flex items-center gap-4 pt-2">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noreferrer" 
                className="w-8 h-8 rounded-full bg-white hover:bg-emerald-600 border border-zinc-200 hover:border-emerald-600 text-zinc-500 hover:text-white flex items-center justify-center transition-all shadow-xs"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noreferrer" 
                className="w-8 h-8 rounded-full bg-white hover:bg-emerald-600 border border-zinc-200 hover:border-emerald-600 text-zinc-500 hover:text-white flex items-center justify-center transition-all shadow-xs"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noreferrer" 
                className="w-8 h-8 rounded-full bg-white hover:bg-emerald-600 border border-zinc-200 hover:border-emerald-600 text-zinc-500 hover:text-white flex items-center justify-center transition-all shadow-xs"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="md:col-span-3 space-y-3.5">
            <h4 className="text-zinc-800 font-mono uppercase tracking-widest font-bold">Multipage Index</h4>
            <ul className="space-y-2 text-zinc-600">
              <li><button onClick={() => navigateToTab('home')} className="hover:text-emerald-600 transition-colors">Home</button></li>
              <li><button onClick={() => navigateToTab('tours')} className="hover:text-emerald-600 transition-colors">Tour Packages</button></li>
              <li><button onClick={() => navigateToTab('about')} className="hover:text-emerald-600 transition-colors">Payment Coordinates & Crew</button></li>
              <li><button onClick={() => navigateToTab('policies')} className="hover:text-emerald-600 transition-colors">Tours Conditions & Rules</button></li>
              <li><button onClick={() => navigateToTab('admin')} className="hover:text-emerald-600 text-zinc-500 transition-colors flex items-center gap-1 text-[11px] font-bold">🔒 Admin Console</button></li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-3.5">
            <h4 className="text-zinc-800 font-mono uppercase tracking-widest font-bold">WhatsApp Concierge Desk</h4>
            <p className="text-zinc-600 leading-relaxed">
              Have questions? Talk directly to our Booking Officer on WhatsApp for instant quote revisions, seat layouts, and flight confirmations.
            </p>
            <div className="space-y-1.5 font-mono">
              <a 
                href="https://wa.me/923224704286"
                target="_blank"
                referrerPolicy="no-referrer"
                className="text-zinc-900 hover:text-emerald-600 transition-colors font-bold block text-sm"
              >
                📞 +92 322 4704286 (03224704286)
              </a>
              <span className="block text-zinc-500 text-[10px]">Headquarters: Lahore & Gilgit, Pakistan</span>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-6 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[10px] text-zinc-500">
          <span>&copy; {new Date().getFullYear()} Trodden Travelers Pakistan. All adventure rights reserved.</span>
          <div className="flex gap-4">
            <a href="https://wa.me/923224704286" target="_blank" className="hover:text-zinc-800 transition-colors">WhatsApp Direct</a>
            <span>&bull;</span>
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-zinc-800 transition-colors">Back to Top &uarr;</button>
          </div>
        </div>
      </footer>

    </div>
  );
}
