import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HttpClientModule } from '@angular/common/http'; // Ensure this import

import { routes } from './app.routes';

// Normally, you would not configure HttpClientModule here but ensure it's in your standalone or root module.
export const appConfig: ApplicationConfig = {
  // No need to provide HttpClientModule here like a service, it's typically added in 'imports' of @NgModule or standalone components
  providers: [provideRouter(routes)] // Removed provideHttpClient(), ensure routers and other necessary providers only
};
