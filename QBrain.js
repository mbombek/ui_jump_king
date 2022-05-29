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
    this.learner = new QLearner(0.8, 0.9);
    this.actions = [];
    this.states = [];
    this.currentInstructionNumber = 0;
    this.parentReachedBestLevelAtActionNo = 0;
    this.numberOfActions = 0;
    this.numberOfCoins;
    this.exploration = 0.01;

    for (let level = 0; level < 3; level++) {
      for (let x = 0; x < 112; x++) {
        for (let y = 0; y < 90; y++) {
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
    const x = ~~(this.player.currentPos.x / 10);
    const y = ~~(this.player.currentPos.y / 10);
    const lvl = this.player.currentLevelNo;
    return `${lvl}_${x}_${y}`;
  }

  getRandomAction() {
    let isJump = false;

    if (random() > jumpChance) {
      isJump = true;
    }

    let holdTime = Math.round(random(0.1, 1) * 10) / 10;
    if (random() < chanceOfFullJump) {
      holdTime = 1;
    }

    let directions = [-1, -1, -1, 0, 1, 1, 1];
    let xDirection = random(directions);

    return new QAction(isJump, holdTime, xDirection);
  }

  decodeAction(actionStr) {
    const elements = actionStr.split("_");
    let isJump = false;
    let duration = 0.1;
    if (elements[0] !== "1") {
      isJump = true;
    }
    let xDirection = Number(elements[1]);
    if (isJump) {
      duration = Number(elements[2]);
    }
    return new QAction(isJump, duration, xDirection);
  }

  getNextAction() {
    const currentState = this.getState();

    let action = this.learner.bestAction(currentState);
    if (action) {
      console.log("QLEARNER ACTION: ", action);
      action = this.decodeAction(action);
    }
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
    this.numberOfCoins = this.player.numberOfCoinsPickedUp;
    this.numberOfActions++;
    return action;
  }

  learn() {
    const action = this.currentAction;
    const oldState = this.currentState;
    if (!oldState) {
      return;
    }
    const newState = this.getState();

    const coinValue = 500000;
    const oldLevel = oldState.split("_")[0];
    const oldHeight = oldState.split("_")[2];
    const newLevel = newState.split("_")[0];
    const newHeight = newState.split("_")[2];
    let diff = newLevel * height - newHeight - (oldLevel * height - oldHeight);
    if (diff < 0) {
      diff = -diff * diff;
    } else {
      diff = diff * diff;
    }
    const reward = diff + coinValue * this.player.numberOfCoinsPickedUp;
    console.log(oldState, newState, reward, action);

    this.learner.add(oldState, newState, reward, action);
    this.learner.learn(100);
  }
}
