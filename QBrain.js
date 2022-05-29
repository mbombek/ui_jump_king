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
    this.learner = new QLearner(0.99, 0.1);
    this.currentInstructionNumber = 0;
    this.parentReachedBestLevelAtActionNo = 0;
    this.numberOfActions = 0;
    this.explorations = [];
    for (let i = 0; i < 43; i++) this.explorations[i] = 1;
    this.minExploration = 0.01;
    this.explorationDecay = 0.0001;
    this.currentState = null;
    this.currentAction = null;
    this.numberOfCoins = 0;
  }

  getState() {
    const x = ~~(this.player.currentPos.x / 10);
    const y = ~~(this.player.currentPos.y / 10);
    const lvl = this.player.currentLevelNo;
    return `${lvl}_${x}_${y}`;
  }

  getRandomAction() {
    let isJump = false;

    let jumpChance = 0.5;
    let chanceOfFullJump = 0.2;

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
    if (elements[0] == "1") {
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
      action = this.decodeAction(action);
    }
    if (
      action == undefined ||
      this.learner.knowsAction(action) ||
      Math.random() < this.explorations[this.currentState.split("_")[0]]
    ) {
      action = this.getRandomAction();
    }
    this.currentState = currentState;
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

    this.learner.add(oldState, newState, reward, action);
    this.learner.learn(100);

    if (this.explorations[newLevel] > this.minExploration) {
      this.explorations[newLevel] =
        this.explorations[newLevel] -
        this.explorations[newLevel] * this.explorationDecay;
    }
  }
}
