import themes from './themes';
export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
  }

  init() {
    this.gamePlay.drawUi(themes.prairie);
    const startUserTeam = this.userTypes.slice(0, 2);
    const userPos = this.generatePlayers(this.userPositions, startUserTeam);
    this.gamePlay.redrawPosition(userPos);
    const enemyPos = this.generatePlayers(this.enemyPositions, this.enemyTypes);
    this.gamePlay.redrawPosition(enemyPos);
  }

  onCellClick(index) {
    // TODO: react to click
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
  }
}
