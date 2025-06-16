import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    importProvidersFrom(CommonModule, ReactiveFormsModule),
    provideHttpClient()
  ]
};


