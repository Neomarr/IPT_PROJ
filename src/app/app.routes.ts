import { Routes } from '@angular/router';



export const routes: Routes = [

  {

    path: '',

    redirectTo: 'splash',

    pathMatch: 'full'

  },

  {

    path: 'splash',

    loadComponent: () => import('./splash/splash.page').then(m => m.SplashPage)

  },

  {

    path: 'home',

    loadComponent: () => import('./home/home.page').then(m => m.HomePage),

  },

  {

    path: 'products',

    loadComponent: () => import('./products/products.page').then(m => m.ProductsPage),

  },

  {

    path: 'products/product-detail/:id',

    loadComponent: () => import('./products/product-detail/product-detail.page').then(m => m.ProductDetailPage),

  },

  {

    path: 'booking',

    loadComponent: () => import('./booking/booking.page').then(m => m.BookingPage)

  },

  {

    path: 'about-app',

    loadComponent: () => import('./about-app/about-app.page').then(m => m.AboutAppPage)

  },

  {

    path: 'contact-us',

    loadComponent: () => import('./contact-us/contact-us.page').then(m => m.ContactUsPage)

  },

  {

    path: 'company-history',

    loadComponent: () => import('./company-history/company-history.page').then(m => m.CompanyHistoryPage)

  },

  {

    path: 'about-services',

    loadComponent: () => import('./about-services/about-services.page').then(m => m.AboutServicesPage)

  },

  {

    path: 'developers',

    loadComponent: () => import('./developers/developers.page').then(m => m.DevelopersPage)

  },

  {

    path: 'profile',

    loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePage)

  },

  {

    path: 'login',

    loadComponent: () => import('./login/login.page').then(m => m.LoginPage)

  },

  {

    path: 'wishlist',

    loadComponent: () => import('./wishlist/wishlist.page').then( m => m.WishlistPage)

  }

];