export interface Person {
  name: string;
  nickname: string;
}

export interface Flight {
  person: string;
  departure: string;
  arrival: string;
}

export interface Event {
  time: string;
  description: string;
  endTime?: string;
}

export interface DaySchedule {
  day: string;
  date: string;
  events: Event[];
}

export interface Preference {
  person: string;
  mustDo: string[];
  preferred?: string[];
}

export interface HotelStay {
  person: string;
  thursday: string;
  fridayToSunday: string;
}

export interface Itinerary {
  tripName: string;
  dates: string;
  people: Person[];
  flights: {
    toVegas: Flight[];
    toHome: Flight[];
  };
  schedule: DaySchedule[];
  preferences: Preference[];
  hotels: HotelStay[];
} 