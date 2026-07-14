import React from 'react';
import { SERVICES } from '../data';
import * as LucideIcons from 'lucide-react';

interface ServicesGridProps {
  onSelectService: (serviceId: string) => void;
}

export default function ServicesGrid({ onSelectService }: ServicesGridProps) {
  
  // Dynamic Icon Renderer
  const renderIcon = (iconName: string) => {
    // Dynamically retrieve the requested Lucide component
    const IconComponent = (LucideIcons as any)[iconName];
    if (!IconComponent) return <LucideIcons.HelpCircle className="w-6 h-6" />;
    return <IconComponent className="w-6 h-6 text-amber-500 group-hover:scale-110 transition-transform duration-300" />;
  };

  return (
    <div id="services-grid-section" className="space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs uppercase tracking-widest text-amber-500 font-mono font-bold flex items-center gap-1">
          <LucideIcons.Layers className="w-3.5 h-3.5" /> Full-Spectrum Services
        </span>
        <h3 className="text-3xl font-extrabold text-white tracking-tight mt-1.5">
          Our Specialised Offerings
        </h3>
        <p className="text-sm text-zinc-400 mt-2 max-w-xl">
          From extreme off-road Karakoram expeditions to luxury domestic flights, corporate retreats, and bespoke day trips. Choose your travel style.
        </p>
      </div>

      {/* Grid of Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {SERVICES.map((serv) => (
          <div
            key={serv.id}
            onClick={() => onSelectService(serv.id)}
            className="bg-zinc-900/40 hover:bg-zinc-900/70 border border-zinc-800/80 hover:border-amber-500/40 rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col justify-between"
          >
            <div>
              {/* Header Icon */}
              <div className="w-12 h-12 rounded-xl bg-zinc-950 flex items-center justify-center border border-zinc-800/85 mb-4 group-hover:border-amber-500/30 group-hover:shadow-lg group-hover:shadow-amber-500/5 transition-all">
                {renderIcon(serv.iconName)}
              </div>

              {/* Title & Category Badge */}
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-zinc-500">
                  {serv.category} Module
                </span>
                <h4 className="text-base font-extrabold text-zinc-100 group-hover:text-amber-500 transition-colors">
                  {serv.title}
                </h4>
              </div>

              {/* Body */}
              <p className="text-xs text-zinc-400 mt-2.5 leading-relaxed">
                {serv.description}
              </p>
            </div>

            {/* Micro action link */}
            <div className="mt-5 pt-3 border-t border-zinc-800/40 flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-500 group-hover:text-amber-500 font-bold transition-all">
              <span>Initialize Trip</span>
              <LucideIcons.ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
