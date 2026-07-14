import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DESTINATIONS } from '../data';
import { Destination } from '../types';
import { MapPin, Compass, Thermometer, Calendar, Eye, ArrowRight, Sparkles } from 'lucide-react';

interface PakistanMapProps {
  onSelectDestination: (destId: string) => void;
  selectedDestinationId: string | null;
}

export default function PakistanMap({ onSelectDestination, selectedDestinationId }: PakistanMapProps) {
  const [hoveredDest, setHoveredDest] = useState<Destination | null>(null);

  const selectedDest = DESTINATIONS.find((d) => d.id === selectedDestinationId) || DESTINATIONS[0];

  // Helper to determine province background accents
  const getProvinceColor = (region: string) => {
    switch (region) {
      case 'Gilgit-Baltistan': return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
      case 'Khyber Pakhtunkhwa': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';
      case 'Punjab': return 'text-sky-500 bg-sky-500/10 border-sky-500/30';
      case 'Sindh': return 'text-red-400 bg-red-400/10 border-red-400/30';
      case 'Balochistan': return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
      default: return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/30';
    }
  };

  return (
    <div id="interactive-map" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Visual Interactive Map Canvas */}
      <div className="lg:col-span-7 bg-white rounded-3xl border border-zinc-200 p-6 relative shadow-sm overflow-hidden aspect-[4/3] w-full group">
        
        {/* Futuristic map grid lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#e4e4e7_1px,transparent_1px)] [background-size:16px_16px] opacity-60 pointer-events-none" />
        
        {/* Subtle glowing overlay */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-amber-100/40 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-emerald-100/40 rounded-full blur-[100px] pointer-events-none" />

        {/* Map Header */}
        <div className="absolute top-4 left-6 z-10 pointer-events-none">
          <span className="text-[10px] uppercase tracking-[0.25em] text-amber-600/90 font-mono flex items-center gap-1.5 font-bold">
            <Sparkles className="w-3 h-3 animate-pulse text-amber-500" /> Pakistan Travel Matrix
          </span>
          <h3 className="text-xl font-bold text-zinc-900 tracking-tight mt-1">
            Interactive Destination Radar
          </h3>
          <p className="text-xs text-zinc-500 mt-1">Click a glowing vector pin to explore regional routes.</p>
        </div>

        {/* Dynamic Hover Preview Bubble */}
        <AnimatePresence>
          {hoveredDest && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.95 }}
              className="absolute top-4 right-6 bg-white/95 border border-zinc-200 rounded-xl p-3 shadow-lg backdrop-blur-md z-20 w-52 pointer-events-none"
            >
              <img 
                src={hoveredDest.image} 
                alt={hoveredDest.name}
                referrerPolicy="no-referrer"
                className="w-full h-24 object-cover rounded-lg mb-2"
              />
              <span className="text-[9px] uppercase tracking-wider font-mono text-amber-600 font-bold block">
                {hoveredDest.region}
              </span>
              <h4 className="text-xs font-bold text-zinc-900 mt-0.5">{hoveredDest.name}</h4>
              <p className="text-[10px] text-zinc-500 mt-0.5 line-clamp-1 italic">{hoveredDest.tagline}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The Map Core Wrapper */}
        <div className="w-full h-full relative flex items-center justify-center pt-8">
          
          {/* Custom Stylized Outline of Pakistan */}
          <svg 
            viewBox="0 0 100 100" 
            className="w-full h-full max-h-[85%] text-zinc-300 opacity-90 select-none transition-all duration-500"
          >
            {/* Soft background connections/routes */}
            <g className="stroke-zinc-300 stroke-[0.75] stroke-dasharray-[2,2] fill-none">
              <path d="M 12 88 Q 28 61 48 56" /> {/* Gwadar to Lahore */}
              <path d="M 48 56 Q 38 45 28 34" /> {/* Lahore to Swat */}
              <path d="M 28 34 L 40 28" /> {/* Swat to Fairy Meadows */}
              <path d="M 40 28 L 45 15" /> {/* Fairy Meadows to Hunza */}
              <path d="M 45 15 L 58 22" /> {/* Hunza to Skardu */}
              <path d="M 58 22 L 48 56" /> {/* Skardu to Lahore */}
              <path d="M 12 88 Q 30 40 40 28" /> {/* Gwadar to Fairy Meadows */}
            </g>

            {/* Glowing active route indicator */}
            {selectedDest && (
              <motion.g 
                initial={{ strokeDashoffset: 100 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                className="stroke-amber-500 stroke-1 fill-none"
              >
                <circle 
                  cx={selectedDest.coordinates.x} 
                  cy={selectedDest.coordinates.y} 
                  r="6" 
                  className="fill-amber-500/10 animate-ping"
                />
              </motion.g>
            )}

            {/* Provinces Boundaries */}
            <g className="fill-none stroke-zinc-200 stroke-[0.5]">
              {/* Gilgit-Baltistan (North-East) */}
              <polygon points="35,10 65,15 65,28 45,35 35,28" className="hover:fill-amber-500/[0.01] transition-colors cursor-pointer" />
              {/* Khyber Pakhtunkhwa (North-West) */}
              <polygon points="20,20 35,10 35,28 25,45 15,35" className="hover:fill-emerald-500/[0.01] transition-colors cursor-pointer" />
              {/* Punjab (Center-East) */}
              <polygon points="35,28 45,35 65,28 55,65 35,55" className="hover:fill-sky-500/[0.01] transition-colors cursor-pointer" />
              {/* Balochistan (West/South-West) */}
              <polygon points="5,45 35,55 35,75 25,92 5,80" className="hover:fill-orange-500/[0.01] transition-colors cursor-pointer" />
              {/* Sindh (South-East) */}
              <polygon points="35,55 55,65 50,92 30,90" className="hover:fill-red-500/[0.01] transition-colors cursor-pointer" />
            </g>

            {/* Province labels styled inside SVG */}
            <text x="50" y="22" className="fill-zinc-400 font-mono text-[2.5px] tracking-widest font-bold">GILGIT-BALTISTAN</text>
            <text x="18" y="28" className="fill-zinc-400 font-mono text-[2.5px] tracking-widest font-bold">KPK</text>
            <text x="44" y="48" className="fill-zinc-400 font-mono text-[2.5px] tracking-widest font-bold">PUNJAB</text>
            <text x="14" y="66" className="fill-zinc-400 font-mono text-[2.5px] tracking-widest font-bold">BALOCHISTAN</text>
            <text x="38" y="78" className="fill-zinc-400 font-mono text-[2.5px] tracking-widest font-bold">SINDH</text>
          </svg>

          {/* Absolute HTML hotspots */}
          {DESTINATIONS.map((dest) => {
            const isSelected = selectedDestinationId === dest.id;
            const isHovered = hoveredDest?.id === dest.id;
            return (
              <button
                key={dest.id}
                id={`map-pin-${dest.id}`}
                onClick={() => onSelectDestination(dest.id)}
                onMouseEnter={() => setHoveredDest(dest)}
                onMouseLeave={() => setHoveredDest(null)}
                style={{ 
                  left: `${dest.coordinates.x}%`, 
                  top: `${dest.coordinates.y}%` 
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 focus:outline-none"
              >
                {/* Ping animation effect */}
                <span className="absolute flex h-6 w-6 pointer-events-none">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isSelected ? 'bg-amber-500' : 'bg-amber-500/40'
                  }`}></span>
                </span>

                {/* Styled Pin Marker */}
                <motion.div 
                  animate={{ 
                    scale: isSelected ? 1.25 : isHovered ? 1.15 : 1,
                    y: isSelected ? -2 : 0
                  }}
                  className={`relative p-2 rounded-full border shadow-md transition-all duration-300 ${
                    isSelected 
                      ? 'bg-amber-500 border-amber-400 text-black' 
                      : 'bg-white border-zinc-200 text-amber-500 hover:border-amber-500 shadow-xs'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                </motion.div>

                {/* Miniature label below pin */}
                <span className={`mt-1.5 px-2 py-0.5 rounded text-[9px] font-mono tracking-wider font-semibold shadow-xs transition-all ${
                  isSelected 
                    ? 'bg-amber-500 text-black font-extrabold' 
                    : 'bg-white/95 text-zinc-700 border border-zinc-200'
                }`}>
                  {dest.name.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
        
        {/* Map legend footer */}
        <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-[10px] text-zinc-400 font-mono border-t border-zinc-100 pt-3 pointer-events-none">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse inline-block" /> Travel Nodes Available</span>
          <span>Click Node to Select Destination</span>
        </div>
      </div>

      {/* Destination Details / Overview Panel */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        
        {/* Selected Destination Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDest.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[500px]"
          >
            {/* Top highlight image */}
            <div className="relative h-48 w-full overflow-hidden rounded-2xl mb-5 group">
              <img 
                src={selectedDest.image} 
                alt={selectedDest.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              
              {/* Region Label Tag */}
              <div className="absolute top-3 left-3">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider font-semibold border ${getProvinceColor(selectedDest.region)}`}>
                  {selectedDest.region}
                </span>
              </div>

              {/* Best Time Tag */}
              <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg border border-zinc-200/60 flex items-center gap-1 shadow-sm">
                <Calendar className="w-3 h-3 text-amber-500" />
                <span className="text-[10px] font-mono text-zinc-800 font-bold">Best: {selectedDest.bestTime}</span>
              </div>
            </div>

            {/* Body */}
            <div>
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-600" />
                <span className="text-xs uppercase tracking-widest text-amber-600 font-mono font-bold">Trodden Pick</span>
              </div>
              <h4 className="text-2xl font-extrabold text-zinc-900 tracking-tight mt-1">
                {selectedDest.name}
              </h4>
              <p className="text-xs italic text-zinc-500 mt-1 font-mono">{selectedDest.tagline}</p>
              
              <p className="text-sm text-zinc-600 mt-3.5 leading-relaxed">
                {selectedDest.description}
              </p>

              {/* Highlights section */}
              <div className="mt-5">
                <h5 className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-bold mb-2.5 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-amber-600" /> Primary Highlights:
                </h5>
                <ul className="grid grid-cols-1 gap-2">
                  {selectedDest.highlights.map((hl, i) => (
                    <li key={i} className="text-xs text-zinc-700 flex items-start gap-2 bg-zinc-50 p-2.5 rounded-lg border border-zinc-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <span>{hl}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="mt-6 pt-5 border-t border-zinc-100 flex flex-col sm:flex-row gap-3">
              <button
                id={`btn-itinerary-${selectedDest.id}`}
                onClick={() => {
                  const el = document.getElementById('itinerary-planner-section');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                    // Custom trigger to load destination in itinerary can be simulated
                    const selectEl = document.getElementById('planner-destination-select') as HTMLSelectElement;
                    if (selectEl) {
                      selectEl.value = selectedDest.id;
                      const event = new Event('change', { bubbles: true });
                      selectEl.dispatchEvent(event);
                    }
                  }
                }}
                className="flex-1 bg-amber-500 text-black hover:bg-amber-400 transition-colors font-extrabold text-xs uppercase tracking-wider py-4 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
              >
                Plan this Custom Trip <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
