import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonBadge,
  IonSpinner
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  chevronBackOutline, 
  chevronForwardOutline, 
  calendarOutline, 
  carOutline, 
  timeOutline, 
  logoYen, 
  locationOutline, 
  compassOutline 
} from 'ionicons/icons';
import { SupabaseService } from '../services/supabase';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
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
    IonButton,
    IonIcon,
    IonBadge,
    IonSpinner
  ]
})
export class HomePage implements OnInit {
  private supabaseService: any = inject(SupabaseService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  rawTours: any[] = [];
  tours: any[] = [];
  currentIndex: number = 0;
  isLoading: boolean = true;

  get currentTour(): any {
    if (this.tours.length > 0) {
      return this.tours[this.currentIndex];
    }
    return {
      id: null,
      name: 'Loading...',
      price: 0,
      description: '',
      status: 'Available',
      image: 'assets/placeholder.jpg'
    };
  }

  constructor() {
    addIcons({
      'chevron-back-outline': chevronBackOutline,
      'chevron-forward-outline': chevronForwardOutline,
      'calendar-outline': calendarOutline,
      'car-outline': carOutline,
      'time-outline': timeOutline,
      'logo-yen': logoYen,
      'location-outline': locationOutline,
      'compass-outline': compassOutline
    });
  }

  async ngOnInit() {
    await this.loadFeaturedTours();
  }

  async loadFeaturedTours() {
    try {
      this.isLoading = true;

      // Fetch ONLY the 3 main active tours (IDs 11, 12, 13)
      const { data, error } = await this.supabaseService.client
        .from('tours')
        .select('*, tour_images(*)')
        .in('id', [11, 12, 13])
        .order('id', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        this.rawTours = data;
        this.tours = data.map((t: any) => {
          let img = 'assets/placeholder.jpg';
          if (t.tour_images && t.tour_images.length > 0) {
            img = t.tour_images[0].image_url || t.tour_images[0].url;
          }
          return {
            id: t.id,
            name: t.name || t.title,
            price: t.price || 0,
            description: t.description || '',
            status: t.status ? (t.status.charAt(0).toUpperCase() + t.status.slice(1).toLowerCase()) : 'Available',
            image: img
          };
        });
      }
    } catch (err) {
      console.error('Error fetching featured tours:', err);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  nextTour() {
    if (this.tours.length > 0) {
      this.currentIndex = (this.currentIndex + 1) % this.tours.length;
      this.cdr.detectChanges();
    }
  }

  prevTour() {
    if (this.tours.length > 0) {
      this.currentIndex = (this.currentIndex - 1 + this.tours.length) % this.tours.length;
      this.cdr.detectChanges();
    }
  }

  goToTourDetails() {
    const tour = this.currentTour;
    if (tour && tour.id) {
      this.router.navigate(['/products/product-detail', tour.id]);
    } else {
      console.warn('Cannot navigate: invalid tour ID', tour);
    }
  }
}