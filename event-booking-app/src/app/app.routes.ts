import { Routes } from '@angular/router';
import { EventsComponent } from './events/events.component';
import { EventListComponent } from './features/events/event-list/event-list.component';
import { AuthGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { EventDetailsComponent } from './features/events/event-detail/event-detail.component';
import { EventFormComponent } from './features/events/event-form/event-form.component';
import { MyBookingsListComponent } from './features/booking/my-bookings-list/my-bookings-list.component';
import { BookingDetailComponent } from './features/booking/booking-detail/booking-detail.component';

export const routes: Routes = [
    { path: 'auth/login', component: LoginComponent },
    { path: 'auth/register', component: RegisterComponent },
    {
        path: 'bookings',
        children: [
            {
                path: 'my',
                component: MyBookingsListComponent, canActivate: [AuthGuard],
            },
            { path: ':id', component: BookingDetailComponent, canActivate: [AuthGuard] },
        ]
    },
    { path: '', redirectTo: '/events', pathMatch: 'full' },
    {
        path: 'events',
        children: [
            { path: '', component: EventListComponent },
            {
                path: 'new',
                component: EventFormComponent,
                canActivate: [AuthGuard],
                data: { roles: ['Organizer', 'Admin'] }
            },
            { path: ':id', component: EventDetailsComponent },
            {
                path: 'edit/:id',
                component: EventFormComponent,
                canActivate: [AuthGuard],
                data: { roles: ['Organizer', 'Admin'] }
            }
        ]
    }
];

