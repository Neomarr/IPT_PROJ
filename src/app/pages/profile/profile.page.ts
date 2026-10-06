import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonToolbar, 
  IonCard, 
  IonCardContent, 
  IonInput, 
  IonButton 
} from '@ionic/angular';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    IonContent, 
    IonHeader, 
    IonToolbar, 
    IonCard, 
    IonCardContent, 
    IonInput, 
    IonButton
  ]
})
export class ProfilePage implements OnInit {
  fullName: string = 'qnjscanete@tip.edu.ph';
  email: string = 'qnjscanete@tip.edu.ph';
  phone: string = '09457949928';

  constructor() { }

  ngOnInit() { }

  saveProfile() {
    console.log('Saved Profile:', {
      fullName: this.fullName,
      email: this.email,
      phone: this.phone
    });
  }
}