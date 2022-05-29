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
    this.instructions = [];
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
    const x = Math.floor(this.player.currentPos.x);
    const y = Math.floor(this.player.currentPos.y);
    const lvl = this.player.currentLevelNo;
    console.log(`${lvl}_${x}_${y}`)
    return `${lvl}_${x}_${y}`;
  }

  getRandomAction() {
    let isJump = false;

    if (random() > jumpChance) {
      isJump = true;
    }

    let holdTime = random(0.1, 1);
    if (random() < chanceOfFullJump) {
      holdTime = 1;
    }

    let directions = [-1, -1, -1, 0, 1, 1, 1];
    let xDirection = random(directions);

    return new QAction(isJump, holdTime, xDirection);
  }

  getNextAction() {
    if (this.currentInstructionNumber >= this.instructions.length) {
      return null;
    }
    this.currentInstructionNumber += 1;
    return this.instructions[this.currentInstructionNumber - 1];
  }

  clone() {
    let clone = new Brain(this.size, false);
    clone.instructions = [];
    for (let i = 0; i < this.instructions.length; i++) {
      clone.instructions.push(this.instructions[i].clone());
    }
    return clone;
  }

  mutate() {
    let mutationRate = 0.3;
    let chanceOfNewInstruction = 0.2;
    for (
      let i = this.parentReachedBestLevelAtActionNo;
      i < this.instructions.length;
      i++
    ) {
      if (random() < chanceOfNewInstruction) {
        this.instructions[i] = this.getRandomAction();
      } else if (random() < mutationRate) {
        this.instructions[i].mutate();
      }
    }
  }

  mutateAlpha() {
    let mutationRate = 0.5;
    let chanceOfNewInstruction = 0.3;
    for (
      let i = this.parentReachedBestLevelAtActionNo;
      i < this.instructions.length;
      i++
    ) {
      if (random() < chanceOfNewInstruction) {
        this.instructions[i] = this.getRandomAction();
      } else if (random() < mutationRate) {
        this.instructions[i].mutate();
      }
    }
  }

  mutateActionNumber(actionNumber) {
    // let mutationRate = 0.1;

    actionNumber -= 1; // this is done because im a bad programmer
    let chanceOfNewInstruction = 0.1;
    if (random() < chanceOfNewInstruction) {
      this.instructions[actionNumber] = this.getRandomAction();
    } else {
      this.instructions[actionNumber].mutate();
    }
  }

  increaseMoves(increaseMovesBy) {
    for (var i = 0; i < increaseMovesBy; i++) {
      this.instructions.push(this.getRandomAction());
    }
  }
}
