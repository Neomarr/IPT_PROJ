import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { take } from 'rxjs';
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
  IonSelect,
  IonSelectOption,
  IonInput,
  IonRadioGroup,
  IonRadio
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  heartOutline, 
  heart, 
  shareSocialOutline, 
  locationOutline, 
  calendarOutline, 
  timeOutline,
  star,
  personOutline,
  alertCircleOutline,
  checkmarkCircleOutline
} from 'ionicons/icons';
import { SupabaseService } from '../../services/supabase';
import { AuthService } from '@auth0/auth0-angular';

export interface TourReview {
  id: number;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface WeatherInfo {
  date: string;
  description: string;
  maxTemp: number;
  minTemp: number;
  rainProb: number;
  windSpeed: number;
  icon: string;
}

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],
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
    IonSelect,
    IonSelectOption,
    IonInput,
    IonRadioGroup,
    IonRadio
  ]
})
export class ProductDetailPage implements OnInit {
  private supabaseService: any = inject(SupabaseService);
  public auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  tourId!: number;
  isLoading: boolean = true;
  isFavorite: boolean = false;
  isLoggedIn: boolean = false;
  userId: number | null = null;
  userEmail: string | null = null;

  // Tour Data
  tourName: string = '';
  guideName: string = 'UNASSIGNED';
  priceJpy: number = 0;
  description: string = '';
  status: string = 'AVAILABLE';
  images: string[] = [];
  selectedImageIndex: number = 0;

  // Currency
  selectedCurrency: string = 'USD';
  convertedPrice: number = 0;
  exchangeRate: number = 0;
  exchangeRatesMap: { [key: string]: number } = {};
  rateDate: string = '';

  // Booking Form & Date Rules
  tourDate: string = '';
  minDate: string = '';
  participants: number = 1;
  fullName: string = '';
  email: string = '';
  phoneNumber: string = '';
  specialRequests: string = '';
  paymentMethod: string = 'paypal';

  // Date Availability & Weather
  isDateUnavailable: boolean = false;
  isDateValid: boolean = false;
  selectedDateWeather: WeatherInfo | null = null;
  isLoadingWeather: boolean = false;
  blockedDatesSet: Set<string> = new Set();
  cutoffHour: number = 17;

  // Reviews
  reviews: TourReview[] = [];
  averageRating: number = 5;

  constructor() {
    addIcons({
      'heart-outline': heartOutline,
      'heart': heart,
      'share-social-outline': shareSocialOutline,
      'location-outline': locationOutline,
      'calendar-outline': calendarOutline,
      'time-outline': timeOutline,
      'star': star,
      'person-outline': personOutline,
      'alert-circle-outline': alertCircleOutline,
      'checkmark-circle-outline': checkmarkCircleOutline
    });

    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
  }

  async ngOnInit() {
    // Step 2 Fix: Extract parameter using either 'id' or 'tourId'
    this.route.paramMap.subscribe(async params => {
      const rawId = params.get('id') || params.get('tourId');
      this.tourId = Number(rawId);

      if (!this.tourId || isNaN(this.tourId)) {
        console.error('Invalid Tour ID passed to route:', rawId);
        this.isLoading = false;
        this.cdr.detectChanges();
        return;
      }
      
      await Promise.all([
        this.loadTourDetails(),
        this.loadAppCutoffSettings(),
        this.loadBlockedDates(),
        this.loadReviews(),
        this.fetchFrankfurterRates()
      ]);

      this.checkAuthAndUser();
    });

    this.route.queryParams.subscribe(queryParams => {
      if (queryParams['date']) {
        this.tourDate = queryParams['date'];
        this.onDateChange();
      }
      if (queryParams['participants']) {
        this.participants = Number(queryParams['participants']);
      }
      if (queryParams['fullName']) this.fullName = queryParams['fullName'];
      if (queryParams['email']) this.email = queryParams['email'];
      if (queryParams['phone']) this.phoneNumber = queryParams['phone'];
      if (queryParams['requests']) this.specialRequests = queryParams['requests'];
    });
  }

  selectImage(index: number) {
    this.selectedImageIndex = index;
  }

