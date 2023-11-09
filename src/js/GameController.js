import themes from './themes';
import generateTeam from './generators';
import GamePlay from './GamePlay';
import GameState from './GameState';
import getRandomAlliancePos from './getRandomAlliancePos';
import PositionedCharacter from './PositionedCharacter';
import Character from './characters/Character';
import Team from './teams';




export default class GameController {
    constructor(gamePlay, stateService) {
        this.gamePlay = gamePlay;
        this.stateService = stateService;
        this.teams = new Team();
        this.allianceTeam = [];
        this.hordeTeam = [];
        this.move = this.allianceTeam;
        this.selectedCharacter = null;
        this.level = themes.prairie;
        this.playerPoints = 0;
        this.GameState = GameState.from(this);
    }
    // initialization
    init() {
        // add event listeners to gamePlay events
        if (sessionStorage.getItem('game')) {
            this.getSessionStorage();
        } else {
            this.gamePreparation();
        }
        this.gamePlay.drawUi(this.level);
        this.gamePlay.redrawPositions([...this.allianceTeam, ...this.hordeTeam]);
        // load saved stated from stateService
        this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
        this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
        this.gamePlay.addCellClickListener(this.onCellClick.bind(this));

        this.gamePlay.addNewGameListener(this.onNewGameClick.bind(this));
        this.gamePlay.addSaveGameListener(this.onSaveGameClick.bind(this));
        this.gamePlay.addLoadGameListener(this.onLoadGameClick.bind(this));
    }

    // save state session
    saveSession() {
        this.GameState = GameState.from(this);
        sessionStorage.setItem('game', JSON.stringify(this.GameState));
    }

    // preparation teams for gameplay and setting session state

    gamePreparation() {
        this.allianceTeam = generateTeam([this.teams.allianceRepository[0], this.teams.allianceRepository[1]], 1, 2);
        this.hordeTeam = generateTeam(this.teams.hordeRepository, 2, 2);
        this.move = this.allianceTeam;
        this.saveSession();
        console.log(this.allianceTeam);
        console.log(this.hordeTeam);
    }

    // preparing for next level
    preparationNextLevelUp() {

        let countCharacter = 2;
        let maxLevelAlliance = 1;
        let maxLevelHorde = 2;

        if (this.level === 'desert') {
            countCharacter = 1;
        }
        if (this.level === 'arctic') {
            countCharacter = 2;
            maxLevelAlliance = 2;
            maxLevelHorde = 3;
        }
        if (this.level === 'mountain') {
            countCharacter = 2;
            maxLevelAlliance = 3;
            maxLevelHorde = 4;
        }

        // generate new alliance team and getting new random position out of iteration
        const allianceTeam = generateTeam(this.teams.allianceRepository, maxLevelAlliance, countCharacter).map((character) => character);
        const randomAlliancePos = getRandomAlliancePos()[Symbol.iterator]();
        this.allianceTeam = [...this.allianceTeam, ...allianceTeam];
        this.allianceTeam.forEach((character) => {
            const person = character;
            person.position = randomAlliancePos.next().value;
        });

        //same for horde team
        this.hordeTeam = generateTeam(this.teams.hordeRepository, maxLevelHorde, this.allianceTeam.length);

        // setting 1st move for alliance
        this.move = this.allianceTeam;

        this.saveSession();
    }

    // getting state of game session
    getSessionStorage() {
        const loadObject = JSON.parse(sessionStorage.getItem('game'));
        this.transformStateObject(loadObject);
    }


    // handle everywhere
    onNewGameClick() {
        this.allianceTeam = [];
        this.hordeTeam = [];
        this.level = themes.prairie;
        this.gamePreparation();
        this.gamePlay.drawUi(this.level);
        this.gamePlay.redrawPositions([...this.allianceTeam, ...this.hordeTeam]);
        this.move = this.allianceTeam;
    }

    onSaveGameClick() {
        this.stateService.save(this.gameState);
        GamePlay.showMessage('Игра успешно сохранена.');
    }

    onLoadGameClick() {
        const loadObject = this.stateService.load();
        this.transformStateObject(loadObject);
        sessionStorage.setItem('game', JSON.stringify(this.gameState));
        GamePlay.showMessage('Игра успешно загружена.');
        this.gamePlay.drawUi(this.level);
        this.gamePlay.redrawPositions([...this.allianceTeam, ...this.hordeTeam]);
    }

