import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
    selector: 'app-ride-request-snackbar',
    template: `
    <div class="ride-request-snackbar">
      <div class="message">
        {{ data.message }}
      </div>
      <div class="actions">
        <button mat-button color="warn" (click)="deny()">Deny</button>
        <button mat-raised-button color="primary" (click)="accept()">Accept</button>
      </div>
    </div>
  `,
    styles: [`
    .ride-request-snackbar {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .message {
      font-size: 14px;
    }
    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
  `]
})
export class RideRequestSnackbarComponent {
    constructor(
        @Inject(MAT_SNACK_BAR_DATA) public data: any,
        private snackBarRef: MatSnackBarRef<RideRequestSnackbarComponent>
    ) { }

    accept() {
        this.snackBarRef.dismissWithAction();
    }

    deny() {
        this.snackBarRef.dismiss();
    }
}
