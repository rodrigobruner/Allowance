import { DOCUMENT } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Settings } from '../../../core/services/growup-db.service';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { DeleteAccountDialogComponent } from '../delete-account-dialog/delete-account-dialog.component';
import { AuthErrorDialogComponent } from '../../auth/auth-error-dialog/auth-error-dialog.component';
import { firstValueFrom } from 'rxjs';

export type SettingsDialogData = Settings;

type AvatarOption = {
  id: string;
  name: string;
};

@Component({
  selector: 'app-settings-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    TranslateModule
  ],
  templateUrl: './settings-dialog.component.html',
  styles: [
    `
      .dialog-form {
        display: grid;
        gap: 1rem;
        margin-top: 0;
        min-width: min(360px, 80vw);
      }

      .section-title {
        font-weight: 600;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        font-size: 0.7rem;
        color: rgba(19, 70, 134, 0.7);
        margin-top: 0.25rem;
      }

      .avatar-option {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
      }

      .avatar-option-img {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        object-fit: cover;
        border: 1px solid rgba(19, 70, 134, 0.25);
        background: #f2f6fb;
      }

      .avatar-preview {
        display: flex;
        justify-content: center;
        padding: 0.5rem 0;
      }

      .avatar-preview img {
        width: 120px;
        height: 120px;
        border-radius: 18px;
        object-fit: contain;
        border: 1px solid rgba(19, 70, 134, 0.25);
        background: #f2f6fb;
      }

      .danger-zone {
        display: grid;
        gap: 0.75rem;
        margin-top: 0.5rem;
      }

      .danger-title {
        color: rgba(146, 16, 30, 0.75);
      }

      .delete-account-button {
        color: #a33;
        border-color: rgba(170, 51, 51, 0.35);
        background: rgba(255, 214, 214, 0.6);
      }

      .delete-account-button:hover {
        background: rgba(255, 214, 214, 0.8);
      }

      .settings-drawer {
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      .drawer-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 1rem 1.5rem 0.5rem;
        min-height: 56px;
      }

      .drawer-title {
        margin: 0;
        font-size: 1.6rem;
        font-family: 'Baloo 2', 'Comic Sans MS', cursive;
        color: var(--app-primary);
      }

      :host ::ng-deep .mat-mdc-dialog-content {
        width: 100%;
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
        padding: 0 1.5rem;
      }

      :host ::ng-deep .mat-mdc-dialog-actions {
        margin: 0;
        padding: 0.5rem 1.5rem 1rem;
        min-height: 56px;
      }

      .settings-section {
        display: grid;
        gap: 0.75rem;
        padding: 0.75rem 0 1.25rem;
        border-bottom: 1px solid rgba(19, 70, 134, 0.08);
      }

      .settings-section:last-of-type {
        border-bottom: none;
        padding-bottom: 0;
      }

      .section-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 1rem;
      }

      @media (max-width: 720px) {
        .section-grid {
          grid-template-columns: 1fr;
        }
      }
    `
  ]
})
export class SettingsDialogComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<SettingsDialogComponent>);
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly document = inject(DOCUMENT);
  private readonly dialog = inject(MatDialog);
  private readonly auth = inject(AuthService);
  avatars = signal<AvatarOption[]>([]);
  readonly isLoggedIn = computed(() => this.auth.isLoggedIn());

  form = this.formBuilder.group({
    cycleType: ['weekly', Validators.required],
    cycleStartDate: [this.today(), Validators.required],
    language: ['en', Validators.required],
    levelUpPoints: [100, [Validators.required, Validators.min(10)]],
    avatarId: ['01', Validators.required]
  });

  ngOnInit(): void {
    this.loadAvatars();
  }

  setSettings(settings: Settings): void {
    this.form.reset({
      ...settings,
      avatarId: settings.avatarId ?? '01'
    });
  }

  save(): void {
    if (this.form.invalid) {
      return;
    }
    this.dialogRef.close(this.form.getRawValue());
  }

  close(): void {
    this.dialogRef.close();
  }

  async openDeleteAccount(): Promise<void> {
    if (!this.auth.isLoggedIn()) {
      return;
    }
    const ref = this.dialog.open(DeleteAccountDialogComponent);
    const confirmed = await firstValueFrom(ref.afterClosed());
    if (!confirmed) {
      return;
    }
    const error = await this.auth.deleteAccount();
    if (error) {
      this.dialog.open(AuthErrorDialogComponent, { data: error.message });
      return;
    }
    this.dialogRef.close();
  }

  avatarPreviewSrc(): string {
    return this.avatarOptionSrc(this.form.get('avatarId')?.value ?? '01');
  }

  avatarOptionSrc(avatarId: string): string {
    return `assets/avatar/${avatarId}/avatar.png`;
  }

  private today(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private async loadAvatars(): Promise<void> {
    const fallback = [{ id: '01', name: 'Default' }];
    try {
      const baseHref = this.document.querySelector('base')?.getAttribute('href') ?? '/';
      const normalized = baseHref.endsWith('/') ? baseHref : `${baseHref}/`;
      const response = await fetch(`${normalized}avatars.json`);
      if (!response.ok) {
        this.avatars.set(fallback);
        return;
      }
      const data = (await response.json()) as AvatarOption[];
      if (Array.isArray(data)) {
        this.avatars.set(
          data
            .filter((item) => item && typeof item.id === 'string')
            .map((item) => ({ id: item.id, name: item.name ?? item.id }))
        );
      } else {
        this.avatars.set(fallback);
      }
    } catch {
      this.avatars.set(fallback);
    }
  }
}
