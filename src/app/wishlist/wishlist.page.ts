import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { firstValueFrom, timeout, catchError, of } from 'rxjs';
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

      // 2. Fetch user_id from Supabase 'users' table using email
      if (this.userEmail) {
        const { data: userData } = await this.supabaseService.client
          .from('users')
          .select('user_id')
          .eq('email', this.userEmail)
          .maybeSingle();

        if (userData?.user_id) {
          this.userId = userData.user_id;
        }
      }

      // 3. Fallback: Query users table using user_id primary key
      if (!this.userId) {
        const { data: latestUsers } = await this.supabaseService.client
          .from('users')
          .select('user_id')
          .order('user_id', { ascending: false })
          .limit(1);

        if (latestUsers && latestUsers.length > 0) {
          this.userId = latestUsers[0].user_id;
        }
      }

      if (!this.userId) {
        console.warn('No active user ID found in Supabase.');
        this.wishlistItems = [];
        return;
      }

      // 4. Fetch raw wishlist rows for user
      const { data: wishlistData, error: wishlistErr } = await this.supabaseService.client
        .from('wishlists')
        .select('id, tour_id')
        .eq('user_id', this.userId);

      if (wishlistErr) throw wishlistErr;

      if (!wishlistData || wishlistData.length === 0) {
        this.wishlistItems = [];
        return;
      }

      const tourIds = wishlistData.map((item: any) => item.tour_id);

      // 5. Fetch matching tours & tour_images
      const { data: toursData, error: toursErr } = await this.supabaseService.client
        .from('tours')
        .select('*, tour_images(*)')
        .in('id', tourIds);

      if (toursErr) throw toursErr;

      // 6. Map wishlist items for display
      this.wishlistItems = wishlistData.map((wItem: any) => {
        const tour = (toursData || []).find((t: any) => t.id === wItem.tour_id);
        const imageObj = tour?.tour_images && tour.tour_images.length > 0 ? tour.tour_images[0] : null;

        return {
          wishlist_id: wItem.id,
          tour_id: wItem.tour_id,
          title: tour?.name || tour?.title || 'JDM Tour',
          price: tour?.price || tour?.tour_price || 0,
          status: tour?.status || 'AVAILABLE',
          image: imageObj?.image_url || imageObj?.url || imageObj?.image || 'assets/placeholder.jpg'
        };
      });

    } catch (err) {
      console.error('Error in loadWishlistData:', err);
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
    this.router.navigate(['/products/product-detail', tourId]);
  }

  exploreTours() {
    this.router.navigate(['/products']);
  }
}