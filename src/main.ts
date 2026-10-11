import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular, isPlatform } from '@ionic/angular';
import { provideAuth0 } from '@auth0/auth0-angular';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

const redirectUri = isPlatform('capacitor')
  ? 'com.jdmexperience.app://' + environment.auth0Domain + '/capacitor/com.jdmexperience.app/callback'
  : window.location.origin;

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideAuth0({
      domain: environment.auth0Domain,
      clientId: environment.auth0ClientId,
      authorizationParams: {
        redirect_uri: redirectUri
      }
    })
  ],
});