import Team from "./Team";
import Bowman from "./characters/Bowman";
import Daemon from "./characters/Daemon";
import Magician from "./characters/Magician";
import Swordsman from "./characters/Swordsman";
import Undead from "./characters/Undead";
import Vampire from "./characters/Vampire";

/**
 * Формирует экземпляр персонажа из массива allowedTypes со
 * случайным уровнем от 1 до maxLevel
 *
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @returns генератор, который при каждом вызове
 * возвращает новый экземпляр класса персонажа
 *
 */
export function* characterGenerator(allowedTypes, maxLevel) {
const playerTypes = {
  bowman: Bowman,
  swordsman: Swordsman,
  magician: Magician,
  daemon: Daemon,
  undead: Undead,
  vampire: Vampire,
};
  // TODO: write logic here
  while (true) {
    const type = Math.floor(math.random() * allowedTypes.length);
    const level = Math.floor(Math.random() * maxLevel + 1);
    const a = allowedTypes[type];

    yield new playerTypes[a](level);
  }
}

/**
 * Формирует массив персонажей на основе characterGenerator
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @param characterCount количество персонажей, которое нужно сформировать
 * @returns экземпляр Team, хранящий экземпляры персонажей. Количество персонажей в команде - characterCount
 * */
export function generateTeam(allowedTypes, maxLevel, characterCount) {
  const team = [];
  const playerGenerator = characterGenerator(allowedTypes, maxLevel);
  let count = 1;
  for (const _ of Array(characterCount)) {
    team.push(playerGenerator.next().value);
    count++;
  }
  return new Team(team);
}