    async onCellClick(index) {
        if (!(this.selectedCharacter)) {
            if (!(this.gamePlay.cells[index].hasChildNodes())) return;
            if (!(GameController.checkCurrentCharacter(this.gamePlay.cells[index].firstChild.classList[1])) &&
                this.gamePlay.cells[index].hasChildNodes() &&
                !(this.gamePlay.cells[index].classList.contains('selected-green')) &&
                !(this.gamePlay.cells[index].classList.contains('selected-red'))) {
                GamePlay.showError('Нельзя выбрать игрока противоположной команды!');
                return;
            }
        }

        // moving character
        if (this.selectedCharacter && this.gamePlay.cells[index].classList.contains('selected-green')) {
            this.gamePlay.deselectCell(this.selectedCharacter.position);
            this.gamePlay.deselectCell(index);
            this.selectedCharacter.position = index;
            this.saveSession();
            this.gamePlay.redrawPositions([...this.allianceTeam, ...this.hordeTeam]);
            await this.moveHordeTeam();
            this.move = this.allianceTeam;
            return;
        }

        // attack character
        if (this.selectedCharacter && this.gamePlay.cells[index].classList.contains('selected-red')) {
            this.gamePlay.deselectCell(index);
            this.gamePlay.deselectCell(this.selectedCharacter.position);
            await this.attackPerson(index);
            this.gamePlay.redrawPositions([...this.allianceTeam, ...this.hordeTeam]);
            if (this.hordeTeam.length === 0) {
                if (this.level === 'mountain') {
                    GamePlay.showMessage('Вы выйграли игру!');
                    return;
                }
                this.winAndLevelUpGame();
            }
            this.gamePlay.redrawPositions([...this.allianceTeam, ...this.hordeTeam]);
            await this.moveHordeTeam();
            this.gamePlay.deselectCell(index);
            this.move = this.allianceTeam;
            return;
        }

        // time to chose character
        if (this.selectedCharacter &&
            this.gamePlay.cells[index].hasChildNodes() &&
            (GameController.checkCurrentCharacter(this.gamePlay.cells[index].firstChild.classList[1]))) {
            this.gamePlay.deselectCell(this.selectedCharacter.position);
            this.gamePlay.selectCell(index);
            this.selectedCharacter = this.move.find((elem) => elem.position === index);
            return;
        }

        if (!this.selectedCharacter &&
            this.gamePlay.cells[index].hasChildNodes() &&
            (GameController.checkCurrentCharacter(this.gamePlay.cells[index].firstChild.classList[1]))) {
            this.gamePlay.selectCell(index);
            this.selectedCharacter = this.move.find((elem) => elem.position === index);
        }
    }

    // horde character movement
    async moveHordeTeam() {
        this.move = this.hordeTeam;
        const accessAttackPerson = this.hordeTeam.reduce((arr, person) => {
            const accessAttack = this.getAttackCharacter(person)
                .filter((elem) => this.gamePlay.cells[Number(elem)].hasChildNodes())
                .filter((element) => (GameController.checkCurrentCharacter(this.gamePlay.cells[element].firstChild.classList[1])));
            if (accessAttack.length > 0) {
                arr.push({
                    person,
                    accessAttack
                });
            }
            return arr;
        }, []);
        if (accessAttackPerson.length > 0) {
            if (accessAttackPerson.length < 2) {
                this.selectedCharacter = accessAttackPerson[0].person;
                const cellIndex = this.selectedCharacter.position;
                this.gamePlay.selectCell(cellIndex);
                this.gamePlay.redrawPositions([...this.allianceTeam, ...this.hordeTeam]);
                const randomIndex = accessAttackPerson[0].accessAttack[Math.round(Math.random() * (accessAttackPerson[0].accessAttack.length - 1))];
                await this.attackPerson(randomIndex);
                if (this.allianceTeam.length === 0) {
                    GamePlay.showMessage('Вы проиграли!');
                }
                this.gamePlay.deselectCell(cellIndex);
                this.gamePlay.redrawPositions([...this.allianceTeam, ...this.hordeTeam]);
                return;
            }
            const index = Math.round(Math.random() * (accessAttackPerson.length - 1));
            this.selectedCharacter = accessAttackPerson[index].person;
            const cellIndex = this.selectedCharacter.position;
            this.gamePlay.selectCell(cellIndex);
            this.gamePlay.redrawPositions([...this.allianceTeam, ...this.hordeTeam]);
            const indexAttack = accessAttackPerson[index].accessAttack[Math.round(Math.random() * (accessAttackPerson[index].accessAttack.length - 1))];
            await this.attackPerson(indexAttack);
            if (this.allianceTeam.length === 0) {
                GamePlay.showMessage('Вы проиграли!');
            }
            this.gamePlay.deselectCell(cellIndex);
            this.gamePlay.redrawPositions([...this.allianceTeam, ...this.hordeTeam]);
            return;
        }
        this.selectedCharacter = this.hordeTeam[Math.round(Math.random() * (this.hordeTeam.length - 1))];
        const moves = this.getDistanceCharacter(this.selectedCharacter).filter((elem) => !this.gamePlay.cells[elem].hasChildNodes());
        this.selectedCharacter.position = moves[Math.round(Math.random() * (moves.length - 1))];
        this.gamePlay.redrawPositions([...this.allianceTeam, ...this.hordeTeam]);
        this.selectedCharacter = null;
        this.move = this.allianceTeam;
    }

