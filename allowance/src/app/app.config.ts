import {
  ApplicationConfig,
  importProvidersFrom,
  isDevMode,
  provideBrowserGlobalErrorListeners
} from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, HttpClient } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';
import { provideRouter } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { routes } from './app.routes';

const httpTranslateLoader = (http: HttpClient, document: Document) => {
  const baseHref = document.querySelector('base')?.getAttribute('href') ?? '/';
  const normalized = baseHref.endsWith('/') ? baseHref : `${baseHref}/`;
  return new TranslateHttpLoader(http, `${normalized}i18n/`, '.json');
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(),
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: httpTranslateLoader,
          deps: [HttpClient, DOCUMENT]
        }
      })
    ),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ]
};
