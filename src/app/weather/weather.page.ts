import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonContent, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonButtons, 
  IonBackButton, 
  IonSpinner 
} from '@ionic/angular';

export interface WeatherDay {
  date: string;
  description: string;
  maxTemp: number;
  minTemp: number;
  weatherCode: number;
  icon: string;
}

@Component({
  selector: 'app-weather',
  templateUrl: './weather.page.html',
  styleUrls: ['./weather.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonSpinner
  ]
})
export class WeatherPage implements OnInit {
  private cdr = inject(ChangeDetectorRef);

  forecast: WeatherDay[] = [];
  isLoading: boolean = true;

  // Tokyo Coordinates
  private lat = 35.6762;
  private lng = 139.6503;

  ngOnInit() {
    this.fetchWeather();
  }

  async fetchWeather() {
    try {
      this.isLoading = true;
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${this.lat}&longitude=${this.lng}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FTokyo`;

      const response = await fetch(url);
      const data = await response.json();

      const daily = data.daily;
      const items: WeatherDay[] = [];

      if (daily && daily.time) {
        for (let i = 0; i < daily.time.length; i++) {
          const code = daily.weather_code[i];
          items.push({
            date: daily.time[i],
            maxTemp: Math.round(daily.temperature_2m_max[i]),
            minTemp: Math.round(daily.temperature_2m_min[i]),
            weatherCode: code,
            description: this.getWmoDescription(code),
            icon: this.getWmoIcon(code)
          });
        }
      }

      this.forecast = items;
    } catch (err) {
      console.error('Error fetching Open-Meteo weather:', err);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  getWmoDescription(code: number): string {
    switch (code) {
      case 0: return 'Clear sky';
      case 1: case 2: return 'Partly cloudy';
      case 3: return 'Overcast';
      case 45: case 48: return 'Foggy';
      case 51: case 53: case 55: return 'Light drizzle';
      case 56: case 57: case 61: case 63: case 65: return 'Moderate drizzle';
      case 80: case 81: case 82: return 'Rain showers';
      case 95: case 96: case 99: return 'Thunderstorm';
      default: return 'Light drizzle';
    }
  }

  getWmoIcon(code: number): string {
    if (code === 0) return '☀️';
    if (code === 1 || code === 2) return '⛅';
    if (code === 3) return '☁️';
    if (code >= 51 && code <= 65) return '🌧️';
    if (code >= 80) return '🌦️';
    return '🌧️';
  }
}