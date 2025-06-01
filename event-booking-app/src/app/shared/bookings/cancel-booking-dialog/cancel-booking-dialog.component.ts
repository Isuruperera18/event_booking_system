import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-cancel-booking-dialog',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './cancel-booking-dialog.component.html',
  styleUrl: './cancel-booking-dialog.component.scss'
})
export class CancelBookingDialogComponent {
constructor(
    public dialogRef: MatDialogRef<CancelBookingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { eventTitle: string }
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
