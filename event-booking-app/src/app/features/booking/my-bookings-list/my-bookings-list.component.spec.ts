import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyBookingsListComponent } from './my-bookings-list.component';

describe('MyBookingsListComponent', () => {
  let component: MyBookingsListComponent;
  let fixture: ComponentFixture<MyBookingsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyBookingsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyBookingsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
