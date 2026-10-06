import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonButtons, 
  IonMenuButton, 
  IonButton,
  IonInput,
  IonTextarea,
  IonIcon
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  locationOutline, 
  callOutline, 
  mailOutline, 
  timeOutline, 
  logoInstagram, 
  logoTiktok 
} from 'ionicons/icons';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.page.html',
  styleUrls: ['./contact-us.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonMenuButton,
    IonButton,
    IonInput,
    IonTextarea,
    IonIcon
  ]
})
export class ContactUsPage {
  constructor() {
    addIcons({
      'location-outline': locationOutline,
      'call-outline': callOutline,
      'mail-outline': mailOutline,
      'time-outline': timeOutline,
      'logo-instagram': logoInstagram,
      'logo-tiktok': logoTiktok
    });
  }

  onSubmit() {
    console.log('Message sent!');
  }
}