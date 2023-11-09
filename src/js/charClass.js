import Bowman from './characters/Bowman';
import Swordsman from './characters/Swordsman';
import Magician from './characters/Magician';
import Daemon from './characters/Daemon';
import Undead from './characters/Undead';
import Vampire from './characters/Vampire';


export default class charClass {
  static create(type, level) {
    let charClass;
    if (type === 'bowman') {
        charClass = new Bowman(level, 25, 25, 2, 2);
    }
    if (type === 'swordsman') {
        charClass = new Swordsman(level, 40, 10, 4, 1);
    }
    if (type === 'magician') {
      charClass = new Magician(level, 10, 40, 1, 4);
    }
    if (type === 'daemon') {
      charClass = new Daemon(level, 10, 40, 1, 4);
    }
    if (type === 'undead') {
      charClass = new Undead(level, 40, 10, 4, 1);
    }
    if (type === 'vampire') {
      charClass = new Vampire(level, 25, 25, 2, 2);
    }
    return charClass;
  }
}