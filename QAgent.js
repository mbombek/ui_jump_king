class QAgent {
  constructor() {
    this.actions = [];
    this.states = [];

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
    
    this.finishedMove = true;
  }

  getNextMove() {
    // TODO
  }

  finished() {
    return this.finishedMove;
  }

  show() {
    // TODO
  }

  update() {
    // TODO
  }
}
