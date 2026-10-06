import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonMenuButton,
  IonButton,
  IonBadge,
  IonIcon
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

export interface Tour {
  id: number;
  name: string;
  price: number;
  description: string;
  status: 'Available' | 'Unavailable' | 'Under Maintenance';
  image: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonMenuButton,
    IonButton,
    IonBadge,
    IonIcon
  ]
})
export class HomePage {
  tours: Tour[] = [
    {
      id: 1,
      name: 'Ford Mustang GTExperience',
      price: 60000,
      description: "Ford Mustang GTExperience Tokyo's legendary car culture with a roar that...",
      status: 'Available',
      image: 'assets/tours/ford1.jpg'
    },
    {
      id: 2,
      name: 'Nissan Skyline (R34) Sedan',
      price: 15500,
      description: 'Experience iconic JDM performance behind the wheel of the legendary R34...',
      status: 'Available',
      image: 'assets/tours/r34.jpg'
    },
    {
      id: 3,
      name: 'Nissan GT-R (R35)',
      price: 5600,
      description: 'Unleash Godzilla on Tokyo highways with twin-turbo AWD power...',
      status: 'Available',
      image: 'assets/tours/r35.jpg'
    }
  ];

  currentIndex: number = 0;

  get currentTour(): Tour {
    return this.tours[this.currentIndex];
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

  nextTour() {
    this.currentIndex = (this.currentIndex + 1) % this.tours.length;
  }

  prevTour() {
    this.currentIndex = (this.currentIndex - 1 + this.tours.length) % this.tours.length;
  }
}