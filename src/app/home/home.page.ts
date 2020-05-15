import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalController, PopoverController } from '@ionic/angular';

import { LocalStorage } from 'ngx-webstorage';
import * as sortBy from 'lodash.sortby';

import { CharDataModalPage } from '../class-modal/class-modal.page';
import { ClassParserService } from '../class-parser.service';
import { HomePopoverComponent } from './home.popover';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  @LocalStorage() public compressedView: boolean;
  @LocalStorage() public sortAlpha: boolean;
  @LocalStorage() public personalChains: boolean;
  @LocalStorage() public sharedChains: boolean;
  @LocalStorage() public highlightDupes: boolean;

  public chosenCharacters = [];
  public abilitySpellCounts = {};

  public get isChoosingCharacters(): boolean {
    return this.chosenCharacters.length < 3;
  }

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private popoverCtrl: PopoverController,
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

    this.refreshDupes();
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
        this.refreshDupes();
        this.refreshUrl();
      });
    });

    await modal.present();
  }

  sortAbilityLikes(abilityLikes: any[], canFilter = true): any[] {
    if(canFilter && this.personalChains) {
      abilityLikes = abilityLikes.filter(x => !x.shared);
    }

    if(canFilter && this.sharedChains) {
      abilityLikes = abilityLikes.filter(x => x.shared);
    }

    if(this.sortAlpha) {
      return sortBy(abilityLikes, like => like.name);
    }

    return sortBy(
      abilityLikes,
      [
        like => like.statName,
        like => like.statReqValue
      ]
    );
  }

  async openMenu($event) {
    const popover = await this.popoverCtrl.create({
      component: HomePopoverComponent,
      event: $event,
      translucent: true
    });

    await popover.present();
  }

  public isDupe(key: string): boolean {
    return this.abilitySpellCounts[key] > 1;
  }

  private refreshDupes(): void {
    this.abilitySpellCounts = {};

    const allCharClasses = this.chosenCharacters.map(char => this.classParser.getFullCharacterClass(char.name, char.chosenClass));

    allCharClasses.forEach(charClass => {

      charClass.abilities.forEach(abi => {
        if(!abi.shared) return;
        this.abilitySpellCounts[abi.name] = this.abilitySpellCounts[abi.name] || 0;
        this.abilitySpellCounts[abi.name]++;
      });

      charClass.spells.forEach(spl => {
        this.abilitySpellCounts[spl.name] = this.abilitySpellCounts[spl.name] || 0;
        this.abilitySpellCounts[spl.name]++;
      });

    });
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
