let alreadyShowingSnow = false;

class Population {
  constructor(size) {
    this.popSize = size;
    this.players = [];
    for (let i = 0; i < size; i++) {
      this.players.push(new Player());
    }

    this.showingFail = false;
    this.failPlayerNo = 0;
    this.bestPlayerIndex = 0;
    this.currentHighestPlayerIndex = 0;
    this.fitnessSum = 0;
    this.gen = 1;
    this.bestHeight = 0;
    this.showingLevelNo = 0;
    this.currentBestLevelReached = 0;
    this.purgeTheSlackers = false;
    this.reachedBestLevelAtActionNo = 0;
    this.newLevelReached = false;
    this.cloneOfBestPlayerFromPreviousGeneration = this.players[0].clone();
  }

  Update() {
    for (let i = 0; i < this.players.length; i++) {
      this.players[i].Update();
    }
  }

  SetBestPlayer() {
    this.bestPlayerIndex = 0;
    this.newLevelReached = false;
    for (let i = 0; i < this.players.length; i++) {
      if (
        this.players[i].bestHeightReached >
        this.players[this.bestPlayerIndex].bestHeightReached
      ) {
        this.bestPlayerIndex = i;
      }
    }

    if (
      this.players[this.bestPlayerIndex].bestLevelReached >
      this.currentBestLevelReached
    ) {
      this.currentBestLevelReached =
        this.players[this.bestPlayerIndex].bestLevelReached;
      this.newLevelReached = true;
      this.reachedBestLevelAtActionNo =
        this.players[this.bestPlayerIndex].bestLevelReachedOnActionNo;
      print("NEW LEVEL, action number", this.reachedBestLevelAtActionNo);
    }
    this.bestHeight = this.players[this.bestPlayerIndex].bestHeightReached;
  }

  SetCurrentHighestPlayer() {
    this.currentHighestPlayerIndex = 0;
    for (let i = 0; i < this.players.length; i++) {
      if (
        this.players[i].GetGlobalHeight() >
        this.players[this.currentHighestPlayerIndex].GetGlobalHeight()
      ) {
        this.currentHighestPlayerIndex = i;
      }
    }
  }

  Show() {
    this.SetCurrentHighestPlayer();
    let highestPlayer = this.players[this.currentHighestPlayerIndex];
    let highestLevelNo =
      this.players[this.currentHighestPlayerIndex].currentLevelNo;

    if (
      highestPlayer.currentLevelNo > highestPlayer.bestLevelReached &&
      !highestPlayer.progressionCoinPickedUp
    ) {
      highestLevelNo -= 1;
    }
    showLevel(highestLevelNo);
    alreadyShowingSnow = false;
    this.showingLevelNo = highestLevelNo;
    for (let i = 0; i < this.players.length; i++) {
      if (
        this.players[i].currentLevelNo >= highestLevelNo - 1 &&
        this.players[i].currentLevelNo <= highestLevelNo
      ) {
        this.players[i].Show();
      }
    }
  }

  ResetAllPlayers() {
    for (let i = 0; i < this.players.length; i++) {
      this.players[i].ResetPlayer();
    }
  }

  IncreasePlayerMoves(increaseBy) {
    for (let i = 0; i < this.players.length; i++) {
      this.players[i].brain.increaseMoves(increaseBy);
    }
  }

  AllPlayersFinished() {
    for (let i = 0; i < this.players.length; i++) {
      if (!this.players[i].hasFinishedInstructions) {
        return false;
      }
    }
    return true;
  }

  GeneticAlgorithm() {
    let nextGen = [];
    this.SetBestPlayer();
    this.CalculateFitnessSum();

    this.cloneOfBestPlayerFromPreviousGeneration =
      this.players[this.bestPlayerIndex].clone();

    for (let i = 1; i < 20; i++) {
      let alpha = this.players[this.bestPlayerIndex].clone();
      if (alpha.fellToPreviousLevel) {
        alpha.brain.mutateActionNumber(parent.fellOnActionNo);
      }
      alpha.brain.mutateAlpha();
      nextGen.push(alpha);
    }
    for (let i = 0; i < this.players.length - 319; i++) {
      let parent = this.SelectParent();
      let baby = parent.clone();
      baby.brain.mutate();
      nextGen.push(baby);
    }
    for (let i = 0; i < 300; i++) {
    let parent = this.SelectParent();
      let baby = parent.clone();
      nextGen.push(baby);
    }

    this.players = [];
    for (let i = 0; i < nextGen.length; i++) {
      this.players[i] = nextGen[i];
      if (
        !this.newLevelReached &&
        this.currentBestLevelReached !== 0 &&
        this.currentBestLevelReached !== 37
      ) {
        this.players[i].loadStartOfBestLevelPlayerState();
      }
    }

    this.gen++;
  }

  CalculateFitnessSum() {
    this.fitnessSum = 0;
    for (let i = 0; i < this.players.length; i++) {
      this.players[i].CalculateFitness();
      if (
        this.players[i].bestLevelReached <
        this.players[this.bestPlayerIndex].bestLevelReached
      ) {
        this.players[i].fitness = 0;
      }
      this.fitnessSum += this.players[i].fitness;
    }
  }

  SelectParent() {
    let rand = random(this.fitnessSum) * 0.5;
    let runningSum = 0;
    this.players = this.players.sort((a, b) => b.fitness - a.fitness);
    for (let i = 0; i < this.players.length; i++) {
      runningSum += this.players[i].fitness;
      if (runningSum > rand) {
        return this.players[i];
      }
    }
    return null;
  }
}
