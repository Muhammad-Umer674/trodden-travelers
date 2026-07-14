import React from 'react';
import { 
  FileText, 
  UserX, 
  HelpCircle, 
  Clock, 
  CheckCircle, 
  Users, 
  Info,
  Layers,
  Sparkles,
  ShoppingBag
} from 'lucide-react';

export default function TermsPage() {
  const safetyGears = [
    { item: "Original CNIC", desc: "Mandatory for all checking points and army checkpoints in Northern areas." },
    { item: "Warm Clothes & Jackets", desc: "Temperatures can drop rapidly near glaciers, Babusar, Deosai or Khunjerab." },
    { item: "Joggers / Trekking Shoes", desc: "Non-slippery shoes or trekking boots are essential. No high-heels or dress shoes." },
    { item: "Water Bottle & Torch", desc: "Keep a personal flashlight/torch and reusable water bottle during treks." },
    { item: "Raincoat / Umbrella", desc: "Mountain weather is unpredictable. Keep a lightweight windcheater or raincoat." },
    { item: "Power Bank & Medications", desc: "Carry high-capacity power banks and your personal medication/first aid kits." }
  ];

  return (
    <div className="space-y-16 py-4">
      
      {/* Policy Introduction */}
      <div className="border-b border-zinc-200 pb-8 space-y-3">
        <div className="inline-flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 text-zinc-600 font-mono text-xs px-3 py-1 rounded-full">
          <FileText className="w-3.5 h-3.5 text-emerald-600" /> Trodden Travelers Tour Guides Manual
        </div>
        <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight font-display">
          Corporate Policies & Guidelines
        </h2>
        <p className="text-zinc-600 text-xs sm:text-sm max-w-3xl leading-relaxed">
          Please review our travel conditions, cancellation structures, and medical liabilities carefully before confirming your seat. By submitting your 30% advance deposit, you agree to these registered terms.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: Cancellation, Kids Policy & General Rules */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Cancellation Schedule */}
          <section className="bg-white border border-zinc-200 p-6 rounded-2xl space-y-4 shadow-xs">
            <h3 className="text-sm font-mono uppercase tracking-widest font-extrabold text-emerald-600 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Cancellation Refund Schedule
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              If you decide to cancel your seats due to personal emergencies or scheduling changes, refunds will be processed according to our verified time tiers:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs pt-2">
              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                <span className="text-zinc-500 font-bold block">7 Days Prior</span>
                <span className="text-lg font-black text-emerald-600 block mt-1">50% Deduction</span>
                <span className="text-[10px] text-zinc-400 block mt-1">Half of advance/package amount is refunded.</span>
              </div>
              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                <span className="text-zinc-500 font-bold block">3 Days Prior</span>
                <span className="text-lg font-black text-orange-600 block mt-1">75% Deduction</span>
                <span className="text-[10px] text-zinc-400 block mt-1">25% of total package cost is refunded.</span>
              </div>
              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                <span className="text-zinc-500 font-bold block">Less Than 3 Days</span>
                <span className="text-lg font-black text-red-600 block mt-1">100% Deduction</span>
                <span className="text-[10px] text-zinc-400 block mt-1">Strictly zero refund or adjustment.</span>
              </div>
            </div>
            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-[10px] text-emerald-700 leading-relaxed font-semibold">
              *Note: No refund will be granted if a member decides to leave the ongoing tour at any stage, regardless of circumstances.
            </div>
          </section>

          {/* Kids and Jumper Seat Policy */}
          <section className="bg-white border border-zinc-200 p-6 rounded-2xl space-y-4 shadow-xs">
            <h3 className="text-sm font-mono uppercase tracking-widest font-extrabold text-emerald-600 flex items-center gap-2">
              <Users className="w-4 h-4" /> Comprehensive Kids Policy
            </h3>
            <ul className="space-y-3 text-xs text-zinc-600">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-zinc-900 font-black block">Under 3 Years Old</strong>
                  <span>100% Free of charges, with seating arranged on parents' laps (no extra vehicle seat).</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-zinc-900 font-black block">3 to 8 Years Old</strong>
                  <span>Charged at a discounted rate (ranging from 50% to 70% based on specific routes). Kids are allocated folding/jumper seats inside Toyota Grand Cabins or Saloon Coasters.</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-zinc-900 font-black block">Above 8 Years Old</strong>
                  <span>Considered adult passengers. Fully charged with a separate full-sized seat.</span>
                </div>
              </li>
            </ul>
          </section>

          {/* Detailed Terms & Conditions list */}
          <section className="space-y-4">
            <h3 className="text-sm font-mono uppercase tracking-widest font-extrabold text-zinc-900 border-b border-zinc-200 pb-2">
              Standard Terms of Engagement
            </h3>
            <div className="space-y-3.5 text-xs text-zinc-600 leading-relaxed">
              <p>
                1. <strong>Intoxication & Drug Prohibition:</strong> Possession or consumption of alcohol, drugs, or illegal substances is strictly forbidden on our coaches, hotels, or campsite premises. Any individual caught engaging in such activities will be expelled immediately with zero refund.
              </p>
              <p>
                2. <strong>Smoking Guidelines:</strong> Smoking is strictly prohibited inside vehicles. Scheduled breaks enroute will be provided for smokers.
              </p>
              <p>
                3. <strong>Punctuality & Time Limits:</strong> Punctuality is strictly recommended. All participants must report 30 minutes prior to departure times. The guide reserves the right to initiate transport if a member fails to report on time.
              </p>
              <p>
                4. <strong>Unforeseen Catastrophes & Roadblocks:</strong> Mountain travels are subject to sudden landslides, political blockades, or extreme weather conditions. Any secondary expense (such as additional hotel stays, extra 4x4 jeep transfers) caused by landslides or road blocks will be cleared directly by participants, and is not covered by the company.
              </p>
              <p>
                5. <strong>Air Conditioning operational logic:</strong> On steep ascends in high-altitude terrain, the vehicle air conditioner may be turned off momentarily by drivers to prevent engine overheating.
              </p>
              <p>
                6. <strong>Fuel Price Adjustments:</strong> Per-head package prices may see slight adjustments if fuel prices change significantly before the departure date, even on confirmed bookings.
              </p>
              <p>
                7. <strong>Liability Disclaimer:</strong> The company serves as a facilitator and is not responsible for any personal injury, baggage loss, accidental damage, or helicopter emergency rescues. Medical emergencies will be managed with basic first aid.
              </p>
            </div>
          </section>

        </div>

        {/* Right column: Gear Checklist & Travel advisory */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Packing Gear Box */}
          <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100 space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-widest font-bold text-emerald-600 flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4" /> Recommended Packing List
            </h4>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              We highly advise our travel companions to pack these core items before boarding our luxury coasters:
            </p>
            
            <div className="space-y-4">
              {safetyGears.map((gear, i) => (
                <div key={i} className="space-y-1">
                  <h5 className="text-xs font-extrabold text-zinc-800 font-mono flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {gear.item}
                  </h5>
                  <p className="text-[11px] text-zinc-500 pl-3 border-l border-zinc-200 leading-relaxed">
                    {gear.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick FAQ / Note Card */}
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 space-y-2 shadow-xs">
            <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-blue-600" /> PRO TIP FOR TRAVELLERS
            </span>
            <p className="text-[11px] text-zinc-600 leading-relaxed">
              Keep original identity cards (CNIC) on top of your luggage as check posts enroute to Skardu, Kalam or Hunza verify all travelers before granting passage.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
