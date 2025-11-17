import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent,
  IonCard,
  IonCardContent,
  IonButtons,
  IonButton,
  IonIcon
} from '@ionic/angular/standalone';
import { GpsComponent } from '../components/gps/gps.component';
import { SensoresComponent } from '../components/sensores/sensores.component';
import { CamaraComponent } from '../components/camara/camara.component';
import { CapacitorFlash } from '@capgo/capacitor-flash';
import { Howl } from 'howler';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonButtons,
    IonButton,
    IonIcon,
    GpsComponent,
    SensoresComponent,
    CamaraComponent
  ],
})
export class HomePage implements OnInit, OnDestroy {
  @ViewChild(SensoresComponent) sensoresComponent!: SensoresComponent;

  showEureka: boolean = false;
  isFlashlightOn: boolean = false;
  isAudioPlaying: boolean = false;

  isDarkMode: boolean = false;  // Control modo oscuro

  private sound: Howl | null = null;
  private previousLuminosityState: boolean = false;
  private eurekaTimeout: any = null;

  constructor() {}

  ngOnInit() {
    this.initializeAudio();
    const darkModeStored = localStorage.getItem('dark-mode');
    this.isDarkMode = darkModeStored === 'true' || window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.updateDarkMode();
  }

  initializeAudio() {
    this.sound = new Howl({
      src: ['assets/audio/eureka.mp3'],
      html5: true,
      volume: 0.8,
      onend: () => {
        this.isAudioPlaying = false;
        console.log('Audio finalizado');
      },
      onloaderror: (id, error) => {
        console.error('Error al cargar audio:', error);
      },
      onplayerror: (id, error) => {
        console.error('Error al reproducir audio:', error);
      }
    });
  }

  async onLuminosityChange(isBelowThreshold: boolean) {
    if (isBelowThreshold === this.previousLuminosityState) return;

    this.previousLuminosityState = isBelowThreshold;

    if (isBelowThreshold) {
      console.log('¡Luminosidad baja detectada! Activando linterna y audio...');
      if (this.eurekaTimeout) {
        clearTimeout(this.eurekaTimeout);
      }
      this.showEureka = true;
      await this.turnOnFlashlight();
      this.playAudio();

      this.eurekaTimeout = setTimeout(async () => {
        this.showEureka = false;
        await this.turnOffFlashlight();
        this.stopAudio();
        this.eurekaTimeout = null;
      }, 5000);

    } else {
      console.log('Luminosidad normal. Desactivando...');
      if (this.eurekaTimeout) {
        clearTimeout(this.eurekaTimeout);
        this.eurekaTimeout = null;
      }
      this.showEureka = false;
      await this.turnOffFlashlight();
      this.stopAudio();
    }
  }

  async turnOnFlashlight() {
    try {
      const available = await CapacitorFlash.isAvailable();
      if (available.value) {
        await CapacitorFlash.switchOn({ intensity: 100 });
        this.isFlashlightOn = true;
        console.log('Linterna encendida');
      } else {
        console.warn('Linterna no disponible en este dispositivo');
      }
    } catch (error) {
      console.error('Error al encender linterna:', error);
    }
  }

  async turnOffFlashlight() {
    try {
      if (this.isFlashlightOn) {
        await CapacitorFlash.switchOff();
        this.isFlashlightOn = false;
        console.log('Linterna apagada');
      }
    } catch (error) {
      console.error('Error al apagar linterna:', error);
    }
  }

  playAudio() {
    if (this.sound && !this.isAudioPlaying) {
      this.sound.play();
      this.isAudioPlaying = true;
      console.log('Reproduciendo audio Eureka');
    }
  }

  stopAudio() {
    if (this.sound && this.isAudioPlaying) {
      this.sound.stop();
      this.isAudioPlaying = false;
      console.log('Audio detenido');
    }
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    this.updateDarkMode();
    localStorage.setItem('dark-mode', this.isDarkMode ? 'true' : 'false');
  }

  updateDarkMode() {
    if (this.isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }

  ngOnDestroy() {
    this.turnOffFlashlight();
    this.stopAudio();
    if (this.sound) {
      this.sound.unload();
    }
  }
}
