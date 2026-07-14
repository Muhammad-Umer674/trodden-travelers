const FALLBACK_TOUR_IMAGE = 'https://images.unsplash.com/photo-1596422846543-75c6fc18a523?auto=format&fit=crop&q=80&w=1200';

// Firestore documents are only as complete as whatever was saved (e.g. a doc
// edited by hand in the Firebase console, or an older/partial record) — this
// guarantees every field the UI reads actually exists, so pages never crash
// with "Cannot read properties of undefined" and never lose a working image.
export function normalizeTour(raw: any): TourPackage {
  return {
    id: raw.id,
    title: raw.title || 'Untitled Tour',
    durationDays: raw.durationDays || 0,
    priceSingle: raw.priceSingle || 0,
    priceCouple: raw.priceCouple || 0,
    departureDays: Array.isArray(raw.departureDays) ? raw.departureDays : [],
    departureFrom: raw.departureFrom || '',
    pickups: Array.isArray(raw.pickups) ? raw.pickups : [],
    places: Array.isArray(raw.places) ? raw.places : [],
    servicesIncluded: Array.isArray(raw.servicesIncluded) ? raw.servicesIncluded : [],
    servicesExcluded: Array.isArray(raw.servicesExcluded) ? raw.servicesExcluded : [],
    itinerary: Array.isArray(raw.itinerary) ? raw.itinerary : [],
    kidsPolicy: raw.kidsPolicy || '',
    cancellationPolicy: raw.cancellationPolicy || '',
    image: raw.image && String(raw.image).trim() ? raw.image : FALLBACK_TOUR_IMAGE,
    tag: raw.tag || '',
    category: raw.category || 'Short Trips',
  };
}

export interface TourPackage {
  id: string;
  title: string;
  durationDays: number;
  priceSingle: number;
  priceCouple: number;
  departureDays: string[];
  departureFrom: string;
  pickups: string[];
  places: string[];
  servicesIncluded: string[];
  servicesExcluded: string[];
  itinerary: { day: string; title: string; desc: string }[];
  kidsPolicy: string;
  cancellationPolicy: string;
  image: string;
  tag: string;
  category: 'Gilgit-Baltistan' | 'Khyber Pakhtunkhwa' | 'Azad Kashmir' | 'Punjab' | 'Short Trips';
}

