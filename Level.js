class Level {
  constructor() {
    this.levelImage = null;
    this.lines = [];
    this.levelNo = 0;
    this.isBlizzardLevel = false;
    this.isIceLevel = false;
    this.coins = [];
    this.exitCoin = null;
    this.endCoin = null
    this.hasProgressionCoins = false;
  }

  show() {
    push();
    image(this.levelImage, 0, 0);
    if (showingLines) {
      for (let l of lines) {
        l.Show();
      }
    }
    if (showingCoins) {
      if (this.exitCoin) this.exitCoin.show();
      if (this.endCoin) this.endCoin.show();
      for (let c of this.coins) {
        c.show();
      }
    }

    pop();
  }
}