  checkAuthAndUser() {
    this.auth.user$.pipe(take(1)).subscribe(async (user) => {
      if (user && user.email) {
        this.isLoggedIn = true;
        this.userEmail = user.email;
        if (!this.email) this.email = user.email;
        if (!this.fullName) this.fullName = user.name || user.email;

        const { data: userData } = await this.supabaseService.client
          .from('users')
          .select('user_id')
          .eq('email', this.userEmail)
          .maybeSingle();

        if (userData?.user_id) {
          this.userId = userData.user_id;

          if (this.tourId) {
            const { data: wish } = await this.supabaseService.client
              .from('wishlists')
              .select('id')
              .eq('user_id', this.userId)
              .eq('tour_id', this.tourId)
              .maybeSingle();

            this.isFavorite = !!wish;
          }
        }
      } else {
        this.isLoggedIn = false;
      }
      this.cdr.detectChanges();
    });
  }

  async loadAppCutoffSettings() {
    try {
      const { data } = await this.supabaseService.client
        .from('app_settings')
        .select('booking_cutoff_hour')
        .limit(1)
        .maybeSingle();

      if (data?.booking_cutoff_hour) {
        this.cutoffHour = data.booking_cutoff_hour;
      }
    } catch (err) {
      console.warn('Could not fetch app_settings cutoff hour:', err);
    }
  }

  async loadBlockedDates() {
    try {
      const blockedSet = new Set<string>();

      const [{ data: holds }, { data: bookings }] = await Promise.all([
        this.supabaseService.client.from('tour_date_holds').select('booking_date').eq('tour_id', this.tourId),
        this.supabaseService.client.from('bookings').select('booking_date').eq('tour_id', this.tourId).in('status', ['CONFIRMED', 'COMPLETED', 'PENDING'])
      ]);

      if (holds) holds.forEach((h: any) => blockedSet.add(h.booking_date));
      if (bookings) bookings.forEach((b: any) => blockedSet.add(b.booking_date));

      this.blockedDatesSet = blockedSet;
    } catch (err) {
      console.error('Error fetching blocked tour dates:', err);
    }
  }

  async loadReviews() {
    try {
      const { data: reviewRows, error } = await this.supabaseService.client
        .from('reviews')
        .select('*, users(full_name)')
        .eq('tour_id', this.tourId);

      if (error) throw error;

      if (reviewRows && reviewRows.length > 0) {
        let totalRating = 0;
        this.reviews = reviewRows.map((r: any) => {
          totalRating += r.rating || 5;
          return {
            id: r.id,
            userName: r.users?.full_name || 'Anonymous Customer',
            rating: r.rating || 5,
            comment: r.comment || '',
            createdAt: r.created_at
          };
        });
        this.averageRating = Math.round(totalRating / reviewRows.length);
      } else {
        this.reviews = [];
        this.averageRating = 5;
      }
    } catch (err) {
      console.error('Error loading reviews:', err);
    } finally {
      this.cdr.detectChanges();
    }
  }

  async toggleFavorite() {
    if (!this.userId) {
      alert('Please log in to save tours to your wishlist.');
      return;
    }

    const prevState = this.isFavorite;
    this.isFavorite = !prevState;

    try {
      if (prevState) {
        await this.supabaseService.client
          .from('wishlists')
          .delete()
          .eq('user_id', this.userId)
          .eq('tour_id', this.tourId);
      } else {
        await this.supabaseService.client
          .from('wishlists')
          .insert([{ user_id: this.userId, tour_id: this.tourId }]);
      }
    } catch (err) {
      this.isFavorite = prevState;
      console.error('Error toggling favorite:', err);
    } finally {
      this.cdr.detectChanges();
    }
  }

  async onDateChange() {
    if (!this.tourDate) {
      this.isDateValid = false;
      this.isDateUnavailable = false;
      this.selectedDateWeather = null;
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    if (this.tourDate < todayStr) {
      this.isDateUnavailable = true;
      this.isDateValid = false;
      this.selectedDateWeather = null;
      return;
    }

    if (this.tourDate === todayStr) {
      const jstHourStr = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Tokyo',
        hour: 'numeric',
        hour12: false
      }).format(new Date());
      
      const currentJstHour = parseInt(jstHourStr, 10);
      if (currentJstHour >= this.cutoffHour) {
        this.isDateUnavailable = true;
        this.isDateValid = false;
        this.selectedDateWeather = null;
        this.cdr.detectChanges();
        return;
      }
    }

    if (this.blockedDatesSet.has(this.tourDate)) {
      this.isDateUnavailable = true;
      this.isDateValid = false;
      this.selectedDateWeather = null;
      this.cdr.detectChanges();
      return;
    }

    this.isDateUnavailable = false;
    this.isDateValid = true;

