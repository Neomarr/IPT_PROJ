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
  IonMenuButton,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonCard,
  IonBadge,
  IonIcon,
  IonSpinner
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  funnelOutline, 
  searchOutline, 
  trashOutline, 
  heartOutline, 
  heart, 
  arrowForwardOutline 
} from 'ionicons/icons';
import { SupabaseService } from '../services/supabase';

export interface Tour {
  id: number;
  name: string;
  price: number;
  status: string;
  image: string;
  isFavorite?: boolean;
}

@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
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
    IonMenuButton,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonCard,
    IonBadge,
    IonIcon,
    IonSpinner
  ]
})
export class ProductsPage implements OnInit {
  private supabaseService = inject(SupabaseService);
  private cdr = inject(ChangeDetectorRef);

  searchTerm: string = '';
  minPrice?: number;
  maxPrice?: number;
  availability: string = 'all';
  sortBy: string = 'newest';

  tours: Tour[] = [];
  filteredTours: Tour[] = [];
  isLoading: boolean = true;

  constructor() {
    addIcons({
      'funnel-outline': funnelOutline,
      'search-outline': searchOutline,
      'trash-outline': trashOutline,
      'heart-outline': heartOutline,
      'heart': heart,
      'arrow-forward-outline': arrowForwardOutline
    });
  }

  async ngOnInit() {
    await this.fetchTours();
  }

  // Also re-fetch whenever user navigates to this tab
  async ionViewWillEnter() {
    if (this.tours.length === 0) {
      await this.fetchTours();
    }
  }

  async fetchTours() {
    try {
      this.isLoading = true;

      // Join tour_images table so image URLs load properly
      const { data, error } = await this.supabaseService.client
        .from('tours')
        .select('*, tour_images(*)');

      if (error) throw error;

      this.tours = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name || item.title || '',
        price: item.price || 0,
        status: (item.status || 'AVAILABLE').toUpperCase(),
        image: item.tour_images && item.tour_images.length > 0 
          ? (item.tour_images[0].image_url || item.tour_images[0].url || item.tour_images[0].image)
          : 'assets/placeholder.jpg',
        isFavorite: false
      }));

      this.applyFilters();
    } catch (err) {
      console.error('Error fetching tours from Supabase:', err);
    } finally {
      this.isLoading = false;
      // Force change detection so the UI updates immediately after fetch
      this.cdr.detectChanges();
    }
  }

  toggleFavorite(tour: Tour) {
    tour.isFavorite = !tour.isFavorite;
  }

  applyFilters() {
    let result = this.tours.filter(tour => {
      const matchesSearch = !this.searchTerm || tour.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesMin = this.minPrice === undefined || this.minPrice === null || tour.price >= this.minPrice;
      const matchesMax = this.maxPrice === undefined || this.maxPrice === null || tour.price <= this.maxPrice;
      
      const matchesStatus = this.availability === 'all' || 
        tour.status.toUpperCase() === this.availability.toUpperCase();

      return matchesSearch && matchesMin && matchesMax && matchesStatus;
    });

    if (this.sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (this.sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (this.sortBy === 'name-az') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (this.sortBy === 'name-za') {
      result.sort((a, b) => b.name.localeCompare(a.name));
    }

    this.filteredTours = result;
    this.cdr.detectChanges();
  }

  clearFilters() {
    this.searchTerm = '';
    this.minPrice = undefined;
    this.maxPrice = undefined;
    this.availability = 'all';
    this.sortBy = 'newest';
    this.applyFilters();
  }
}