export const TOUR_PACKAGES: TourPackage[] = [
  {
    id: "tour-8d-hunza-skardu",
    title: "8 Days Tour to Hunza, Skardu, Naran & Babusar Top",
    tag: "Epic Northern Traverse",
    durationDays: 8,
    priceSingle: 33999,
    priceCouple: 85000,
    departureDays: ["Every Monday night", "Every Friday night"],
    departureFrom: "Lahore & Islamabad",
    category: "Gilgit-Baltistan",
    image: "/images/hunza-valley-hero.jpg",
    pickups: [
      "Lahore: PSO Petrol Pump, Thokar Niaz Baig",
      "Gujranwala: Laari Adda, Gujranwala",
      "Islamabad/Rawalpindi: 26 Number, Daewoo Bus Terminal"
    ],
    places: [
      "Balakot", "Hazara Motorway", "Saif Ul Malooq", "Lulusar Lake", "Babusar Top", 
      "Chilas", "Jaglot", "3 Mountain Junction", "Nanga Parbat View Point", "Rakaposhi View Point", 
      "Skardu Valley", "Shangrila Lake", "Upper Kachura Lake", "Shigar Cold Desert", 
      "Shigar Fort", "Manthoka Waterfall", "Sadpara Lake", "Basho Valley & Suspension Bridge", 
      "Altit or Baltit Fort", "Karimabad", "Hussaini Suspension Bridge", "Passu Cones", "Attabad Lake"
    ],
    servicesIncluded: [
      "Luxury Dedicated Transport (Saloon Coaster/Grand Cabin)",
      "Premium Stay (7 Nights Hotel Stay on 4-5 sharing or separate couple rooms)",
      "Hygienic meals (8 Breakfasts + 7 Dinners with BBQ and Biryani/Korma)",
      "Sightseeing, Entry points guidance",
      "Traditional Bonfire & BBQ dinner night",
      "Professional Tour Guide and Photography",
      "First Aid Box & Indoor travel games"
    ],
    servicesExcluded: [
      "Personal Clothing & Heavy Jackets",
      "Entry tickets/boating fares at Lakes & Forts",
      "Local 4x4 Jeep/Hiace fares (e.g., Saif-ul-Malook, Deosai/Basho)",
      "Extras due to landslides, road blocks, or political hurdles",
      "Hotel extras (Heaters, drinks, laundry, phone calls)",
      "Medical insurance and helicopter rescue coverage"
    ],
    itinerary: [
      { day: "Day 0", title: "Departure from Lahore", desc: "Gather at Thokar Niaz Baig at 10:00 PM. Board the luxury transport and start journey via motorway." },
      { day: "Day 1", title: "Islamabad pickup & Babusar top to Chilas", desc: "Pick Islamabad members at 5:30 AM. Travel through Hazara Motorway tunnels. Breakfast in Balakot. Sightseeing at Lulusar Lake and cross Babusar Top. Check-in and dinner in Chilas." },
      { day: "Day 2", title: "Chilas to Skardu via Indus River corridor", desc: "Depart Chilas at 9:00 AM. Stays at 3 Mountain Junction and Nanga Parbat view point. Arrive in Skardu. Overnight stay in Skardu." },
      { day: "Day 3", title: "Shigar Valley, Cold Desert & Manthoka", desc: "Explore Shigar cold desert dunes, ancient Shigar Fort, and beautiful Manthoka waterfall cascade. Drive back to Skardu for dinner and overnight stay." },
      { day: "Day 4", title: "Deosai Plains or Basho Valley expedition", desc: "Board 4x4 offroad jeeps. Visit Sadpara Lake, traverse high Deosai plains or lush Basho suspension bridge area. Return to hotel in Skardu." },
      { day: "Day 5", title: "Shangrila Lake to Hunza Valley", desc: "Walk around Shangrila Lake and boat on Upper Kachura. Leave Skardu and drive to beautiful Hunza. Check-in and rest at hotel." },
      { day: "Day 6", title: "Khunjerab Pass (Pak-China Border)", desc: "Whole day excursion. Boat across Attabad Lake, take pictures of Hussaini Bridge and Passu Cones. Reach Khunjerab Pass at 4,693m. Return to Hunza for night bazaar." },
      { day: "Day 7", title: "Altit/Baltit Forts & travel to Chilas/Naran", desc: "Visit royal gardens of Hunza and Altit/Baltit fort. Travel back toward Chilas/Naran with Rakaposhi sunset views. Dinner and night stay." },
      { day: "Day 8", title: "Saif-ul-Malook excursion & travel back home", desc: "Early morning jeep trek to Lake Saif-ul-Malook (optional). Breakfast in Naran. Drive back to Islamabad and Lahore. Arrive late night." }
    ],
    kidsPolicy: "Under 3 years: Free (lap seating). 3-8 years: 70% charges (jumper seat). 8+ years: Considered adults (fully charged).",
    cancellationPolicy: "7 days before departure: 50% deduction. 3 days before: 75% deduction. Less than 3 days: 100% deduction."
  },
  {
    id: "tour-6d-skardu-bashu",
    title: "6 Days Skardu, Bashu Valley & Naran Babusar Tour",
    tag: "Baltistan Wilderness",
    durationDays: 6,
    priceSingle: 29999,
    priceCouple: 70000,
    departureDays: ["Every Friday night", "Every Monday night"],
    departureFrom: "Lahore & Islamabad",
    category: "Gilgit-Baltistan",
    image: "/images/skardu-desert.jpg",
    pickups: [
      "Lahore: Thokar Niaz Baig PSO Pump",
      "Islamabad: Daewoo Terminal, 26 Number"
    ],
    places: [
      "Skardu Road", "Astagnala", "Indus River", "Shangrilla Resort", "Lower Kachura Lake", 
      "Upper Kachura Lake", "Sadpara Lake", "Mantoka Waterfall", "Shigar Valley", "Shigar Fort", 
      "Deosai National Park & Plains", "Sarfranga Cold Desert", "Karpocho Fort", "Organic Village", 
      "Chilas", "Nanga Parbat View", "Babusar Top", "Lulusar Lake", "Naran Bazar", "Saif Ul Malooq"
    ],
    servicesIncluded: [
      "Luxury air-conditioned Transport",
      "Accommodation (5 Nights stay on 4-5 sharing or separate couple room)",
      "6 Breakfasts + 5 Dinners (Hygienic standard meals)",
      "Dedicated tour guides and bonfire party",
      "First aid and photography assistance"
    ],
    servicesExcluded: [
      "Jeep charges for Deosai, Bashu, or Saif-ul-Malook",
      "Boating, entry tickets to Shangrila or Shigar Fort",
      "Laundry, personal porter, drinks, heaters"
    ],
    itinerary: [
      { day: "Day 0", title: "Departure", desc: "Leave Lahore at 10:00 PM on Friday/Monday night." },
      { day: "Day 1", title: "Travel to Chilas via Babusar", desc: "Pick members at Islamabad at 5:15 AM. Travel through Hazara tunnels, breakfast at Balakot, visit Lulusar Lake, cross Babusar Top to reach Chilas hotel." },
      { day: "Day 2", title: "Chilas to Skardu Valley", desc: "Drive along the newly built Indus River gorge road. View Shangrila Resort and Upper Kachura Lake. Arrive Skardu for hotel check-in." },
      { day: "Day 3", title: "Manthokha Waterfall & Shigar", desc: "Visit beautiful Shigar cold desert dunes, heritage Shigar Fort, and the high cascade of Manthokha waterfall." },
      { day: "Day 4", title: "Sadpara, Deosai or Bashu Valley", desc: "Embark on 4x4 jeeps to explore cold, high altitude Deosai plains or green wood bridges of Bashu Valley." },
      { day: "Day 5", title: "Return to Chilas/Naran", desc: "Drive back with stops at 3M junction and Nanga Parbat point. Arrive at Chilas or Naran for overnight." },
      { day: "Day 6", title: "Saif-ul-Malook & return to Lahore", desc: "Optional early morning jeep ride to Saif-ul-Malook lake. Return for breakfast and drive back to Lahore." }
    ],
    kidsPolicy: "Under 3 years: Free. 3-8 years: 70% charges (jumper seat). 8+ years: Considered adults.",
    cancellationPolicy: "7 days before: 50% deduction. 3 days before: 75% deduction. Less than 3 days: 100% deduction."
  },
  {
    id: "tour-5d-hunza-khunjerab",
    title: "5 Days Hunza, Khunjerab Pass & Naran Babusar",
    tag: "Classic Hunza Escape",
    durationDays: 5,
    priceSingle: 25999,
    priceCouple: 65000,
    departureDays: ["Every Tuesday night", "Every Friday night"],
    departureFrom: "Lahore & Islamabad",
    category: "Gilgit-Baltistan",
    image: "/images/hunza-valley-hero.jpg",
    pickups: ["Lahore Thokar PSO", "Islamabad 26 Number Daewoo"],
    places: [
      "Balakot", "Lulusar Lake", "Babusar Top", "Chilas", "3M Junction", "Nanga Parbat View", 
      "Nomal Valley", "Naltar Valley", "Altit Fort", "Baltit Fort", "Passu Cones", 
      "Hussaini Suspension Bridge", "Attabad Lake", "Khunjerab Pass (China Border)", "Sost"
    ],
    servicesIncluded: [
      "Luxury Transport", "4 Nights Hotel Stay", "5 Breakfasts + 4 Dinners", 
      "Tour Guide, Bonfire, Group photography, First Aid"
    ],
    servicesExcluded: [
      "Naltar Valley 4x4 Jeep charges", "Fort entry tickets", "Meals other than mentioned"
    ],
    itinerary: [
      { day: "Day 0", title: "Departure", desc: "Depart Lahore late at 10:00 PM." },
      { day: "Day 1", title: "Lahore to Chilas", desc: "Breakfast in Balakot. Drive via Babusar Top and Lulusar Lake. Arrive in Chilas for dinner and stay." },
      { day: "Day 2", title: "Chilas to Hunza via Naltar/Nomal", desc: "Depart for Hunza. Short stays at 3M junction. Optional jeep ride to Naltar Valley lakes. Arrive Hunza for hotel transfer." },
      { day: "Day 3", title: "Attabad Lake & Khunjerab China Border", desc: "Drive to China Border. Cross Attabad Lake tunnels, Hussaini bridge, Passu Cones, Sost. Back to Hunza for bonfire." },
      { day: "Day 4", title: "Altit/Baltit Forts & travel to Chilas/Naran", desc: "Visit Altit/Baltit Fort. Stop at Rakaposhi view point. Travel to Chilas/Naran for night stay." },
      { day: "Day 5", title: "Return to Islamabad & Lahore", desc: "Early jeep ride to Saif-ul-Malook (optional), breakfast, drive back to Islamabad/Lahore." }
    ],
    kidsPolicy: "Under 3 years: Free. 3-8 years: 70% charges. 8+ years: Fully charged.",
    cancellationPolicy: "7 days before: 50% deduction. 3 days before: 75% deduction. Less than 3 days: 100% deduction."
  },
  {
    id: "tour-5d-fairy-meadows",
    title: "5 Days Fairy Meadows, Nanga Parbat & Beyal Camp",
    tag: "Trekker's Paradise",
    durationDays: 5,
    priceSingle: 25999,
    priceCouple: 65000,
    departureDays: ["Every Friday night"],
    departureFrom: "Lahore & Islamabad",
    category: "Gilgit-Baltistan",
    image: "/images/jeep-fairy-meadows.jpg",
    pickups: ["Lahore Thokar PSO", "Islamabad Daewoo Terminal"],
    places: [
      "Abbotabad", "Balakot", "Hazara Tunnels", "Raikot Bridge", "Tattu Village", 
      "Fairy Meadows", "Nanga Parbat View Point", "Beyal Camp", "Chilas", "Naran", "Saif Ul Malooq"
    ],
    servicesIncluded: [
      "Luxury AC Transport", "4 Nights Accommodations (Huts/Camps at Meadows)", 
      "5 Breakfasts + 4 Dinners", "Bonfire facing Nanga Parbat, photography, Tour Guide"
    ],
    servicesExcluded: [
      "Jeep ride from Raikot Bridge to Tattu Village", "Porters, horse hires for trek"
    ],
    itinerary: [
      { day: "Day 0", title: "Departure", desc: "Leave Lahore at 10:00 PM on Friday." },
      { day: "Day 1", title: "Lahore to Chilas", desc: "Travel via Babusar Top and Lulusar Lake. Arrive in Chilas for dinner and stay." },
      { day: "Day 2", title: "Chilas to Fairy Meadows", desc: "Drive to Raikot Bridge, board thrilling 4x4 open-top jeeps to Tattu Village. Begin the beautiful 3-hour hike to Fairy Meadows. Bonfire in front of Nanga Parbat." },
      { day: "Day 3", title: "Trek to Beyal Camp & Nanga Parbat Viewpoint", desc: "Hike to beautiful Beyal Camp and Nanga Parbat view point. Return to Fairy Meadows wooden cabins for dinner." },
      { day: "Day 4", title: "Descend to Tattu & travel to Chilas/Naran", desc: "Trek back down to Tattu, take jeeps to Raikot, and drive back to Chilas or Naran. Overnight stay." },
      { day: "Day 5", title: "Return drive to Lahore", desc: "Optional Saif-ul-Malook trek, breakfast, travel back to Islamabad/Lahore." }
    ],
    kidsPolicy: "Under 3: Free. 3-8: 70% charges. 8+: Fully charged.",
    cancellationPolicy: "50% deduction 7 days prior. 75% 3 days prior. 100% less than 3 days."
  },
  {
    id: "tour-4d-kumrat",
    title: "4 Days Kumrat Valley & Jahaz Banda Katora Lake",
    tag: "Primal Forests & Lakes",
    durationDays: 4,
    priceSingle: 22000,
    priceCouple: 32000, // 22,000 + 10,000 camp
    departureDays: ["Every Wednesday night"],
    departureFrom: "Lahore & Islamabad",
    category: "Khyber Pakhtunkhwa",
    image: "https://images.unsplash.com/photo-1601919051950-bb9f3ffb3fee?auto=format&fit=crop&q=80&w=600",
    pickups: ["Lahore Thokar PSO", "Islamabad Daewoo Terminal"],
    places: ["Chakdara", "Upper Dir", "Timergara", "Thal Village", "Kumrat Valley & Jungle", "Panjkora River", "Two Abshars", "Jahaz Banda", "Katora Lake"],
    servicesIncluded: ["Luxury Coaster/Cabin", "Excellent Camping Equipments", "4 Breakfasts + 3 Dinners (BBQ/Karahi)", "Bonfire, Outdoor games, guide"],
    servicesExcluded: ["Jeep expenses in Kumrat", "Porter tips", "Extra hotel/camp costs"],
    itinerary: [
      { day: "Day 0", title: "Departure", desc: "Leave Lahore at 10:00 PM on Wednesday." },
      { day: "Day 1", title: "Islamabad to Kumrat Valley via Thal", desc: "Pick Islamabad members. Breakfast at Timergara. Transfer to 4x4 jeeps in Thal for Kumrat Valley. Setup camps, riverside musical bonfire." },
      { day: "Day 2", title: "Kumrat Jungle & Jahaz Banda Trek", desc: "Explore Kumrat waterfalls and Kala Chashma. Drive back to Thal, head to Gaamsher and hike 3-4 hours to Jahaz Banda meadows. Night stay in camps." },
      { day: "Day 3", title: "Trekking to Katora Lake", desc: "Trek 3-4 hours to the spectacular emerald Katora Lake. Return to Jahaz Banda meadows for bonfire and dinner." },
      { day: "Day 4", title: "Jahaz Banda to Lahore", desc: "Hike back to Thal, drive back to Islamabad/Lahore with dinner enroute." }
    ],
    kidsPolicy: "Under 5: Free. 5-8: 70% charges (jumper seat). 8+: Fully charged.",
    cancellationPolicy: "7 days: 50%. 3 days: 75%. <3 days: 100% deduction."
  },
  {
    id: "tour-4d-neelum-valley",
    title: "4 Days Azad Kashmir: Taobatt, Arang Kel & Neelum Valley",
    tag: "Kashmir Emerald Trails",
    durationDays: 4,
    priceSingle: 19999,
    priceCouple: 28999, // 19999 + 9000
    departureDays: ["Every Monday night", "Every Thursday night"],
    departureFrom: "Lahore & Islamabad",
    category: "Azad Kashmir",
    image: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&q=80&w=600",
    pickups: ["Lahore Thokar", "Islamabad Faizabad"],
    places: [
      "Neelum Valley", "AthMuqam", "Kutton Waterfall", "Dhani Waterfall", "Kel", 
      "Arang Kel", "Taobatt & Taobat Baala", "Keran LOC", "Upper Neelam", "Taobat Bridge"
    ],
    servicesIncluded: [
      "Luxury Transport", "3 Nights Hotel Stay", "4 Breakfasts + 3 Dinners", 
      "Bonfire, BBQ, photography, first aid, tour guide"
    ],
    servicesExcluded: [
      "Taobatt 4x4 Jeep/Hiace cost", "Cable car fares at Kel", "Personal heavy jackets"
    ],
    itinerary: [
      { day: "Day 0", title: "Departure", desc: "Leave Lahore at 10:00 PM." },
      { day: "Day 1", title: "Lahore to Sharda/Keran", desc: "Pick Islamabad members. Breakfast in Muzaffarabad. Visit Dhani & Kutton waterfalls. Sightseeing LOC Chalhana. Stay at Sharda/Keran." },
      { day: "Day 2", title: "Excursion to Taobatt", desc: "Board 4x4 jeeps. Visit Sardari, Phulwai, and breathtaking Taobatt. Return to hotel for night stay." },
      { day: "Day 3", title: "Arang Kel Cable Car & Meadows Hike", desc: "Travel to Kel. Ride the local cable car and hike 40 minutes to Arang Kel meadows (360-degree mountain view point). Return to hotel for bonfire and BBQ." },
      { day: "Day 4", title: "Return to Islamabad/Lahore", desc: "Breakfast. Drive back via Muzaffarabad and Kohala Bridge. Arrive home late night." }
    ],
    kidsPolicy: "Under 3: Free. 3-8: 70% charges. 8+: Considered adults.",
    cancellationPolicy: "50% deduction 7 days prior. 75% 3 days prior. 100% less than 3 days."
  },
  {
    id: "tour-3d-kumrat",
    title: "3 Days Tour to Kumrat Valley & Thal Forest",
    tag: "Ancient Thal & Jungle Trek",
    durationDays: 3,
    priceSingle: 18500,
    priceCouple: 38000,
    departureDays: ["Every Monday night", "Every Thursday night"],
    departureFrom: "Lahore & Islamabad",
    category: "Khyber Pakhtunkhwa",
    image: "https://images.unsplash.com/photo-1562016600-ece13e8ba570?auto=format&fit=crop&q=80&w=600",
    pickups: ["Lahore Thokar Niaz PSO", "Islamabad 26 Number Daewoo"],
    places: ["Chakdara", "Upper Dir", "Thal Village & Old Masjid", "Kumrat Valley", "Kumrat Jungle", "Kala Chashma", "Two Waterfalls", "Panjkora River"],
    servicesIncluded: ["Luxury Coaster/Cabin", "2 Nights Hotel Stay", "3 Breakfasts + 2 Dinners", "Bonfire, BBQ, guide, photography"],
    servicesExcluded: ["Jeep charges to Kumrat Jungle waterfalls", "Hotel laundry, heaters"],
    itinerary: [
      { day: "Day 0", title: "Departure", desc: "Leave Lahore at 10:00 PM." },
      { day: "Day 1", title: "Lahore to Kumrat", desc: "Breakfast at Timergara. Reach Thal Village. Visit historic Thal wood mosque. Shift to jeeps for Kumrat Valley. Hotel stay." },
      { day: "Day 2", title: "Kumrat Jungle & Waterfall Exploration", desc: "Explore Kumrat jungle, massive waterfalls, and cold water of Kala Chashma. Dinner and riverside bonfire." },
      { day: "Day 3", title: "Return to Lahore", desc: "Travel back via Dir and Chakdara. Reach Islamabad in evening, Lahore late night." }
    ],
    kidsPolicy: "Under 3: Free. 3-8: 70% charges with jumper. 8+: Considered adults.",
    cancellationPolicy: "7 days: 50%. 3 days: 75%. <3 days: 100%."
  },
  {
    id: "tour-3d-ratti-gali",
    title: "3 Days Ratti Gali Lake Azad Kashmir Tour",
    tag: "The Alpine Turquoise Jewel",
    durationDays: 3,
    priceSingle: 16000,
    priceCouple: 38000,
    departureDays: ["Every Monday night", "Every Thursday night"],
    departureFrom: "Lahore & Islamabad",
    category: "Azad Kashmir",
    image: "https://images.unsplash.com/photo-1618083707368-b3823daa2726?auto=format&fit=crop&q=80&w=600",
    pickups: ["Lahore Thokar PSO", "Islamabad Faizabad"],
    places: ["Neelum Valley", "Dhani Waterfall", "Kutton Waterfall", "LOC Chalhana", "Keran", "Dewariyan", "Ratti Gali Lake Base camp & Lake"],
    servicesIncluded: ["Luxury Transport", "2 Nights Hotel Stay", "3 Breakfasts + 2 Dinners", "Bonfire with music, first aid, guide"],
    servicesExcluded: ["Jeep charges from Dewarian to Ratti Gali base camp", "Horses/porter hire at lake"],
    itinerary: [
      { day: "Day 0", title: "Departure", desc: "Leave Lahore at 10:00 PM." },
      { day: "Day 1", title: "Lahore to Keran", desc: "Pick Islamabad members. Breakfast in Muzaffarabad. Visit Dhani & Kutton waterfalls. Overnight in Keran near LOC river corridor." },
      { day: "Day 2", title: "Ratti Gali Lake excursion", desc: "Drive to Dewarian. Board 4x4 jeeps to climb up to Ratti Gali basecamp. Hike or ride horses to the high alpine turquoise lake. Return to Keran for BBQ bonfire." },
      { day: "Day 3", title: "Return to Islamabad/Lahore", desc: "Breakfast. Drive back. Stays at Kohala bridge. Reach Lahore late night." }
    ],
    kidsPolicy: "Under 3: Free. 3-8: 70% charges. 8+: Fully charged.",
    cancellationPolicy: "50% deduction 7 days prior. 75% 3 days prior. 100% less than 3 days."
  },
  {
    id: "tour-3d-swat-kalam",
    title: "3 Days Swat, Kalam Valley & Malam Jabba Ski Resort",
    tag: "East Switzerland Escapes",
    durationDays: 3,
    priceSingle: 16999,
    priceCouple: 40000,
    departureDays: ["Every Monday night", "Every Thursday night"],
    departureFrom: "Lahore & Islamabad",
    category: "Khyber Pakhtunkhwa",
    image: "https://images.unsplash.com/photo-1622211910651-344cb8f9d0c6?auto=format&fit=crop&q=80&w=600",
    pickups: ["Lahore Thokar PSO", "Islamabad Daewoo 26 Number"],
    places: ["Swat", "Swat Motorway Tunnels", "Kalam Valley", "Malam Jabba Ski Resort", "Ushu Forest & Bridge", "Mohdand Lake", "Paloga Village", "Fizzaghat"],
    servicesIncluded: ["Luxury Transport", "2 Nights Hotel Stay", "3 Breakfasts + 2 Dinners (BBQ/Karahi)", "Bonfire & Music night, tour guide"],
    servicesExcluded: ["Malam Jabba chairlift/zipline entry", "Jeep charges to Mahodand Lake"],
    itinerary: [
      { day: "Day 0", title: "Departure", desc: "Leave Lahore at 10:00 PM." },
      { day: "Day 1", title: "Malam Jabba skiing/chairlift to Kalam", desc: "Pick Islamabad members at 5:30 AM. Breakfast at Mingora. Drive to Malam Jabba Ski Resort for snow activities and chairlift. Overnight in Behrain/Kalam." },
      { day: "Day 2", title: "Ushu Forest & Mahodand Lake", desc: "Take jeeps to explore dense pine woods of Ushu Forest and boat on the alpine Mahodand Lake. Return to Kalam for bonfire." },
      { day: "Day 3", title: "Kalam to Lahore", desc: "Breakfast, drive back via Swat Motorway. Reach Lahore late night." }
    ],
    kidsPolicy: "Under 3: Free. 3-8: Jumper seat charges (9,000). 8+: Considered adults.",
    cancellationPolicy: "7 days: 50%. 3 days: 75%. <3 days: 100%."
  },
  {
    id: "tour-3d-kashmir-arangkel",
    title: "3 Days Kashmir, Arang Kel & Neelum Valley",
    tag: "Kashmir Peak Cabins",
    durationDays: 3,
    priceSingle: 16000,
    priceCouple: 38000,
    departureDays: ["Every Monday night", "Every Thursday night"],
    departureFrom: "Lahore & Islamabad",
    category: "Azad Kashmir",
    image: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&q=80&w=600",
    pickups: ["Lahore Thokar PSO", "Islamabad Faizabad"],
    places: ["Neelum Valley", "AthMuqam", "Kutton Waterfall", "Dhani Waterfall", "Arang Kel Meadows", "Keran LOC", "Muzaffarabad", "LOC Chalhana"],
    servicesIncluded: ["Luxury Transport", "2 Nights Hotel Stay", "3 Breakfasts + 2 Dinners", "Bonfire, BBQ dinner, tour guide, photography"],
    servicesExcluded: ["Cable car/chairlift tickets at Kel", "Porter or hotel heater charges"],
    itinerary: [
      { day: "Day 0", title: "Departure", desc: "Leave Lahore at 10:00 PM." },
      { day: "Day 1", title: "Lahore to Keran/Sharda", desc: "Pick Islamabad members. Breakfast in Muzaffarabad. Visit Dhani & Kutton water drops. Overnight stay in Sharda/Keran." },
      { day: "Day 2", title: "Hike to Arang Kel Meadows", desc: "Drive to Kel. Ride the breathtaking chairlift, then walk 40 minutes into Arang Kel wooden village. Back to Keran for bonfire BBQ." },
      { day: "Day 3", title: "Return drive to Lahore", desc: "Breakfast, sightseeing LOC points, drive back via Kohala Bridge. Reach Lahore late night." }
    ],
    kidsPolicy: "Under 3: Free. 3-8: Jumper seat (9,000). 8+: Considered adults.",
    cancellationPolicy: "7 days: 50%. 3 days: 75%. <3 days: 100%."
  },
  {
    id: "tour-3d-naran-babusar",
    title: "3 Days Tour to Naran, Babusar Top & Saif-ul-Malook",
    tag: "Classic Naran Escapade",
    durationDays: 3,
    priceSingle: 16999,
    priceCouple: 40000,
    departureDays: ["Every Monday night", "Every Thursday night"],
    departureFrom: "Lahore & Islamabad",
    category: "Short Trips",
    image: "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?auto=format&fit=crop&q=80&w=600",
    pickups: ["Lahore Thokar PSO", "Islamabad 26 Number Daewoo"],
    places: ["Abbotabad", "Balakot", "Kiwai Waterfall", "SaifulMalook Lake", "Naran Bazar", "Lulusar Lake", "Batakundi", "Babusar Top", "Shogran & Siri Paye"],
    servicesIncluded: ["Luxury Coaster/Cabin", "2 Nights Hotel Stay", "3 Breakfasts + 2 Dinners", "Bonfire, guide, group photos"],
    servicesExcluded: ["Jeep charges to Siri Paye or Saif-ul-Malook", "Fort/boating entry ticket"],
    itinerary: [
      { day: "Day 0", title: "Departure", desc: "Leave Lahore at 10:30 PM." },
      { day: "Day 1", title: "Kiwai, Shogran & Siri Paye Meadows", desc: "Breakfast enroute. Stop at Kiwai waterfall, shift to 4x4 jeeps to Siri Paye meadows. Arrive Naran for night hotel stay." },
      { day: "Day 2", title: "Lulusar Lake & Babusar Top crossing", desc: "Depart for Babusar Top. Sightseeing Batakundi, Lulusar Lake, Soni Waterfall. Climb Babusar Top. Return to Naran for bonfire." },
      { day: "Day 3", title: "Lake Saif-ul-Malook to Lahore", desc: "Morning jeep ride to legendary Saif-ul-Malook. Breakfast, drive back to Islamabad/Lahore." }
    ],
    kidsPolicy: "Under 3: Free. 3-8: 70% charges. 8+: Adults.",
    cancellationPolicy: "7 days: 50%. 3 days: 75%. <3 days: 100%."
  },
  {
    id: "tour-2d-shogran-siri-paye",
    title: "2 Days Shogran, Siri Paye & Khanpur Dam Weekend",
    tag: "Weekend Mountain Quickie",
    durationDays: 2,
    priceSingle: 12500,
    priceCouple: 28000,
    departureDays: ["Every Friday night"],
    departureFrom: "Lahore & Islamabad",
    category: "Short Trips",
    image: "/images/jeep-fairy-meadows.jpg",
    pickups: ["Lahore Thokar PSO 10:00 PM", "Gujranwala Laari Adda 11:55 PM", "Islamabad Daewoo 4:00 AM"],
    places: ["Kiwai Waterfall", "Shogran Meadows", "Siri Lake", "Paye Meadows", "Khanpur Dam", "Balakot", "Musa ka Musala View"],
    servicesIncluded: ["Luxury AC transport", "1 Night Hotel stay in Shogran", "2 Breakfasts + 1 Dinner", "Bonfire, guide, group photography"],
    servicesExcluded: ["Jeep charges from Kiwai to Shogran/Siri Paye", "Khanpur Dam boating/cliff jump charges"],
    itinerary: [
      { day: "Day 0", title: "Friday Night Departure", desc: "Board coaster from Lahore at 10:00 PM, Gujranwala 11:55 PM." },
      { day: "Day 1", title: "Kiwai & Shogran Siri Paye Meadows", desc: "Pick Islamabad members. Breakfast at Balakot. Drive to Kiwai waterfall. Ride 4x4 jeeps to Shogran and Siri Paye alpine meadows. Dinner & bonfire in Shogran." },
      { day: "Day 2", title: "Khanpur Dam adventure & return", desc: "Breakfast in Shogran. Drive back. Stop at scenic Khanpur Dam for water sports (optional). Drive back to Islamabad and Lahore." }
    ],
    kidsPolicy: "Under 3: Free. 3-8: 50% charges with jumper seat. 8+: Fully charged.",
    cancellationPolicy: "7 days: 50%. 3 days: 75%. <3 days: 100%."
  },
  {
    id: "tour-1d-mushkpuri",
    title: "1 Day Trip to Mushkpuri Peak & Dunga Gali Pine Trails",
    tag: "One Day Hiking Escape",
    durationDays: 1,
    priceSingle: 9000,
    priceCouple: 18000,
    departureDays: ["Every Saturday night"],
    departureFrom: "Lahore & Islamabad",
    category: "Short Trips",
    image: "/images/hunza-valley-hero.jpg",
    pickups: ["Lahore Thokar PSO 11:30 PM", "Gujranwala Laari Adda 1:00 AM", "Islamabad Faizabad 4:30 AM"],
    places: ["Dunga Gali", "Mushkpuri Top Trail", "Galyat pine forest", "Savour Foods Islamabad"],
    servicesIncluded: ["Luxury AC Transport", "1 Breakfast from Dunga Gali", "1 Dinner at Savour Foods Islamabad", "Tour guide, photography, tolls & taxes"],
    servicesExcluded: ["Personal trekking stick, raincoats", "Horse riding fares on trail"],
    itinerary: [
      { day: "Day 0", title: "Saturday Late Night Departure", desc: "Depart Lahore at 11:30 PM." },
      { day: "Day 1", title: "Trail Hike to Mushkpuri Top & Savour Dinner", desc: "Arrive in Galyat. Breakfast in Dunga Gali. Begin the pine forest hike to Mushkpuri Top. Enjoy panoramic snowy mountain vistas. Hike back, depart for Savour Foods Islamabad for traditional rice feast. Return to Lahore by 2:00 AM." }
    ],
    kidsPolicy: "Under 3: Free. 3-8: 50% charges (jumper seat). 8+: Fully charged.",
    cancellationPolicy: "7 days: 50%. 3 days: 75%. <3 days: 100%."
  }
];
