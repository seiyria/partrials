import { Injectable } from '@angular/core';

import * as charData from '../assets/chardata.json';

@Injectable({
  providedIn: 'root'
})
export class ClassParserService {

  public get charData() {
    return (charData as any).default || charData;
  }

  constructor() { }

  public isCharacterValid(char: string): boolean {
    return this.charData[char.toLowerCase()];
  }

  public isClassValid(char: string, charClass: string): boolean {
    return this.charData[char.toLowerCase()].classes[charClass];
  }

  public getFullCharacterClass(char: string, chosenClass: string, upgradeToClass4: boolean): any {
    const ret = {
      className: chosenClass,
      tier: 0,
      path: '',
      abilities: [],
      spells: []
    };

    let currentClass = chosenClass;
    do {
      const data = this.charData[char.toLowerCase()];
      const classData = data.classes[currentClass];

      // make sure tier is the highest one available
      ret.tier = Math.max(ret.tier, classData.tier);

      // set the path (Dark->Light etc)
      let path = classData.direction;
      if(classData.tier === 1) path = 'Base Class';
      ret.path = `${path}${ret.path ? ` → ${ret.path}` : ''}`;

      // get the new ability and spell set with a new "origin" prop for later sorting
      ret.abilities.push(...classData.abilities.map(x => Object.assign(x, { origin: currentClass })));
      ret.spells.push(...classData.spells.map(x => Object.assign(x, { origin: currentClass })));

      // grab the class 4 stuff
      if(classData.tier === 2 && ret.tier === 3 && upgradeToClass4) {
        const class4Data = data.class4[classData.direction];
        ret.className = class4Data.name;
        ret.tier = 4;

        ret.abilities.unshift(...class4Data.abilities.map(x => Object.assign(x, { origin: class4Data.name })));
      }

      // on to the next
      currentClass = classData.requires;
    } while(currentClass);

    return ret;
  }
}
