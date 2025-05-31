// import { User } from "./user.model";

import { User } from "./user.model";

// export interface AppEvent {
//   _id?: string; // MongoDB ID
//   title: string;
//   description: string;
//   date: Date | string; // Handle as string initially, convert to Date if needed
//   time: string;
//   location: string;
//   organizer?: User | string; // Could be populated User object or just ID string
//   createdAt?: Date;
//   // Add other fields like capacity, price, attendees as per your backend
// }

export interface AppEvent {
  _id?: string;             // MongoDB document ID (optional for new events)
  title: string;
  description: string;
  date: string | Date;      // ISO string or Date object
  time: string;             // e.g. "14:30" or "02:30 PM"
  location: string;
  imageURL?: string;
  organizer?:  User;        // userId string
  attendees?: any[];     // array of userId strings
  capacity?: number;        // 0 means unlimited
  price?: number;           // default 0
  category?: 'Conference' | 'Workshop' | 'Meetup' | 'Webinar' | 'Concert' | 'Party' | 'Other';
  isVirtual?: boolean;
  virtualLink?: string;
  status?: 'Scheduled' | 'Cancelled' | 'Postponed' | 'Completed';
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
