import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardContent,
  IonItem,
  IonLabel,
  IonIcon,
  IonSpinner
} from '@ionic/angular/standalone';
import { Geolocation, Position } from '@capacitor/geolocation';
import { addIcons } from 'ionicons';
import { locationOutline, navigateOutline } from 'ionicons/icons';

@Component({
  selector: 'app-gps',
  templateUrl: './gps.component.html',
  styleUrls: ['./gps.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonIcon,
    IonSpinner
  ]
})
export class GpsComponent implements OnInit, OnDestroy {
  latitude: number | null = null;
  longitude: number | null = null;
  accuracy: number | null = null;
  altitude: number | null = null;
  isLoading: boolean = true;
  error: string | null = null;
  private watchId: string | null = null;

  constructor() {
    addIcons({ locationOutline, navigateOutline });
  }

  async ngOnInit() {
    await this.checkPermissions();
    await this.startWatchingPosition();
  }

  async checkPermissions() {
    try {
      const permission = await Geolocation.checkPermissions();
      console.log('Permisos GPS:', permission);
      
      if (permission.location !== 'granted') {
        const request = await Geolocation.requestPermissions();
        if (request.location !== 'granted') {
          this.error = 'Permisos de ubicación denegados';
          this.isLoading = false;
        }
      }
    } catch (err) {
      console.error('Error al verificar permisos:', err);
      this.error = 'Error al verificar permisos';
      this.isLoading = false;
    }
  }

  async startWatchingPosition() {
    try {
      this.watchId = await Geolocation.watchPosition(
        { 
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        },
        (position: Position | null, err?: any) => {
          if (err) {
            console.error('Error en watchPosition:', err);
            this.error = 'Error al obtener ubicación';
            this.isLoading = false;
            return;
          }
          
          if (position) {
            this.latitude = position.coords.latitude;
            this.longitude = position.coords.longitude;
            this.accuracy = position.coords.accuracy;
            this.altitude = position.coords.altitude;
            this.isLoading = false;
            this.error = null;
          }
        }
      );
    } catch (err) {
      console.error('Error al iniciar watchPosition:', err);
      this.error = 'Error al iniciar seguimiento GPS';
      this.isLoading = false;
    }
  }

  async ngOnDestroy() {
    if (this.watchId) {
      await Geolocation.clearWatch({ id: this.watchId });
    }
  }
}