    // TODO: react to mouse enter
    onCellEnter(index) {
        this.gamePlay.setCursor('');

        if (this.move === this.hordeTeam) return;

        this.gamePlay.cells.forEach((elem, count) => {
            const cellEnter = [...elem.classList].filter((className) => className === 'selected');
            if (cellEnter) {
                this.gamePlay.cells[count].classList.remove('selected-green');
                this.gamePlay.cells[count].classList.remove('selected-red');
            }
        });

        if (this.gamePlay.cells[index].hasChildNodes()) {
            // select cursor when hover on char
            [...this.gamePlay.cells[index].querySelector('.character').classList].forEach((elem) => {
                if (['bowman', 'swordsman', 'magician'].includes(elem)) {
                    this.gamePlay.setCursor('pointer');
                }
            });
            this.gamePlay.showCellTooltip(this.getTooltip(index), index);
        }

        if (this.selectedCharacter && !(this.gamePlay.cells[index].hasChildNodes())) {
            if (this.getDistanceCharacter(this.selectedCharacter).includes(index)) {
                this.gamePlay.setCursor('pointer');
                this.gamePlay.selectCell(index, 'green');
            } else {
                this.gamePlay.setCursor('not-allowed');
            }
        }

        if (this.selectedCharacter && (this.gamePlay.cells[index].hasChildNodes())) {
            if (!GameController.checkCurrentCharacter(this.gamePlay.cells[index].firstChild.classList[1])) {
                if (this.getAttackCharacter(this.selectedCharacter).includes(index)) {
                    this.gamePlay.setCursor('crosshair');
                    this.gamePlay.selectCell(index, 'red');
                } else {
                    this.gamePlay.setCursor('not-allowed');
                }
            } else {
                this.gamePlay.setCursor('pointer');
            }
        }
    }

    // TODO: react to mouse leave
    onCellLeave(index) {
        if (this.gamePlay.cells[index].hasChildNodes()) {
            this.gamePlay.hideCellTooltip(index);
        }
    }

    // char vs char attack logic
    attackPerson(index) {

        return new Promise(resolve => {

            // getting data about char
            const attacker = this.selectedCharacter.character;
            const targetTeam = this.move === this.allianceTeam ? this.hordeTeam : this.allianceTeam;
            const target = targetTeam.find(c => c.position === index);

            // random crit damage
            const isCrit = Math.random() < 0.25;

            // calc damage
            let damage = attacker._attack - target.character._defence;
            damage = Math.max(damage, attacker._attack * 0.1);
            if (isCrit) {
                damage *= 1.5;
            }

            damage = damage.toFixed(1);

            // give some damage and show animation about it
            target.character._health -= Number(damage);
            this.gamePlay.showDamage(index, damage)
                .then(() => {

                    // delete character when he dies
                    if (target.character._health <= 0) {
                        const targetIndex = targetTeam.indexOf(target);
                        targetTeam.splice(targetIndex, 1);
                    }

                    this.saveSession();
                    this.selectedCharacter = null;
                    resolve();
                });
        });

    }

