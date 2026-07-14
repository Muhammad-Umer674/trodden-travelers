export interface Destination {
  id: string;
  name: string;
  region: 'Gilgit-Baltistan' | 'Khyber Pakhtunkhwa' | 'Punjab' | 'Sindh' | 'Balochistan' | 'Azad Kashmir';
  tagline: string;
  description: string;
  coordinates: { x: number; y: number }; // Percentage coordinate for SVG map positioning
  image: string;
  highlights: string[];
  bestTime: string;
  defaultItineraryId: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  iconName: string; // Name of Lucide icon
  category: 'Adventure' | 'Corporate' | 'Family' | 'Custom' | 'General';
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  activities: string[];
}

export interface PresetItinerary {
  id: string;
  destinationId: string;
  title: string;
  durationDays: number;
  priceEstimate: string;
  tourType: string;
  days: ItineraryDay[];
}

export interface BookingFormState {
  fullName: string;
  email: string;
  phone: string;
  serviceId: string;
  destinations: string[];
  durationDays: number;
  travelers: number;
  accommodationType: 'Standard' | 'Deluxe' | 'Luxury';
  travelMode: 'Jeep' | 'By Air' | 'Coaster/Car';
  startDate: string;
  specialRequests: string;
}
