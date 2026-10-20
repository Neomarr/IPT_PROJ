import { Component, OnInit, AfterViewInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
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
import * as L from 'leaflet';
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
export class HomePage implements OnInit, AfterViewInit, OnDestroy {
  private supabaseService: any = inject(SupabaseService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  rawTours: any[] = [];
  tours: any[] = [];
  currentIndex: number = 0;
  isLoading: boolean = true;
  private map: L.Map | null = null;

  // Tokyo JDM Tour Route Waypoints
  // Correct ordered waypoints matching your reference project
private tourWaypoints: { name: string; lat: number; lng: number }[] = [
  { name: '1. Pickup — Tokyo Station', lat: 35.6812, lng: 139.7671 },
  { name: '2. A-PIT Super Autobacs Shinonome', lat: 35.6425, lng: 139.8011 },
  { name: '3. Metropolitan Expressway Bayshore Route', lat: 35.6200, lng: 139.7700 },
  { name: '4. Daikoku Parking Area', lat: 35.4628, lng: 139.6796 },
  { name: '5. Rainbow Bridge', lat: 35.6366, lng: 139.7631 },
  { name: '6. Tokyo Tower', lat: 35.6586, lng: 139.7454 }
];

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

  ngAfterViewInit() {
    setTimeout(() => {
      this.initMap();
    }, 300);
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  initMap() {
  const mapElement = document.getElementById('map');
  if (!mapElement) return;

  const defaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
  });

  this.map = L.map('map').setView([35.6000, 139.7500], 11);

  // Esri World Topo Map for English labels without API key limits
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    maxZoom: 18
  }).addTo(this.map);

  const routeLatLngs: L.LatLngExpression[] = [];

  this.tourWaypoints.forEach((waypoint) => {
    const latLng: L.LatLngExpression = [waypoint.lat, waypoint.lng];
    routeLatLngs.push(latLng);

    L.marker(latLng, { icon: defaultIcon })
      .addTo(this.map!)
      .bindPopup(`<b>${waypoint.name}</b>`);
  });

  // Black route line matching reference project styling
  L.polyline(routeLatLngs, {
    color: '#000000',
    weight: 3,
    opacity: 0.95
  }).addTo(this.map);

  const bounds = L.latLngBounds(routeLatLngs as L.LatLngBoundsLiteral);
  this.map.fitBounds(bounds, { padding: [30, 30] });

  setTimeout(() => {
    this.map?.invalidateSize();
  }, 500);
}

  async loadFeaturedTours() {
    try {
      this.isLoading = true;
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
    }
  }
}