import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { 
  IonContent, 
  IonButton, 
  IonIcon, 
  IonSpinner 
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  heart, 
  arrowForwardOutline, 
  calendarOutline, 
  notificationsOutline, 
  personOutline 
} from 'ionicons/icons';
import { SupabaseService } from '../services/supabase';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.page.html',
  styleUrls: ['./wishlist.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonButton,
    IonIcon,
    IonSpinner
  ]
})
export class WishlistPage implements OnInit {
  private supabaseService: any = inject(SupabaseService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  wishlistItems: any[] = [];
  isLoading: boolean = true;
  userEmail: string | null = null;
  userId: number | null = null;

  constructor() {
    addIcons({
      'heart': heart,
      'arrow-forward-outline': arrowForwardOutline,
      'calendar-outline': calendarOutline,
      'notifications-outline': notificationsOutline,
      'person-outline': personOutline
    });
  }

  async ngOnInit() {
    await this.loadWishlistData();
  }

  async ionViewWillEnter() {
    await this.loadWishlistData();
  }

  async loadWishlistData() {
    try {
      this.isLoading = true;
      this.cdr.detectChanges();

      const user = await firstValueFrom(this.auth.user$);
      if (user && user.email) {
        this.userEmail = user.email;
        await this.fetchUserIdAndWishlist();
      } else {
        this.isLoading = false;
      }
    } catch (err) {
      console.error('Error loading wishlist:', err);
      this.isLoading = false;
    } finally {
      this.cdr.detectChanges();
    }
  }

  async fetchUserIdAndWishlist() {
    try {
      if (!this.userEmail) return;

      const { data: userData, error: userError } = await this.supabaseService.client
        .from('users')
        .select('id')
        .eq('email', this.userEmail)
        .maybeSingle();

      if (userError || !userData) {
        console.warn('User record not found in Supabase:', userError);
        this.isLoading = false;
        return;
      }

      this.userId = userData.id;

      const { data: wishlistData, error: wishlistError } = await this.supabaseService.client
        .from('wishlists')
        .select(`
          id,
          tour_id,
          tours (
            id,
            title,
            name,
            price,
            tour_price,
            status,
            image_url,
            images
          )
        `)
        .eq('user_id', this.userId);

      if (wishlistError) throw wishlistError;

      this.wishlistItems = (wishlistData || []).map((item: any) => {
        const tour = item.tours;
        return {
          wishlist_id: item.id,
          tour_id: item.tour_id,
          title: tour?.title || tour?.name || 'JDM Tour',
          price: tour?.price || tour?.tour_price || 0,
          status: tour?.status || 'AVAILABLE',
          image: tour?.image_url || (tour?.images && tour?.images[0]) || 'assets/placeholder.jpg'
        };
      });

    } catch (err) {
      console.error('Error fetching wishlist:', err);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  async removeFromWishlist(item: any, event: Event) {
    event.stopPropagation();
    try {
      const { error } = await this.supabaseService.client
        .from('wishlists')
        .delete()
        .eq('id', item.wishlist_id);

      if (error) throw error;

      this.wishlistItems = this.wishlistItems.filter(i => i.wishlist_id !== item.wishlist_id);
    } catch (err) {
      console.error('Error removing item from wishlist:', err);
    } finally {
      this.cdr.detectChanges();
    }
  }

  goToTourDetail(tourId: number) {
    this.router.navigate(['/booking'], { queryParams: { tourId } });
  }

  exploreTours() {
    this.router.navigate(['/products']);
  }
}