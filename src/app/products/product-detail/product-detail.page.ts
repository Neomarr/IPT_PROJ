import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonButton,
  IonBadge,
  IonIcon,
  
} from '@ionic/angular'; // <-- Fixed package import
import { addIcons } from 'ionicons';
import { heartOutline, heart, shareSocialOutline, locationOutline, calendarOutline, timeOutline } from 'ionicons/icons';

export interface TourDetail {
  id: number;
  name: string;
  price: number;
  status: 'Available' | 'Unavailable' | 'Under Maintenance';
  image: string;
  description: string;
  specs: { engine: string; transmission: string; seats: number };
}

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonButton,
    IonBadge,
    IonIcon,
    
  ]
})
export class ProductDetailPage implements OnInit {
  isFavorite: boolean = false;
  tour!: TourDetail;

  toursData: TourDetail[] = [
    {
      id: 1,
      name: 'Ford Mustang GTExperience',
      price: 60000,
      status: 'Available',
      image: 'assets/tours/ford1.jpg',
      description: "Experience Tokyo's legendary car culture with a roar. Drive through iconic expressways and visit car meeting hotspots in power and style.",
      specs: { engine: '5.0L V8', transmission: 'Automatic', seats: 2 }
    },
    {
      id: 2,
      name: 'Nissan Skyline (R34) Sedan',
      price: 15500,
      status: 'Available',
      image: 'assets/tours/r34.jpg',
      description: 'Step into JDM history with the legendary R34 chassis. Smooth twin-turbo acceleration combined with iconic Japanese engineering.',
      specs: { engine: '2.6L RB26DETT', transmission: 'Manual', seats: 2 }
    },
    {
      id: 3,
      name: 'Nissan GT-R (R35)',
      price: 5600,
      status: 'Available',
      image: 'assets/tours/r35.jpg',
      description: 'Unleash Godzilla on Tokyo highways with twin-turbo AWD power and unmatched road precision.',
      specs: { engine: '3.8L V6 Twin-Turbo', transmission: 'Dual-Clutch', seats: 2 }
    }
  ];

  constructor(private route: ActivatedRoute) {
    addIcons({
      'heart-outline': heartOutline,
      'heart': heart,
      'share-social-outline': shareSocialOutline,
      'location-outline': locationOutline,
      'calendar-outline': calendarOutline,
      'time-outline': timeOutline
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      this.tour = this.toursData.find(t => t.id === id) || this.toursData[0];
    });
  }

  toggleFavorite() {
    this.isFavorite = !this.isFavorite;
  }
}