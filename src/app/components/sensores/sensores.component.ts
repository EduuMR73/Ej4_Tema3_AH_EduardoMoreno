import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonIcon,
  IonBadge
} from '@ionic/angular/standalone';
import { Motion, MotionEventResult } from '@capacitor/motion';
import type { PluginListenerHandle } from '@capacitor/core';
import { addIcons } from 'ionicons';
import { speedometerOutline, waterOutline, sunnyOutline } from 'ionicons/icons';

@Component({
  selector: 'app-sensores',
  templateUrl: './sensores.component.html',
  styleUrls: ['./sensores.component.scss'],
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
    IonBadge
  ]
})
export class SensoresComponent implements OnInit, OnDestroy {
  accelX: number = 0;
  accelY: number = 0;
  accelZ: number = 0;
  humidity: number = 45;
  luminosity: number = 500;

  @Output() luminosityBelowThreshold = new EventEmitter<boolean>();

  private accelHandler: PluginListenerHandle | null = null;
  private readonly LUMINOSITY_THRESHOLD = 50;
  private humidityInterval: any;

  constructor() {
    addIcons({ speedometerOutline, waterOutline, sunnyOutline });
  }

  async ngOnInit() {
    await this.startSensors();
  }

  async startSensors() {
    try {
      if (typeof (DeviceMotionEvent as any)?.requestPermission === 'function') {
        const permission = await (DeviceMotionEvent as any).requestPermission();
        if (permission !== 'granted') {
          console.error('Permiso de sensores denegado');
          return;
        }
      }

      this.accelHandler = await Motion.addListener('accel', (event: MotionEventResult) => {
        this.accelX = event.accelerationIncludingGravity.x;
        this.accelY = event.accelerationIncludingGravity.y;
        this.accelZ = event.accelerationIncludingGravity.z;
        this.simulateLuminosity();
      });

      this.humidityInterval = setInterval(() => {
        this.humidity = Math.max(30, Math.min(90, this.humidity + (Math.random() - 0.5) * 2));
      }, 2000);

    } catch (error) {
      console.error('Error al iniciar sensores:', error);
    }
  }

  simulateLuminosity() {
    const totalAccel = Math.abs(this.accelX) + Math.abs(this.accelY) + Math.abs(this.accelZ);

    if (totalAccel < 0.2) {
      this.luminosity = 10;
    } else {
      this.luminosity = Math.max(0, Math.min(1000, totalAccel * 50));
    }

    if (this.luminosity < this.LUMINOSITY_THRESHOLD) {
      this.luminosityBelowThreshold.emit(true);
    } else {
      this.luminosityBelowThreshold.emit(false);
    }
  }

  getLuminosityStatus(): string {
    if (this.luminosity < 50) return 'Muy Baja';
    if (this.luminosity < 200) return 'Baja';
    if (this.luminosity < 500) return 'Media';
    return 'Alta';
  }

  getLuminosityColor(): string {
    if (this.luminosity < 50) return 'danger';
    if (this.luminosity < 200) return 'warning';
    if (this.luminosity < 500) return 'primary';
    return 'success';
  }

  async ngOnDestroy() {
    if (this.accelHandler) {
      await this.accelHandler.remove();
    }
    if (this.humidityInterval) {
      clearInterval(this.humidityInterval);
    }
  }
}
