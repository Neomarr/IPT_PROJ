import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom, timeout, catchError, of } from 'rxjs';
import {
  IonContent,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonCard,
  IonBadge,
  IonIcon
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
import { AuthService } from '@auth0/auth0-angular';

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
    IonContent,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonCard,
    IonBadge,
    IonIcon
  ]
})
export class ProductsPage implements OnInit {
  private supabaseService: any = inject(SupabaseService);
  public auth = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  searchTerm: string = '';
  minPrice?: number;
  maxPrice?: number;
  availability: string = 'all';
  sortBy: string = 'newest';

  tours: Tour[] = [];
  filteredTours: Tour[] = [];
  isLoading: boolean = true;

  userId: number | null = null;
  userEmail: string | null = null;
  wishlistTourIds: Set<number> = new Set();

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
    await this.initUserAndTours();
  }

  async ionViewWillEnter() {
    await this.initUserAndTours();
  }

  async initUserAndTours() {
    await this.syncUserId();
    await this.fetchTours();
  }

  async syncUserId(): Promise<number | null> {
    if (this.userId) return this.userId;

    try {
      // 1. Fetch Auth0 user with timeout
      const user = await firstValueFrom(
        this.auth.user$.pipe(
          timeout(2000),
          catchError(() => of(null))
        )
      );

      if (user && user.email) {
        this.userEmail = user.email;
      }

      // 2. Fetch user_id using email
      if (this.userEmail) {
        const { data: existingUser } = await this.supabaseService.client
          .from('users')
          .select('user_id')
          .eq('email', this.userEmail)
          .maybeSingle();

        if (existingUser?.user_id) {
          this.userId = existingUser.user_id;
        }
      }

      // 3. Fallback: Query user_id primary key
      if (!this.userId) {
        const { data: latestUsers } = await this.supabaseService.client
          .from('users')
          .select('user_id, email')
          .order('user_id', { ascending: false })
          .limit(1);

        if (latestUsers && latestUsers.length > 0) {
          this.userId = latestUsers[0].user_id;
          if (!this.userEmail) {
            this.userEmail = latestUsers[0].email;
          }
        }
      }

      // 4. Fetch wishlist tour IDs
      if (this.userId) {
        const { data: wishlistData } = await this.supabaseService.client
          .from('wishlists')
          .select('tour_id')
          .eq('user_id', this.userId);

        if (wishlistData) {
          this.wishlistTourIds = new Set(wishlistData.map((item: any) => item.tour_id));
        }
      }
    } catch (err) {
      console.error('Error syncing user ID:', err);
    }

    return this.userId;
  }

  async fetchTours() {
    try {
      this.isLoading = true;

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
        isFavorite: this.wishlistTourIds.has(item.id)
      }));

      this.applyFilters();
    } catch (err) {
      console.error('Error fetching tours:', err);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  async toggleFavorite(tour: Tour) {
    let targetUserId = this.userId;
    if (!targetUserId) {
      targetUserId = await this.syncUserId();
    }

    if (!targetUserId) {
      alert('Please sign in to save tours to your wishlist.');
      return;
    }

    const previousState = tour.isFavorite;
    tour.isFavorite = !previousState;
    this.cdr.detectChanges();

    try {
      if (previousState) {
        const { error } = await this.supabaseService.client
          .from('wishlists')
          .delete()
          .eq('user_id', targetUserId)
          .eq('tour_id', tour.id);

        if (error) throw error;
        this.wishlistTourIds.delete(tour.id);
      } else {
        const { error } = await this.supabaseService.client
          .from('wishlists')
          .insert([{
            user_id: targetUserId,
            tour_id: tour.id,
            created_at: new Date().toISOString()
          }]);

        if (error) throw error;
        this.wishlistTourIds.add(tour.id);
      }
    } catch (err) {
      console.error('Error updating wishlist:', err);
      tour.isFavorite = previousState;
      this.cdr.detectChanges();
    }
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