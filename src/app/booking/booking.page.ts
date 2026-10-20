import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonSpinner,
  IonSearchbar
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  timeOutline, 
  checkmarkCircleOutline, 
  closeCircleOutline, 
  documentTextOutline,
  cloudUploadOutline,
  starOutline,
  star,
  closeOutline
} from 'ionicons/icons';
import { SupabaseService } from '../services/supabase';
import { AuthService } from '@auth0/auth0-angular';
import { take } from 'rxjs';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.page.html',
  styleUrls: ['./booking.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonButton,
    IonIcon,
    IonSpinner,
    IonSearchbar
  ]
})
export class BookingPage implements OnInit {
  private supabaseService: any = inject(SupabaseService);
  private auth = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  isLoading: boolean = true;
  userId: number | null = null;
  activeTab: string = 'ALL';
  searchQuery: string = '';

  allBookings: any[] = [];
  filteredBookings: any[] = [];

  upcomingCount: number = 0;
  completedCount: number = 0;
  cancelledCount: number = 0;

  // Reservation Details Modal Control
  isModalOpen: boolean = false;
  selectedBooking: any = null;

  // Leave a Review Modal Control
  isReviewModalOpen: boolean = false;
  selectedReviewBooking: any = null;
  reviewRating: number = 5;
  reviewComment: string = '';
  isSubmittingReview: boolean = false;

  constructor() {
    addIcons({
      'time-outline': timeOutline,
      'checkmark-circle-outline': checkmarkCircleOutline,
      'close-circle-outline': closeCircleOutline,
      'document-text-outline': documentTextOutline,
      'cloud-upload-outline': cloudUploadOutline,
      'star-outline': starOutline,
      'star': star,
      'close-outline': closeOutline
    });
  }

  async ngOnInit() {
    this.auth.user$.pipe(take(1)).subscribe(async (user) => {
      if (user && user.email) {
        const { data } = await this.supabaseService.client
          .from('users')
          .select('user_id')
          .eq('email', user.email)
          .maybeSingle();

        if (data?.user_id) {
          this.userId = data.user_id;
          await this.loadUserBookings();
        }
      }
      this.isLoading = false;
      this.cdr.detectChanges();
    });
  }

  async loadUserBookings() {
    try {
      this.isLoading = true;
      const { data, error } = await this.supabaseService.client
        .from('bookings')
        .select('*, tours(*, tour_images(*)), payment_methods(name), payment_proofs(*)')
        .eq('user_id', this.userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      this.allBookings = (data || []).map((b: any) => {
        let img = 'assets/placeholder.jpg';
        if (b.tours?.tour_images && b.tours.tour_images.length > 0) {
          img = b.tours.tour_images[0].image_url || b.tours.tour_images[0].url;
        }
        return {
          ...b,
          tourImage: img,
          reference: `JDM-${b.id}`,
          paymentMethodName: b.payment_methods?.name || 'Paypal'
        };
      });

      this.calculateCounts();
      this.applyFilter();
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  calculateCounts() {
    this.upcomingCount = this.allBookings.filter(b => b.status === 'CONFIRMED' || b.status === 'PENDING').length;
    this.completedCount = this.allBookings.filter(b => b.status === 'COMPLETED').length;
    this.cancelledCount = this.allBookings.filter(b => b.status === 'CANCELLED' || b.status === 'REJECTED').length;
  }

  setTab(tab: string) {
    this.activeTab = tab;
    this.applyFilter();
  }

  applyFilter() {
    let list = [...this.allBookings];

    if (this.activeTab === 'UPCOMING') {
      list = list.filter(b => b.status === 'CONFIRMED' || b.status === 'PENDING');
    } else if (this.activeTab === 'COMPLETED') {
      list = list.filter(b => b.status === 'COMPLETED');
    } else if (this.activeTab === 'CANCELLED') {
      list = list.filter(b => b.status === 'CANCELLED' || b.status === 'REJECTED');
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(b => 
        (b.tour_name_snapshot && b.tour_name_snapshot.toLowerCase().includes(q)) ||
        b.reference.toLowerCase().includes(q)
      );
    }

    this.filteredBookings = list;
    this.cdr.detectChanges();
  }

  openModal(booking: any) {
    this.selectedBooking = booking;
    this.isModalOpen = true;
    this.cdr.detectChanges();
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedBooking = null;
    this.cdr.detectChanges();
  }

  openReviewModal(booking: any) {
    this.selectedReviewBooking = booking;
    this.reviewRating = 5;
    this.reviewComment = '';
    this.isReviewModalOpen = true;
    this.cdr.detectChanges();
  }

  closeReviewModal() {
    this.isReviewModalOpen = false;
    this.selectedReviewBooking = null;
    this.reviewRating = 5;
    this.reviewComment = '';
    this.cdr.detectChanges();
  }

  setRating(stars: number) {
    this.reviewRating = stars;
    this.cdr.detectChanges();
  }

  async submitReview() {
  if (!this.reviewComment.trim()) {
    alert('Please tell us about your experience before submitting.');
    return;
  }

  if (!this.userId || !this.selectedReviewBooking) {
    alert('Invalid context. Please log in again.');
    return;
  }

  try {
    this.isSubmittingReview = true;

    const now = new Date().toISOString();

    const { error } = await this.supabaseService.client
      .from('reviews')
      .insert([
        {
          user_id: this.userId,
          tour_id: this.selectedReviewBooking.tour_id,
          rating: this.reviewRating,
          comment: this.reviewComment.trim(),
          updated_at: now
        }
      ]);

    if (error) throw error;

    alert('Thank you for leaving a review!');
    this.closeReviewModal();
  } catch (err: any) {
    console.error('Error submitting review:', err);
    alert('Failed to submit review: ' + (err.message || 'Please try again.'));
  } finally {
    this.isSubmittingReview = false;
    this.cdr.detectChanges();
  }
}

  async onReplaceProof(booking: any, event: any) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      this.isLoading = true;

      const fileExt = file.name.split('.').pop();
      const filePath = `receipts/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await this.supabaseService.client.storage
        .from('tour-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = this.supabaseService.client.storage
        .from('tour-images')
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      await this.supabaseService.client
        .from('payment_proofs')
        .insert([{
          booking_id: booking.id,
          uploaded_by: this.userId,
          file_url: publicUrl,
          file_name: file.name,
          file_type: file.type
        }]);

      alert('Payment proof updated successfully!');
      this.closeModal();
      await this.loadUserBookings();
    } catch (err: any) {
      console.error('Error replacing proof:', err);
      alert('Failed to update proof: ' + err.message);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }
}