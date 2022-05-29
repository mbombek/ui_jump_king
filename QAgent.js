class QAgent {
  constructor(player) {
    this.player = player;
    this.qlearner = new QLearner(0.8);
    this.actions = [];
    this.states = [];
    this.numberOfActions = 0;

    for (let level = 0; level < 43; level++) {
      for (let x = 0; x < 224; x++) {
        for (let y = 0; y < 180; y++) {
          this.states.push(`${level}_${x}_${y}`);
        }
      }
    }

    // WALKS
    this.actions.push(`w_l`);
    this.actions.push(`w_r`);

    // JUMPS
    const jumpDirections = ["l", "n", "r"];
    jumpDirections.forEach((dir) => {
      for (let dur = 0.1; dur <= 1; dur += 0.1) {
        this.actions.push(`j_${dir}_${dur}`);
      }
    });
  }

  getState() {
    const x = this.player.currentPos.x;
    const y = this.player.currentPos.y;
    const lvl = this.currentLevelNumber;
    return `${lvl}_${x}_${y}`;
  }

  finished() {
    return this.player.hasFinishedInstructions;
  }

  move() {
    const state = this.getState();
  }

  show() {
    this.player.Show()
  }

  update() {
    this.player.Update();
  }
}
