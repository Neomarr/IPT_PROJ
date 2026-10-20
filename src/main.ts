import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular';
import { provideAuth0 } from '@auth0/auth0-angular';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideAuth0({
      domain: 'dev-tt0hq6gyqbf8bezl.jp.auth0.com',
      clientId: 'xYwffAlzJzzDM6LJ9k0Md0Xern4EPx1m',
      authorizationParams: {
        redirect_uri: 'http://localhost:8100'
      }
    }),
  ],
});