import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { TermsDialogComponent } from '../terms-dialog/terms-dialog.component';

@Component({
  selector: 'app-auth-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    TranslateModule
  ],
  templateUrl: './auth-dialog.component.html',
  styleUrl: './auth-dialog.component.scss'
})
export class AuthDialogComponent {
  private readonly termsVersion = '2026-01-26';
  fullName = '';
  email = '';
  password = '';
  confirmPassword = '';
  acceptTerms = false;
  busy = signal(false);
  error = signal<string | null>(null);
  info = signal<string | null>(null);

  constructor(
    private readonly auth: AuthService,
    private readonly dialogRef: MatDialogRef<AuthDialogComponent>,
    private readonly dialog: MatDialog,
    private readonly translate: TranslateService
  ) {}

  async signIn(): Promise<void> {
    this.clearMessages();
    this.busy.set(true);
    const error = await this.auth.signIn(this.email.trim(), this.password);
    this.busy.set(false);
    if (error) {
      this.error.set(error.message);
      return;
    }
    this.dialogRef.close();
  }

  async signUp(): Promise<void> {
    this.clearMessages();
    if (!this.acceptTerms) {
      this.error.set(this.translate.instant('auth.acceptTermsRequired'));
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.error.set(this.translate.instant('auth.passwordMismatch'));
      return;
    }
    this.busy.set(true);
    const error = await this.auth.signUp(
      this.email.trim(),
      this.password,
      this.fullName.trim(),
      this.termsVersion,
      new Date().toISOString()
    );
    this.busy.set(false);
    if (error) {
      this.error.set(error.message);
      return;
    }
    this.info.set(this.translate.instant('auth.checkEmail'));
  }

  async signInWithGoogle(): Promise<void> {
    this.clearMessages();
    this.busy.set(true);
    const error = await this.auth.signInWithGoogle();
    this.busy.set(false);
    if (error) {
      this.error.set(error.message);
    }
  }

  async resetPassword(): Promise<void> {
    this.clearMessages();
    this.busy.set(true);
    const error = await this.auth.resetPassword(this.email.trim());
    this.busy.set(false);
    if (error) {
      this.error.set(error.message);
      return;
    }
    this.info.set(this.translate.instant('auth.resetSent'));
  }

  private clearMessages(): void {
    this.error.set(null);
    this.info.set(null);
  }

  async openTerms(): Promise<void> {
    const accepted = await firstValueFrom(this.dialog.open(TermsDialogComponent, {
      panelClass: 'terms-dialog',
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw'
    }).afterClosed());
    if (accepted) {
      this.acceptTerms = true;
    }
  }
}
