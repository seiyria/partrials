import { Component, Input, OnInit } from '@angular/core';

import { ModalController } from '@ionic/angular';
import { ClassParserService } from '../class-parser.service';

@Component({
  selector: 'app-classmodal',
  templateUrl: './class-modal.page.html',
  styleUrls: ['./class-modal.page.scss'],
})
export class CharDataModalPage implements OnInit {

  @Input() public character: string;

  public allClasses = [];

  constructor(private modalCtrl: ModalController, private classParser: ClassParserService) { }

  ngOnInit() {
    const specificCharData = this.classParser.charData[this.character.toLowerCase()];
    Object.keys(specificCharData.classes).forEach(charClass => {
      this.allClasses.push(this.classParser.getFullCharacterClass(this.character, charClass));
    });
  }

  imageLink(className: string): string {
    return `${this.character.toLowerCase()}-${className.split(' ').join('-').toLowerCase()}`;
  }

  dismiss(tier?: number) {
    this.modalCtrl.dismiss(tier);
  }

}