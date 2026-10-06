import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { 
  IonApp, 
  IonRouterOutlet, 
  IonSplitPane, 
  IonMenu, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonList, 
  IonItem, 
  IonIcon, 
  IonLabel, 
  IonMenuToggle, 
  IonSearchbar,
  IonButtons,
  IonButton,
  IonPopover,
  IonMenuButton
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  homeOutline, 
  carOutline, 
  calendarOutline, 
  businessOutline, 
  constructOutline, 
  codeSlashOutline, 
  informationCircleOutline, 
  callOutline, 
  searchOutline,
  personOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    IonApp,
    IonRouterOutlet,
    IonSplitPane,
    IonMenu,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonIcon,
    IonLabel,
    IonMenuToggle,
    IonSearchbar,
    IonButtons,
    IonButton,
    IonPopover,
    IonMenuButton
  ]
})
export class AppComponent {
  constructor() {
    addIcons({
      'home-outline': homeOutline,
      'car-outline': carOutline,
      'calendar-outline': calendarOutline,
      'business-outline': businessOutline,
      'construct-outline': constructOutline,
      'code-slash-outline': codeSlashOutline,
      'information-circle-outline': informationCircleOutline,
      'call-outline': callOutline,
      'search-outline': searchOutline,
      'person-outline': personOutline
    });
  }
}