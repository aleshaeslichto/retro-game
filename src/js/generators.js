import PositionedCharacter from './PositionedCharacter';
import getRandomAlliancePos from './getRandomAlliancePos';
import getRandomHordePos from './getRandomHordePos';
import charClass from './charClass';

/**
 * Generates random characters
 *
 * @param typePerson
 * @param maxLevel max character level
 * @returns Character type children (ex. Magician, Bowman, etc)
 */

function* characterGenerator(typePerson, maxLevel) {
  // TODO: write logic here

  let alliancePosition = getRandomAlliancePos()[Symbol.iterator]();
  let hordePosition = getRandomHordePos()[Symbol.iterator]();
  const character = charClass.create(typePerson, Math.floor(Math.random() * maxLevel) + 1);
  if (character._type === 'bowman' || character._type === 'swordsman' || character._type === 'magician') {
    if (alliancePosition.next().value === undefined) alliancePosition = getRandomAlliancePos()[Symbol.iterator]();
    yield new PositionedCharacter(character, Number(alliancePosition.next().value));
  } else {
    if (hordePosition.next().value === undefined) hordePosition = getRandomHordePos()[Symbol.iterator]();
    yield new PositionedCharacter(character, Number(hordePosition.next().value));
  }
}

export default function generateTeam(allowedTypes, maxLevel, characterCount) {
  // TODO: write logic here

  const array = [];
  for (let i = 0; i < characterCount; i += 1) {
    const type = allowedTypes[Math.trunc(Math.random() * allowedTypes.length)];
    array.push(characterGenerator(type, maxLevel).next().value);
  }
  return array;
}