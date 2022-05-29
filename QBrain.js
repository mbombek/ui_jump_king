class QBrain {
  constructor() {
    this.actions = [];
    this.states = [];

    for (let x = 0; x < 224; x++) {
      for (let y = 0; y < 180; y++) {
        this.states.push(`${x}_${y}`);
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

    console.log(this.actions);
    console.log(this.states);
  }
}
