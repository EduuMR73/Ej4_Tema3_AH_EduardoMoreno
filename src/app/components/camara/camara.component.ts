import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardContent,
  IonButton,
  IonIcon,
  IonImg
} from '@ionic/angular/standalone';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { addIcons } from 'ionicons';
import { cameraOutline, imagesOutline } from 'ionicons/icons';

@Component({
  selector: 'app-camara',
  templateUrl: './camara.component.html',
  styleUrls: ['./camara.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonIcon,
    IonImg
  ]
})
export class CamaraComponent {
  imageUrl: string | null = null;

  constructor() {
    addIcons({ cameraOutline, imagesOutline });
  }

  async takePicture() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      });

      this.imageUrl = image.webPath || null;
      console.log('Foto capturada:', this.imageUrl);
    } catch (error) {
      console.error('Error al tomar foto:', error);
    }
  }

  async selectFromGallery() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos
      });

      this.imageUrl = image.webPath || null;
      console.log('Imagen seleccionada:', this.imageUrl);
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
    }
  }
}
