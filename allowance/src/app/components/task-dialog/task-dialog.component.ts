import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';

export type TaskDialogResult = {
  title: string;
  points: number;
};

@Component({
  selector: 'app-task-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    TranslateModule
  ],
  templateUrl: './task-dialog.component.html',
  styles: [
    `
      .dialog-form {
        display: grid;
        gap: 1rem;
        margin-top: 0.5rem;
        min-width: min(360px, 80vw);
      }
    `
  ]
})
export class TaskDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<TaskDialogComponent>);
  private readonly formBuilder = inject(NonNullableFormBuilder);

  form = this.formBuilder.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    points: [5, [Validators.required, Validators.min(1)]]
  });

  save(): void {
    if (this.form.invalid) {
      return;
    }
    this.dialogRef.close(this.form.getRawValue());
  }

  close(): void {
    this.dialogRef.close();
  }
}
