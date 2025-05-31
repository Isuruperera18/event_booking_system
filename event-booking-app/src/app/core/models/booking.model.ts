export class Booking {
  _id?: string;
  userId!: string;
  eventId!: string;
  createdAt?: Date;

  constructor(init?: Partial<Booking>) {
    Object.assign(this, init);
  }
}