    await this.fetchWeatherForDate(this.tourDate);
    this.cdr.detectChanges();
  }

  async fetchWeatherForDate(dateStr: string) {
    try {
      this.isLoadingWeather = true;
      const url = `https://api.open-meteo.com/v1/forecast?latitude=35.6762&longitude=139.6503&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max&timezone=Asia%2FTokyo`;

      const res = await fetch(url);
      const data = await res.json();

      if (data && data.daily) {
        const idx = data.daily.time.indexOf(dateStr);
        if (idx !== -1) {
          const code = data.daily.weather_code[idx];
          this.selectedDateWeather = {
            date: dateStr,
            description: this.getWmoDescription(code),
            maxTemp: Math.round(data.daily.temperature_2m_max[idx]),
            minTemp: Math.round(data.daily.temperature_2m_min[idx]),
            rainProb: data.daily.precipitation_probability_max[idx] || 0,
            windSpeed: Math.round(data.daily.wind_speed_10m_max[idx] || 0),
            icon: '🌧️'
          };
        } else {
          this.selectedDateWeather = {
            date: dateStr,
            description: 'Partly cloudy',
            maxTemp: 25,
            minTemp: 19,
            rainProb: 15,
            windSpeed: 12,
            icon: '🌤️'
          };
        }
      }
    } catch (err) {
      console.error('Error fetching weather:', err);
    } finally {
      this.isLoadingWeather = false;
      this.cdr.detectChanges();
    }
  }

  getWmoDescription(code: number): string {
    switch (code) {
      case 0: return 'Clear sky';
      case 1: case 2: return 'Partly cloudy';
      case 3: return 'Overcast';
      case 51: case 53: case 55: return 'Light drizzle';
      case 61: case 63: case 65: return 'Moderate drizzle';
      case 80: case 81: case 82: return 'Rain showers';
      default: return 'Light drizzle';
    }
  }

  async fetchFrankfurterRates() {
    try {
      const response = await fetch('https://api.frankfurter.app/latest?from=JPY');
      const data = await response.json();
      if (data && data.rates) {
        this.exchangeRatesMap = data.rates;
        this.rateDate = data.date || '';
      }
      this.updateCurrencyConversion();
    } catch (err) {
      this.exchangeRatesMap = { USD: 0.00633, EUR: 0.0058, AUD: 0.0095 };
      this.updateCurrencyConversion();
    }
  }

  updateCurrencyConversion() {
    if (this.selectedCurrency === 'JPY') {
      this.exchangeRate = 1;
      this.convertedPrice = this.priceJpy;
      this.cdr.detectChanges();
      return;
    }
    const rate = this.exchangeRatesMap[this.selectedCurrency] || 1;
    this.exchangeRate = rate;
    this.convertedPrice = Number((this.priceJpy * rate).toFixed(2));
    this.cdr.detectChanges();
  }

  async loadTourDetails() {
    try {
      this.isLoading = true;
      const { data: tourData, error } = await this.supabaseService.client
        .from('tours')
        .select('*, tour_images(*)')
        .eq('id', this.tourId)
        .single();

      if (error) throw error;

      this.tourName = tourData.name || tourData.title || '';
      this.priceJpy = tourData.price || 0;
      this.description = tourData.description || '';
      this.status = (tourData.status || 'AVAILABLE').toUpperCase();

      if (tourData.tour_images && tourData.tour_images.length > 0) {
        this.images = tourData.tour_images.map((i: any) => i.image_url || i.url);
      } else {
        this.images = ['assets/placeholder.jpg'];
      }

      if (tourData.guide_id) {
        const { data: guideData } = await this.supabaseService.client
          .from('tour_guides')
          .select('user_id')
          .eq('id', tourData.guide_id)
          .maybeSingle();

        if (guideData?.user_id) {
          const { data: userData } = await this.supabaseService.client
            .from('users')
            .select('full_name')
            .eq('user_id', guideData.user_id)
            .maybeSingle();

          if (userData?.full_name) {
            this.guideName = userData.full_name.toUpperCase();
          }
        }
      }
    } catch (err) {
      console.error('Error loading tour details:', err);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  loginToReserve() {
    this.auth.loginWithRedirect({
      authorizationParams: {
        redirect_uri: 'http://localhost:8100'
      }
    });
  }

  proceedToCheckout() {
    if (!this.isLoggedIn) {
      alert('Please log in to make a reservation.');
      return;
    }
    if (!this.isDateValid) {
      alert('Please select an available tour date.');
      return;
    }

    this.router.navigate(['/checkout'], {
      queryParams: {
        tourId: this.tourId,
        date: this.tourDate,
        participants: this.participants,
        fullName: this.fullName,
        email: this.email,
        phone: this.phoneNumber,
        requests: this.specialRequests
      }
    });
  }
}