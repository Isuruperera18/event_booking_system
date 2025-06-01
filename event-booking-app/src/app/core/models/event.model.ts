// import { User } from "./user.model";

import { Booking } from "./booking.model";
import { User } from "./user.model";


export interface AppEvent {
  _id?: string;
  title: string;
  description: string;
  date: string | Date;
  time: string;
  location: string;
  imageURL?: string;
  organizer?: User;
  attendees?: any[];
  capacity?: number;
  price?: number;
  category?: 'Conference' | 'Workshop' | 'Meetup' | 'Webinar' | 'Concert' | 'Party' | 'Other';
  isVirtual?: boolean;
  virtualLink?: string;
  status?: 'Scheduled' | 'Cancelled' | 'Postponed' | 'Completed' | 'coming_soon';
  createdAt?: string | Date;
  updatedAt?: string | Date;
  image?: any;
  availableTickets?: number;
  bookedTickets?: number;
  bookedCount?: number;
  booking?: Booking;
}
