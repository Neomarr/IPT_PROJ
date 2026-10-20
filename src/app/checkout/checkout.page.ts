import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
  IonCheckbox
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  createOutline, 
  cloudUploadOutline, 
  checkmarkCircle
} from 'ionicons/icons';
import { SupabaseService } from '../services/supabase';
import { AuthService } from '@auth0/auth0-angular';
import { take } from 'rxjs';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
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
    IonCheckbox
  ]
})
export class CheckoutPage implements OnInit {
  private supabaseService: any = inject(SupabaseService);
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  tourId!: number;
  tour: any = null;
  mainImage: string = '';
  bookingDate: string = '';
  participants: number = 1;
  totalPrice: number = 0;
  originalPrice: number = 0;

  customerName: string = '';
  customerEmail: string = '';
  customerPhone: string = '';
  specialRequests: string = '';
  
  // Updated default paymentMethodId to 9 (Paypal in payment_methods table)
  paymentMethodId: number = 9; 
  paymentMethod: any = null;

  selectedFile: File | null = null;
  filePreviewUrl: string | null = null;
  isConfirmedCheckbox: boolean = false;
  isSubmitting: boolean = false;
  submissionSuccess: boolean = false;
  bookingReference: string = '';

  userId: number | null = null;

  constructor() {
    addIcons({
      'create-outline': createOutline,
      'cloud-upload-outline': cloudUploadOutline,
      'checkmark-circle': checkmarkCircle
    });
  }

  async ngOnInit() {
    this.route.queryParams.subscribe(async params => {
      this.tourId = Number(params['tourId']);
      this.bookingDate = params['date'] || '';
      this.participants = Number(params['participants']) || 1;
      this.customerName = params['fullName'] || '';
      this.customerEmail = params['email'] || '';
      this.customerPhone = params['phone'] || '';
      this.specialRequests = params['requests'] || '';
      
      // Default to 9 if query param is missing or invalid
      this.paymentMethodId = Number(params['paymentMethodId']) || 9;

      if (!this.tourId || isNaN(this.tourId)) {
        alert('No tour selected. Redirecting to tours page.');
        this.router.navigate(['/products']);
        return;
      }

      await this.loadUserData();
      await Promise.all([
        this.loadTourData(),
        this.loadPaymentMethod()
      ]);
    });
  }

  async loadUserData() {
    this.auth.user$.pipe(take(1)).subscribe(async (user) => {
      if (user && user.email) {
        if (!this.customerEmail) this.customerEmail = user.email;
        if (!this.customerName) this.customerName = user.name || user.email;

        const { data } = await this.supabaseService.client
          .from('users')
          .select('user_id')
          .eq('email', user.email)
          .maybeSingle();

        if (data?.user_id) {
          this.userId = data.user_id;
        }
      }
    });
  }

  async loadTourData() {
    try {
      const { data, error } = await this.supabaseService.client
        .from('tours')
        .select('*, tour_images(*)')
        .eq('id', this.tourId)
        .single();

      if (error) throw error;
      this.tour = data;
      this.originalPrice = (data.price || 0) * this.participants;
      this.totalPrice = Math.round(this.originalPrice * 0.9);

      if (data.tour_images && data.tour_images.length > 0) {
        this.mainImage = data.tour_images[0].image_url || data.tour_images[0].url;
      } else {
        this.mainImage = 'assets/placeholder.jpg';
      }
      this.cdr.detectChanges();
    } catch (err) {
      console.error('Error loading tour details:', err);
    }
  }

  async loadPaymentMethod() {
    try {
      const { data } = await this.supabaseService.client
        .from('payment_methods')
        .select('*')
        .eq('id', this.paymentMethodId)
        .maybeSingle();

      if (data) {
        this.paymentMethod = data;
      } else {
        // Fallback to fetch first active payment method if specified ID is not found
        const { data: fallbackData } = await this.supabaseService.client
          .from('payment_methods')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (fallbackData) {
          this.paymentMethod = fallbackData;
          this.paymentMethodId = fallbackData.id;
        }
      }
      this.cdr.detectChanges();
    } catch (err) {
      console.error('Error loading payment method:', err);
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.filePreviewUrl = e.target.result;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  editReservationDetails() {
    this.router.navigate(['/products/product-detail', this.tourId], {
      queryParams: {
        date: this.bookingDate,
        participants: this.participants,
        fullName: this.customerName,
        email: this.customerEmail,
        phone: this.customerPhone,
        requests: this.specialRequests
      }
    });
  }

  async confirmReservation() {
    if (!this.selectedFile || !this.isConfirmedCheckbox || !this.userId) {
      alert('Please upload payment proof and confirm the checkbox before proceeding.');
      return;
    }

    try {
      this.isSubmitting = true;

      const fileExt = this.selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `receipts/${fileName}`;

      const { error: uploadError } = await this.supabaseService.client.storage
        .from('tour-images')
        .upload(filePath, this.selectedFile);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = this.supabaseService.client.storage
        .from('tour-images')
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      const { data: bookingData, error: bookingError } = await this.supabaseService.client
        .from('bookings')
        .insert([
          {
            user_id: this.userId,
            tour_id: this.tourId,
            booking_date: this.bookingDate,
            participants: this.participants,
            status: 'PENDING',
            total_price: this.totalPrice,
            deposit_paid: 0,
            payment_status: 'PENDING',
            tour_name_snapshot: this.tour.name || this.tour.title,
            unit_price_snapshot: this.tour.price,
            currency: 'JPY',
            special_requests: this.specialRequests,
            customer_email: this.customerEmail,
            customer_name: this.customerName,
            customer_phone: this.customerPhone,
            payment_method_id: this.paymentMethodId // Valid integer ID 9
          }
        ])
        .select()
        .single();

      if (bookingError) throw bookingError;

      const { error: proofError } = await this.supabaseService.client
        .from('payment_proofs')
        .insert([
          {
            booking_id: bookingData.id,
            uploaded_by: this.userId,
            file_url: publicUrl,
            file_name: this.selectedFile.name,
            file_type: this.selectedFile.type
          }
        ]);

      if (proofError) throw proofError;

      this.bookingReference = `JDM-${bookingData.id}`;
      this.submissionSuccess = true;

      setTimeout(() => {
        this.router.navigate(['/booking']);
      }, 3000);

    } catch (err: any) {
      console.error('Error confirming reservation:', err);
      alert('Error submitting reservation: ' + (err.message || 'Please try again.'));
    } finally {
      this.isSubmitting = false;
      this.cdr.detectChanges();
    }
  }
}