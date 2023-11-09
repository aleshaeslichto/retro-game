export default class GameState {
  static from(object) {
    // TODO: create object
    if (object && typeof object === 'object') {
      return {
        teams: object.teams,
        allianceTeam: object.allianceTeam,
        hordeTeam: object.hordeTeam,
        move: object.move,
        selectedCharacter: object.selectedCharacter,
        level: object.level,
        playerPoints: object.playerPoints,
      };
    }
    return null;
  }
}
