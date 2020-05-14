import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

import * as sortBy from 'lodash.sortby';

import { CharDataModalPage } from '../class-modal/class-modal.page';
import { ClassParserService } from '../class-parser.service';
import { Router, ActivatedRoute } from '@angular/router';

/*
TODO:
popover w/ options (stored in url):
  - compressed view (no icons, smaller boxes)
  - show only shared chain abilities
  - show only personal chain abilities
  - list duplicates button
*/

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  public chosenCharacters = [];

  public get isChoosingCharacters(): boolean {
    return this.chosenCharacters.length < 3;
  }

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private modalCtrl: ModalController,
    public classParser: ClassParserService
  ) {}

  ngOnInit() {
    let { chars, classes } = this.activatedRoute.snapshot.queryParams;

    if(!chars || !classes) return;

    if(!Array.isArray(chars)) chars = [chars];
    if(!Array.isArray(classes)) classes = [classes];

    this.chosenCharacters = chars.map((charName, i) => {
      if(!this.classParser.isCharacterValid(charName)
      || !this.classParser.isClassValid(charName, classes[i])) return null;

      return { name: charName, chosenClass: classes[i] };
    }).flat();
  }

  isChosen(char: string): boolean {
    return this.chosenCharacters.some(x => x.name === char);
  }

  async choose(char: string) {

    // if we have this char, remove it
    if(this.isChosen(char)) {
      setTimeout(() => {
        this.chosenCharacters = this.chosenCharacters.filter(x => x.name !== char);
        this.refreshUrl();
      });
      return;
    };

    // cannot choose more than 3
    if(this.chosenCharacters.length >= 3) return;

    // pick their class
    const modal = await this.modalCtrl.create({
      component: CharDataModalPage,
      componentProps: {
        character: char
      }
    });

    modal.onDidDismiss().then(({ data }) => {
      if(!data) return;

      // add the chosen one
      setTimeout(() => {
        this.chosenCharacters.push({ name: char, chosenClass: data });
        this.refreshUrl();
      });
    });

    await modal.present();
  }

  sortAbilityLikes(abilityLikes: any[]): any[] {
    return sortBy(
      abilityLikes,
      [
        like => like.statName,
        like => like.statReqValue
      ]
    );
  }

  private refreshUrl() {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        chars: this.chosenCharacters.map(x => x.name),
        classes: this.chosenCharacters.map(x => x.chosenClass)
      }
    });
  }

}
