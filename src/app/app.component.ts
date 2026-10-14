import { Component, OnInit, NgZone, inject, ViewChild } from '@angular/core';

import { Router, RouterLink, NavigationEnd } from '@angular/router';

import { CommonModule } from '@angular/common';

import { filter } from 'rxjs/operators';

import {

  IonApp,

  IonRouterOutlet,

  IonHeader,

  IonToolbar,

  IonTitle,

  IonContent,

  IonList,

  IonItem,

  IonIcon,

  IonLabel,

  IonButtons,

  IonButton,

  IonPopover,

  IonMenuButton,

  IonMenu,

  IonMenuToggle

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

  personOutline,

  bookmarkOutline,

  logOutOutline

} from 'ionicons/icons';

import { App } from '@capacitor/app';

import { AuthService } from '@auth0/auth0-angular';

import { Browser } from '@capacitor/browser';



@Component({

  selector: 'app-root',

  templateUrl: 'app.component.html',

  styleUrls: ['app.component.scss'],

  standalone: true,

  imports: [

    CommonModule,

    RouterLink,

    IonApp,

    IonRouterOutlet,

    IonHeader,

    IonToolbar,

    IonTitle,

    IonContent,

    IonList,

    IonItem,

    IonIcon,

    IonLabel,

    IonButtons,

    IonButton,

    IonPopover,

    IonMenuButton,

    IonMenu,

    IonMenuToggle

  ]

})

export class AppComponent implements OnInit {

  @ViewChild('profilePopover') profilePopover!: IonPopover;



  public auth = inject(AuthService);

  private ngZone = inject(NgZone);

  private router = inject(Router);



  isSplashScreen: boolean = false;



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

      'person-outline': personOutline,

      'bookmark-outline': bookmarkOutline,

      'log-out-outline': logOutOutline

    });

  }



  ngOnInit() {

    App.addListener('appUrlOpen', (event) => {

      this.ngZone.run(() => {

        if (event.url.includes('state=') && (event.url.includes('code=') || event.url.includes('error='))) {

          this.auth.handleRedirectCallback(event.url).subscribe({

            next: () => {

              Browser.close();

              this.router.navigate(['/products']);

            },

            error: (err) => {

              Browser.close();

              console.error('Auth0 Redirect Error:', err);

            }

          });

        }

      });

    });

  }



  presentProfilePopover(event: Event) {

    if (this.profilePopover) {

      this.profilePopover.event = event;

      this.profilePopover.present();

    }

  }



  // Programmatic navigation fix for popovers

  navigateTo(path: string) {

    if (this.profilePopover) {

      this.profilePopover.dismiss();

    }

    this.router.navigateByUrl(path);

  }



  logout(popover: any) {

    popover.dismiss();

    this.auth.logout({

      logoutParams: {

        returnTo: window.location.origin

      }

    });

  }

}