class QAction {
  constructor(isJump, holdTime, xDirection) {
    this.isJump = isJump;
    this.holdTime = holdTime; //number between 0 and 1
    this.xDirection = xDirection;
    this.encoded = isJump ? `1_${xDirection}_${holdTime}` : `0_${xDirection}`;
  }
}

class QBrain {
  constructor(player) {
    this.player = player;
    this.learner = new QLearner(0.8);
    this.actions = [];
    this.states = [];
    this.currentInstructionNumber = 0;
    this.parentReachedBestLevelAtActionNo = 0;
    this.numberOfActions = 0;
    this.exploration = 0.01;

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
    const x = ~~(this.player.currentPos.x / 5);
    const y = ~~(this.player.currentPos.y / 5);
    const lvl = this.player.currentLevelNo;
    console.log(`${lvl}_${x}_${y}`);
    return `${lvl}_${x}_${y}`;
  }

  getRandomAction() {
    let isJump = false;

    if (random() > jumpChance) {
      isJump = true;
    }

    let holdTime = Math.round(random(0.1, 1) * 100) / 100;
    if (random() < chanceOfFullJump) {
      holdTime = 1;
    }

    let directions = [-1, -1, -1, 0, 1, 1, 1];
    let xDirection = random(directions);

    return new QAction(isJump, holdTime, xDirection);
  }

  getNextAction() {
    const currentState = this.getState();

    let action = this.learner.bestAction(currentState);
    if (
      action == undefined ||
      this.learner.getQValue(currentState, action) <= 0 ||
      Math.random() < this.exploration
    ) {
      action = this.getRandomAction();
    }

    this.currentState = currentState;
    this.currentFitness = this.player.fitness;
    this.currentAction = action.encoded;
    return action;
  }

  learn() {
    const newState = this.getState();
    const newFitness = this.player.fitness;
    const reward = newFitness - this.currentFitness;
    this.learner.add(this.currentState, newState, reward, this.currentAction);
    this.learner.learn(100);
  }
}
