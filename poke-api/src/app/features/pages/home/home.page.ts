
import { Component, inject } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonRefresher, IonRefresherContent, IonList } from '@ionic/angular/standalone';




@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonRefresher, IonRefresherContent, IonList ],
})
export class HomePage {
  
  constructor() {}


}