    // lvlup and next level logic
    winAndLevelUpGame() {
        GamePlay.showMessage('Вы выиграли! Поздравляем с переходом на новый уровень.');

        this.playerPoints += [...this.allianceTeam].reduce((sum, character) => sum + character.character._health, 0);
        let level;
        Object.values(themes).forEach((elem, index) => {
            if (elem === this.level) {
                level = (index + 1 < Object.values(themes).length) ? Object.values(themes)[index + 1] : Object.values(themes)[0];
            }
        });
        this.level = level;
        this.allianceTeam.forEach((character) => character.character.levelUp());
        this.preparationNextLevelUp();
        this.gamePlay.drawUi(this.level);
        this.gamePlay.redrawPositions([...this.allianceTeam, ...this.hordeTeam]);
    }

    // getting variables of movement distance

    getDistanceCharacter(character) {
        const variantDistance = this.gamePlay.cells.reduce((arr, cell, index) => {
          if (index < character.character._distance + 1) {
            const [row, coll] = this.convertTo2DCoords(character.position);
            arr.push([row - index, coll]);
            arr.push([row - index, coll + index]);
            arr.push([row, coll + index]);
            arr.push([row + index, coll + index]);
            arr.push([row + index, coll]);
            arr.push([row + index, coll - index]);
            arr.push([row, coll - index]);
            arr.push([row - index, coll - index]);
          }
          return arr;
        }, []);
    
        return [...this.convertFrom2DToCoords(variantDistance)];
      }
    

    // character tooltip
    getTooltip(index) {
        const person = [...this.allianceTeam, ...this.hordeTeam].find((character) => character.position === index);
        const medalImage = '\u{1F396}';
        const attackImage = '\u{2694}';
        const defenceImage = '\u{1F6E1}';
        const healthImage = '\u{2764}';
        // eslint-disable-next-line max-len
        return `${medalImage}${person.character._level}  ${attackImage}${person.character._attack}  ${defenceImage}${person.character._defence}  ${healthImage}${person.character._health.toFixed(1)}`;
    }

    // variables of attack characters
    getAttackCharacter(person) {
        const arrayCoords = this.gamePlay.cells.reduce((arr, cell, index) => {
            if (index <= person.character._distanceAttack) {
                const [row, coll] = this.convertTo2DCoords(person.position);
                arr.push([row + index, coll]);
                arr.push([row - index, coll]);
            }
            return arr;
        }, []);
        arrayCoords.forEach((elem) => {
            const [y, x] = elem;
            for (let i = 0; i <= person.character._distanceAttack; i += 1) {
                arrayCoords.push([y, x + i]);
                arrayCoords.push([y, x - i]);
            }
        });
        return [...this.convertFrom2DToCoords(arrayCoords)];
    }

    // convert to coordinates board
    convertTo2DCoords(index) {
        return [Math.trunc(index / this.gamePlay.boardSize), index % this.gamePlay.boardSize];
    }

    // convert to cell number of board
    convertFrom2DToCoords(array) {
        return array.reduce((set, elem) => {
            const [row, coll] = elem;
            if ((coll >= 0 && coll < this.gamePlay.boardSize) &&
                (row >= 0 && row < this.gamePlay.boardSize)
            ) {
                set.add(this.gamePlay.boardSize * row + coll);
            }
            return set;
        }, new Set());
    }

    // check who's can move
    static checkCurrentCharacter(nameCharacter) {
        return (['bowman', 'swordsman', 'magician'].includes(nameCharacter));
    }

    // transform game state to object
    transformStateObject(loadObject) {
        this.allianceTeam = loadObject.allianceTeam;
        this.hordeTeam = loadObject.hordeTeam;
        [...this.allianceTeam, ...this.hordeTeam].forEach((elem) => {
            Object.setPrototypeOf(elem, PositionedCharacter.prototype);
            Object.setPrototypeOf(elem.character, Character.prototype);
        });
        this.move = this.allianceTeam;
        this.level = loadObject.level;
        this.playerPoints = loadObject.playerPoints;
        this.gameState = GameState.from(this);
    }
}