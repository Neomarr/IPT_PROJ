import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonButtons, IonMenuButton, IonCard, IonCardHeader, 
  IonCardTitle, IonCardContent, IonIcon 
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { carOutline, shieldCheckmarkOutline, timeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-about-services',
  templateUrl: './about-services.page.html',
  styleUrls: ['./about-services.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent, 
    IonButtons, IonMenuButton, IonCard, IonCardHeader, 
    IonCardTitle, IonCardContent, IonIcon
  ]
})
export class AboutServicesPage {
  services = [
    {
      title: 'Guided Highway Tours',
      description: 'Experience Tokyo highways accompanied by expert tour leads.',
      icon: 'car-outline'
    },
    {
      title: 'Full Insurance Coverage',
      description: 'Drive worry-free with dynamic insurance plans built into every package.',
      icon: 'shield-checkmark-outline'
    },
    {
      title: 'Flexible Scheduling',
      description: 'Book morning, sunset, or midnight expressway slots seamlessly.',
      icon: 'time-outline'
    }
  ];

  constructor() {
    addIcons({ carOutline, shieldCheckmarkOutline, timeOutline });
  }
}