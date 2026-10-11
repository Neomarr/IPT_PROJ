import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonButton,
  IonInput,
  IonTextarea,
  IonIcon,
  IonSpinner
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  locationOutline, 
  callOutline, 
  mailOutline, 
  timeOutline, 
  logoInstagram, 
  logoTiktok 
} from 'ionicons/icons';
import { SupabaseService } from '../services/supabase';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.page.html',
  styleUrls: ['./contact-us.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonButton,
    IonInput,
    IonTextarea,
    IonIcon,
    IonSpinner
  ]
})
export class ContactUsPage implements OnInit {
  private supabaseService = inject(SupabaseService);
  private auth = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  name: string = '';
  email: string = '';
  subject: string = '';
  message: string = '';

  isSubmitting: boolean = false;

  constructor() {
    addIcons({
      'location-outline': locationOutline,
      'call-outline': callOutline,
      'mail-outline': mailOutline,
      'time-outline': timeOutline,
      'logo-instagram': logoInstagram,
      'logo-tiktok': logoTiktok
    });
  }

  ngOnInit() {
    // Auto-fill Name & Email if user is logged in
    this.auth.user$.subscribe((user) => {
      if (user) {
        if (user.email) this.email = user.email;
        if (user.name) this.name = user.name;
      }
    });
  }

  async onSubmit() {
    if (!this.name.trim() || !this.email.trim() || !this.message.trim()) {
      alert('Please fill in all required fields (Name, Email, and Message).');
      return;
    }

    try {
      this.isSubmitting = true;
      const now = new Date().toISOString();

      const { error } = await this.supabaseService.client
        .from('contact_messages')
        .insert([
          {
            name: this.name.trim(),
            email: this.email.trim(),
            subject: this.subject.trim() ? this.subject.trim() : null,
            message: this.message.trim(),
            status: 'NEW',
            created_at: now,
            updated_at: now
          }
        ]);

      if (error) {
        throw error;
      }

      alert('Message sent successfully!');

      // Clear non-user message field
      this.message = '';
      this.subject = '';
    } catch (err: any) {
      console.error('Error submitting message:', err);
      alert('Failed to send message: ' + (err.message || 'Unknown error'));
    } finally {
      this.isSubmitting = false;
      this.cdr.detectChanges();
    }
  }
}