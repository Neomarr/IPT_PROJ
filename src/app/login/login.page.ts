import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonContent,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonInput,
  IonSpinner
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowBackOutline, logOutOutline } from 'ionicons/icons';
import { AuthService } from '@auth0/auth0-angular';
import { Browser } from '@capacitor/browser';
import { SupabaseService } from '../services/supabase';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonContent,
    IonButton,
    IonIcon,
    IonCard,
    IonCardContent,
    IonInput,
    IonSpinner
  ]
})
export class LoginPage implements OnInit {
  public auth = inject(AuthService);
  private supabaseService = inject(SupabaseService);
  private cdr = inject(ChangeDetectorRef);

  supabaseUser: any = null;
  fullName: string = '';
  phoneNumber: string = '';
  isLoadingProfile: boolean = false;

  constructor() {
    addIcons({
      'arrow-back-outline': arrowBackOutline,
      'log-out-outline': logOutOutline
    });
  }

  ngOnInit() {
    this.auth.user$.subscribe(async (user) => {
      if (user && user.sub) {
        await this.syncSupabaseUser(user);
      } else {
        this.supabaseUser = null;
      }
    });
  }

  async syncSupabaseUser(authUser: any) {
    try {
      this.isLoadingProfile = true;

      // 1. Try finding by auth0_sub
      let { data } = await this.supabaseService.client
        .from('users')
        .select('*')
        .eq('auth0_sub', authUser.sub)
        .maybeSingle();

      // 2. Fallback: try finding by email
      if (!data && authUser.email) {
        const { data: emailMatch } = await this.supabaseService.client
          .from('users')
          .select('*')
          .eq('email', authUser.email)
          .maybeSingle();

        if (emailMatch) {
          data = emailMatch;
        }
      }

      if (data) {
        this.supabaseUser = data;
        this.fullName = data.full_name || authUser.name || '';
        this.phoneNumber = data.phone || '';
      } else {
        this.supabaseUser = {
          email: authUser.email,
          auth0_sub: authUser.sub,
          full_name: authUser.name || authUser.nickname || ''
        };
        this.fullName = authUser.name || authUser.nickname || '';
      }
    } catch (err) {
      console.error('Sync error:', err);
    } finally {
      this.isLoadingProfile = false;
      this.cdr.detectChanges();
    }
  }

  async saveProfile() {
    const authUser = await new Promise<any>((resolve) => {
      const sub = this.auth.user$.subscribe((u) => {
        sub.unsubscribe();
        resolve(u);
      });
    });

    if (!authUser || !authUser.email) {
      alert('No logged-in user found.');
      return;
    }

    try {
      const now = new Date().toISOString();

      if (this.supabaseUser?.user_id) {
        // Update existing user by user_id
        const updatePayload: any = {
          full_name: this.fullName,
          updated_at: now
        };

        if (this.phoneNumber) {
          updatePayload.phone = this.phoneNumber;
        }

        const { data, error } = await this.supabaseService.client
          .from('users')
          .update(updatePayload)
          .eq('user_id', this.supabaseUser.user_id)
          .select();

        if (error) throw error;
        alert('Profile updated successfully!');
        if (data && data.length > 0) this.supabaseUser = data[0];
      } else {
        // Insert new user row with timestamps
        const insertPayload: any = {
          email: authUser.email,
          auth0_sub: authUser.sub,
          full_name: this.fullName,
          role: 'CUSTOMER',
          is_active: true,
          created_at: now,
          updated_at: now
        };

        if (this.phoneNumber) {
          insertPayload.phone = this.phoneNumber;
        }

        const { data, error } = await this.supabaseService.client
          .from('users')
          .upsert([insertPayload], { onConflict: 'email' })
          .select();

        if (error) throw error;
        alert('Profile saved to database successfully!');
        if (data && data.length > 0) this.supabaseUser = data[0];
      }
    } catch (err: any) {
      console.error('Save Exception:', err);
      alert('Database error: ' + (err.message || err));
    }
  }

  login() {
    this.auth.loginWithRedirect({
      async openUrl(url) {
        await Browser.open({ url, windowName: '_self' });
      }
    });
  }
}