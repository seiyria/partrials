import { Component } from '@angular/core';
import { PopoverController } from '@ionic/angular';

import { LocalStorage } from 'ngx-webstorage';

@Component({
  template: `
  <ion-content>
    <ion-list>
      <ion-item>
        <ion-checkbox slot="start" [(ngModel)]="compressedView"></ion-checkbox>
        <ion-label>Compressed View</ion-label>
      </ion-item>
      <ion-item>
        <ion-checkbox slot="start" [(ngModel)]="sortAlpha"></ion-checkbox>
        <ion-label>Sort Alphabetically</ion-label>
      </ion-item>
      <ion-item class="ion-text-wrap">
        <ion-checkbox slot="start" [(ngModel)]="personalChains" (ionChange)="togglePersonal()"></ion-checkbox>
        <ion-label>Only Personal Chains</ion-label>
      </ion-item>
      <ion-item>
        <ion-checkbox slot="start" [(ngModel)]="sharedChains" (ionChange)="toggleShared()"></ion-checkbox>
        <ion-label>Only Shared Chains</ion-label>
      </ion-item>
      <ion-item>
        <ion-checkbox slot="start" [(ngModel)]="highlightDupes"></ion-checkbox>
        <ion-label>Highlight Duplicates</ion-label>
      </ion-item>
    </ion-list>
  </ion-content>
  `,
  styles: []
})
export class HomePopoverComponent {

  @LocalStorage() public compressedView: boolean;
  @LocalStorage() public sortAlpha: boolean;
  @LocalStorage() public personalChains: boolean;
  @LocalStorage() public sharedChains: boolean;
  @LocalStorage() public highlightDupes: boolean;

  constructor(public popoverCtrl: PopoverController) {}

  togglePersonal() {
    if(!this.personalChains) return;
    this.sharedChains = false;
  }

  toggleShared() {
    if(!this.sharedChains) return;
    this.personalChains = false;
  }
}