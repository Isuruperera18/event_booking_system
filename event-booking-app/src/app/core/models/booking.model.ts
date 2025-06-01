export class Booking {
  _id?: string;
  userId?: string;
  eventId?: string;
  tickets?: number;
  status?: string;
  bookedAt?: Date;

  constructor(init?: Partial<Booking>) {
    Object.assign(this, init);
  }
}
