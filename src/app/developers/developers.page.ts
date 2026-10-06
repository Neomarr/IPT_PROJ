import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonButtons, IonMenuButton, IonCard, IonAvatar, IonItem, IonLabel 
} from '@ionic/angular';

@Component({
  selector: 'app-developers',
  templateUrl: './developers.page.html',
  styleUrls: ['./developers.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent, 
    IonButtons, IonMenuButton, IonCard, IonAvatar, IonItem, IonLabel
  ]
})
export class DevelopersPage {
  developers = [
    { name: 'Austin James R. Atienza', program: 'BSIT', avatar: 'assets/avatars/dev1.png' },
    { name: 'Neomar Julius S. Cañete', program: 'BSIT', avatar: 'assets/avatars/dev2.png' },
    { name: 'Achilles Julian L. Lucas', program: 'BSIT', avatar: 'assets/avatars/dev3.png' },
    { name: 'Andrew Vann R. Mendoza', program: 'BSIT', avatar: 'assets/avatars/dev4.png' },
    { name: 'Ken Nicolai P. Requez', program: 'BSIT', avatar: 'assets/avatars/dev5.png' }
  ];
}