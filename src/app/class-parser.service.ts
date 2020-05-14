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

  public getFullCharacterClass(char: string, chosenClass: string): any {
    const ret = {
      chosenClass,
      tier: 0,
      path: '',
      abilities: [],
      spells: []
    };

    let currentClass = chosenClass;
    do {
      const data = this.charData[char.toLowerCase()].classes[currentClass];

      // make sure tier is the highest one available
      ret.tier = Math.max(ret.tier, data.tier);

      // set the path (Dark->Light etc)
      let path = data.direction;
      if(data.tier === 1) path = 'Base Class';
      if(data.tier === 4) path = 'Grand Croix';
      ret.path = `${path}${ret.path ? ` → ${ret.path}` : ''}`;

      // get the new ability and spell set with a new "origin" prop for later sorting
      ret.abilities.push(...data.abilities.map(x => Object.assign(x, { origin: currentClass })));
      ret.spells.push(...data.spells.map(x => Object.assign(x, { origin: currentClass })));

      // on to the next
      currentClass = data.requires;
    } while(currentClass);

    return ret;
  }
}
