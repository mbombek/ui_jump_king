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
    this.learner = new QLearner(0.9, 0.5);
    this.currentInstructionNumber = 0;
    this.parentReachedBestLevelAtActionNo = 0;
    this.numberOfActions = 0;
    this.explorations = [];
    for (let i = 0; i < 43; i++) this.explorations[i] = 1;
    this.minExploration = 0.1;
    this.explorationDecay = 0.0005;
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

    let jumpChance = 0.7;
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
      // this.learner.getQValue(currentState, action) <= 0 ||
      Math.random() < this.explorations[this.currentState.split("_")[0]]
    ) {
      action = this.getRandomAction();
    }

    this.currentState = currentState;
    this.currentAction = action.encoded;
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
    
    const coinValue = 50;
    const oldLevel = oldState.split("_")[0];
    const oldHeight = oldState.split("_")[2];
    const newLevel = newState.split("_")[0];
    const newHeight = newState.split("_")[2];

    let diff = newLevel * height - newHeight - (oldLevel * height - oldHeight);

    /*
      PROBLEMATIC HEIGHTS:
        5285: (18, 4489) -> (30, 4479)
        5845: (71, 5355) -> (46, 5347)
        7945: (20, 7185) -> (45, 7173)
        7945: (45, 7173) -> (27, 7155)
    */

    let exitdist = 0;
    let currentExitCoin = levels[this.player.currentLevelNo].exitCoin;
    if (currentExitCoin) {
      exitdist = Math.sqrt(currentExitCoin.exitDist(this.player));
    }

    let reward = diff - exitdist + coinValue * (this.player.numberOfCoinsPickedUp - this.numberOfCoins);
    
    if (oldLevel * height - oldHeight == 5355 && newLevel * height - newHeight == 5347) {
      reward = 500;
    } else if (oldLevel * height - oldHeight == 5347 && newLevel * height - newHeight == 5355)  {
      reward = -500;
    } else if (oldLevel * height - oldHeight == 4489 && newLevel * height - newHeight == 4479)  {
      reward = 500;
    } else if (oldLevel * height - oldHeight == 4479 && newLevel * height - newHeight == 4489)  {
      reward = -500;
    } else if (oldLevel * height - oldHeight == 7185 && newLevel * height - newHeight == 7173)  {
      reward = 500;
    } else if (oldLevel * height - oldHeight == 7173 && newLevel * height - newHeight == 7185)  {
      reward = -500;
    } else if (oldLevel * height - oldHeight == 7173 && newLevel * height - newHeight == 7155)  {
      reward = 500;
    } else if (oldLevel * height - oldHeight == 7155 && newLevel * height - newHeight == 7173)  {
      reward = -500;
    } else if (oldLevel * height - oldHeight == 7185 && newLevel * height - newHeight == 7155)  {
      reward = 500;
    } else if (oldLevel * height - oldHeight == 7155 && newLevel * height - newHeight == 7185)  {
      reward = -500;
    }
    console.log(reward)
    if (this.player.bestHeightReached == 5845 || this.player.bestHeightReached == 5285 || this.player.bestHeightReached == 7945)  {
      console.log(oldLevel * height - oldHeight, newLevel * height - newHeight, reward);
    }

    this.learner.add(oldState, newState, reward, action);
    this.learner.learn(100);

    this.numberOfCoins = this.player.numberOfCoinsPickedUp;
    if (this.explorations[newLevel] > this.minExploration) {
      this.explorations[newLevel] =
        this.explorations[newLevel] -
        this.explorations[newLevel] * this.explorationDecay;
    }
    //console.log(oldState, newState, reward, action, this.explorations[newLevel]);
  }

  saveQlearner()  {
    return;
  }
}
