class QAgent {
  constructor(player) {
    this.player = player;
    this.actions = [];
    this.states = [];
    this.numberOfActions = 0;

    f
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
