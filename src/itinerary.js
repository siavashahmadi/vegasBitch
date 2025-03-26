const itinerary = {
  tripName: "DIRTY 30 TRIP (and baby sia)",
  dates: "March 27-30, 2025",
  people: [
    { name: "Daniel", nickname: "Leebron" },
    { name: "Kiarash", nickname: "Kia" },
    { name: "Kyon", nickname: "Seonggeon" },
    { name: "Lucas", nickname: "Luke" },
    { name: "Peter", nickname: "Pete" },
    { name: "Siavash", nickname: "Sia" }
  ],
  flights: {
    toVegas: [
      { person: "Daniel", departure: "11:00 AM", arrival: "1:15 PM" },
      { person: "Kia", departure: "4:59 PM", arrival: "6:30 PM" },
      { person: "Kyon", departure: "9:48 PM", arrival: "11:25 PM" },
      { person: "Lucas", departure: "7:00 AM", arrival: "8:30 AM" },
      { person: "Peter", departure: "10:55 PM", arrival: "12:30 AM" },
      { person: "Sia", departure: "4:05 PM", arrival: "10:51 PM" }
    ],
    toHome: [
      { person: "Daniel", departure: "5:30 PM", arrival: "12:30 AM" },
      { person: "Kia", departure: "11:30 PM", arrival: "5:45 AM" },
      { person: "Kyon", departure: "5:30 PM", arrival: "12:25 AM" },
      { person: "Lucas", departure: "When I want", arrival: "type shit" },
      { person: "Peter", departure: "5:30 PM", arrival: "12:25 AM" },
      { person: "Sia", departure: "10:30 PM", arrival: "10:20 AM" }
    ]
  },
  schedule: [
    {
      day: "Thursday",
      date: "March 27, 2025",
      events: [
        { time: "3:00 PM", description: "Hotel check ins" },
        { time: "4:00 PM", description: "Dispensary near the strip (Cookies, Reef, or Planet 13)" },
        { time: "4:00 PM", description: "Free time for Dan and Luke" },
        { time: "7:00 PM", description: "See Kia check in and get dinner" },
        { time: "8:00 PM", description: "Fremont Street and Fremont bars" },
        { time: "11:00 PM", description: "Sleep earlier (jet lag)" }
      ]
    },
    {
      day: "Friday",
      date: "March 28, 2025",
      events: [
        { time: "9:30 AM", description: "Meditate (is this code for 😮‍💨 or 👶)" },
        { time: "10:00 AM", description: "Explore hotels: Bellagio, Wynn, Cosmopolitan, Mandalay Bay, Waldorf Astoria, Park MGM, Venetian" },
        { time: "11:15 AM", description: "Reservation at Sugarcane (made by Alex)" },
        { time: "12:00 PM", description: "Casino" },
        { time: "1:00 PM", description: "Sphere Show", endTime: "3:00 PM" },
        { time: "3:00 PM", description: "Sia, Kyon, Peter check in (or maybe later to avoid long line)" },
        { time: "3:30 PM", description: "Area 15 or more casino", endTime: "6:00 PM" },
        { time: "6:30 PM", description: "Buffet at Caesar's Palace Bacchanal (Party of 8 under Kiarash)" },
        { time: "8:30 PM", description: "Explore Caesars hotel, casino gamble and chill" }
      ]
    },
    {
      day: "Saturday",
      date: "March 29, 2025",
      events: [
        { time: "9:30 AM", description: "Gym (full body pump)" },
        { time: "10:00 AM", description: "Reservation at Kassi Beach House (made by Alex)" },
        { time: "12:00 PM", description: "David Guetta at LIV Beach (Uber probably best)" },
        { time: "12:00 PM", description: "Alternative: Dan and Esther explore hotels while others at LIV Beach" },
        { time: "12:00 PM", description: "Plan B: Lazy river at MGM" },
        { time: "2:00 PM", description: "Jollibees (Peter is ubering)" },
        { time: "3:00 PM", description: "Free time, nap, or gamble" },
        { time: "9:00 PM", description: "Pregame for nightclub" },
        { time: "10:00 PM", description: "Go to Omnia Night Club (get in before 12)" }
      ]
    },
    {
      day: "Sunday",
      date: "March 30, 2025",
      events: [
        { time: "10:00 AM", description: "Check Out, drink water, pack up", endTime: "12:00 PM" },
        { time: "2:00 PM", description: "Final meal in Vegas (brunch spot or In-N-Out)" },
        { time: "3:00 PM", description: "Last minute gambling" },
        { time: "4:00 PM", description: "Dan, Esther, Peter, and Kyon head to Airport" }
      ]
    }
  ],
  preferences: [
    { 
      person: "Daniel", 
      mustDo: ["Buffet", "Sphere or show"]
    },
    { 
      person: "Kia", 
      mustDo: ["Buffet", "Show"]
    },
    { 
      person: "Kyon", 
      mustDo: ["Gamble"]
    },
    { 
      person: "Lucas", 
      mustDo: ["Black jack", "Buffet"],
      preferred: ["Pool/day club"]
    },
    { 
      person: "Peter", 
      mustDo: ["Sphere", "Jolibee", "Blackjack"],
      preferred: ["Day club", "Buffet", "Show", "Dispensary"]
    },
    { 
      person: "Sia", 
      mustDo: ["Dispensary"]
    }
  ],
  hotels: [
    { 
      person: "Daniel", 
      thursday: "Aria", 
      fridayToSunday: "Aria" 
    },
    { 
      person: "Kia", 
      thursday: "Aria", 
      fridayToSunday: "Aria" 
    },
    { 
      person: "Kyon", 
      thursday: "Golden Nugget", 
      fridayToSunday: "MGM Grand" 
    },
    { 
      person: "Lucas", 
      thursday: "Signature at MGM", 
      fridayToSunday: "Signature at MGM" 
    },
    { 
      person: "Peter", 
      thursday: "Golden Nugget", 
      fridayToSunday: "MGM Grand" 
    },
    { 
      person: "Sia", 
      thursday: "Aria", 
      fridayToSunday: "MGM Grand" 
    }
  ]
};

export default itinerary;