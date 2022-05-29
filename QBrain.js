class QAction {
  constructor(isJump, holdTime, xDirection) {
    this.isJump = isJump;
    this.holdTime = holdTime; //number between 0 and 1
    this.xDirection = xDirection;
  }

  clone() {
    return new QAction(this.isJump, this.holdTime, this.xDirection);
  }

  mutate() {
    this.holdTime += random(-0.3, 0.3);
    this.holdTime = constrain(this.holdTime, 0.1, 1);
  }
}

class QBrain {
  constructor(player) {
    this.player = player;
    this.qlearner = new QLearner(0.8);
    this.actions = [];
    this.states = [];
    this.currentInstructionNumber = 0;
    this.parentReachedBestLevelAtActionNo = 0;
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
    const x = Math.floor(this.player.currentPos.x / 5);
    const y = Math.floor(this.player.currentPos.y / 5);
    const lvl = this.player.currentLevelNo;
    console.log(`${lvl}_${x}_${y}`)
    return `${lvl}_${x}_${y}`;
  }

  getNextAction() {
    const state = getState();
    return this.getRandomAction()
  }
}
