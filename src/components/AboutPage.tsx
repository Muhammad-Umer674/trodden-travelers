import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Building, 
  Phone, 
  MapPin, 
  Copy, 
  Check, 
  CreditCard, 
  Award, 
  ShieldAlert, 
  Compass, 
  Sparkles,
  Users
} from 'lucide-react';

export default function AboutPage() {
  const [copiedState, setCopiedState] = useState<{ [key: string]: boolean }>({});

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedState(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopiedState(prev => ({ ...prev, [key]: false }));
    }, 2000);
  };

  const guides = [
    { name: "Asad Rehman", role: "Founder & Chief Expedition Officer", contact: "0322-4704286", location: "Lahore HQ" },
    { name: "Ali Sher", role: "Lead Mountain Handler (Baltistan)", contact: "Verified Crew", location: "Skardu base" },
    { name: "Zafar Iqbal", role: "Senior Escort & Cultural Expert (Hunza)", contact: "Verified Crew", location: "Karimabad office" }
  ];

  return (
    <div className="space-y-16 py-4">
      
      {/* Intro Hero banner */}
      <div className="relative rounded-3xl overflow-hidden bg-white border border-zinc-200 p-8 sm:p-12 shadow-xs flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-emerald-700 text-xs font-mono font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5 animate-spin-slow" /> A Government Registered Tourism Company
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight font-display">
            Trodden Travelers <span className="text-emerald-600">Pakistan</span>
          </h2>
          <p className="text-zinc-600 text-sm leading-relaxed">
            Welcome to the lap of snow-capped mountains. We are a registered travel and tourism facilitator in Pakistan, dedicated to curating unique, comfortable, and safe wilderness expeditions. Whether you join us as couples, bachelors, families, or solo travelers—our mission is to craft beautiful memories across the majestic heights of Hunza, Skardu, Fairy Meadows, Kumrat, Swat, and Azad Kashmir.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
              <Award className="w-4 h-4 text-emerald-600" /> Officially Registered
            </div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
              <ShieldAlert className="w-4 h-4 text-emerald-600" /> Safe Family Environment
            </div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
              <Users className="w-4 h-4 text-blue-600" /> Open Invitation Pakistan-Wide
            </div>
          </div>
        </div>
        
        <div className="w-full md:w-80 shrink-0 bg-zinc-50 p-6 rounded-2xl border border-zinc-100 space-y-4">
          <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-zinc-500 border-b border-zinc-200/80 pb-2">Direct Booking Hotlines</h4>
          <div className="space-y-3 font-mono">
            <div>
              <span className="text-[10px] text-zinc-400 font-bold block">Support Desk (EasyPaisa/JazzCash Desk)</span>
              <a href="tel:03224704286" className="block text-sm text-zinc-800 hover:text-emerald-600 transition-colors font-bold mt-0.5">
                📞 0322-4704286
              </a>
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 font-bold block">Support Desk (WhatsApp Hot)</span>
              <a href="https://wa.me/923224704286" target="_blank" referrerPolicy="no-referrer" className="block text-sm text-emerald-600 hover:text-emerald-700 transition-colors font-bold mt-0.5">
                💬 0322-4704286
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Meet the Founder & Crew */}
      <section className="space-y-6">
        <div className="border-l-4 border-emerald-500 pl-4">
          <h3 className="text-xl font-extrabold text-zinc-900 tracking-tight">Our Dedicated Field Crew</h3>
          <p className="text-xs text-zinc-500 mt-1">Led by certified professionals who live and breathe mountain safety and logistics.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {guides.map((g, idx) => (
            <div key={idx} className="bg-white border border-zinc-200 p-5 rounded-2xl space-y-3 relative overflow-hidden group hover:border-zinc-300 shadow-xs transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/5 to-transparent rounded-bl-full pointer-events-none" />
              <div>
                <h4 className="text-sm font-bold text-zinc-900 tracking-tight">{g.name}</h4>
                <span className="text-[10px] text-emerald-600 font-mono tracking-wider block mt-0.5">{g.role}</span>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Expert coordinator specialized in mountain navigation, vehicle logistics, first-aid assistance, and premium hotel setups.
              </p>
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-2 border-t border-zinc-100">
                <span>{g.location}</span>
                <span className="text-zinc-700 font-bold">{g.contact}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Payment Information */}
      <section className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        <div className="lg:col-span-5 space-y-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
            <CreditCard className="w-5.5 h-5.5" />
          </div>
          <h3 className="text-2xl font-extrabold text-zinc-900 tracking-tight font-display">
            Interactive Payment Guide
          </h3>
          <p className="text-xs text-zinc-500 leading-relaxed">
            We support multiple fast and secure local transaction options. For seat verification, a **30% booking advance** is required. Simply submit payment, take a screenshot of your receipt, and share it on WhatsApp.
          </p>
          <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-100 space-y-1.5">
            <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">Quick Booking Rule</span>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Remaining payment is collected at the time of departure at Lahore or Islamabad. Seats are booked on a first-come, first-served basis.
            </p>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-4">
          
          {/* EasyPaisa / JazzCash Box */}
          <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-200/60 hover:border-zinc-350 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h4 className="text-xs font-mono uppercase tracking-wider font-extrabold text-zinc-800">EasyPaisa & JazzCash</h4>
              </div>
              <div className="mt-2 text-sm font-bold text-zinc-800">
                A/C: <span className="font-mono text-emerald-600">0322-4704286</span>
              </div>
              <div className="text-[10px] text-zinc-400 font-mono mt-0.5 font-bold">Account Title: Asad Rehman</div>
            </div>
            <button
              onClick={() => handleCopy("03224704286", "mobile_ac")}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-zinc-100 text-zinc-700 hover:text-zinc-900 transition-colors text-xs font-mono font-bold flex items-center gap-1.5 border border-zinc-200 shadow-xs"
            >
              {copiedState["mobile_ac"] ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
              {copiedState["mobile_ac"] ? "Copied" : "Copy Account"}
            </button>
          </div>

          {/* HBL Bank Wire Box */}
          <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-200/60 hover:border-zinc-350 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <h4 className="text-xs font-mono uppercase tracking-wider font-extrabold text-zinc-800">Habib Bank Limited (HBL)</h4>
              </div>
              <div className="mt-2 text-sm font-bold text-zinc-800">
                A/C No: <span className="font-mono text-emerald-600">23057903015503</span>
              </div>
              <div className="text-[10px] text-zinc-400 font-mono mt-0.5 font-bold">Account Title: Asad Rehman</div>
            </div>
            <button
              onClick={() => handleCopy("23057903015503", "bank_ac")}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-zinc-100 text-zinc-700 hover:text-zinc-900 transition-colors text-xs font-mono font-bold flex items-center gap-1.5 border border-zinc-200 shadow-xs"
            >
              {copiedState["bank_ac"] ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
              {copiedState["bank_ac"] ? "Copied" : "Copy Number"}
            </button>
          </div>

          <div className="text-[10px] text-zinc-400 font-bold italic text-center font-mono">
            *Always confirm transaction screens with our team via WhatsApp 0322-4704286 right after transfer!
          </div>

        </div>

      </section>

    </div>
  );
}
