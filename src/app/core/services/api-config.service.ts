import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  private apiBaseUrl = environment.apiBaseUrl;

  getApiUrl(endpoint: string): string {
    return `${this.apiBaseUrl}/${endpoint}`;
  }

  checkApiHealth(): Promise<boolean> {
    return fetch(this.apiBaseUrl)
      .then(response => response.ok)
      .catch(() => false);
  }
}
