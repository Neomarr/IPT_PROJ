import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonButtons, IonMenuButton, IonCard, IonCardHeader, 
  IonCardTitle, IonCardContent 
} from '@ionic/angular';

@Component({
  selector: 'app-company-history',
  templateUrl: './company-history.page.html',
  styleUrls: ['./company-history.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent, 
    IonButtons, 
    IonMenuButton, 
    IonCard, 
    IonCardHeader,
    IonCardTitle,
    IonCardContent
  ]
})
export class CompanyHistoryPage {}