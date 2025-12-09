import Experiment from "./Experiment";

export default class Experiments {
  private experiments: Experiment[];

  constructor() {
    const experimentEls = [...document.querySelectorAll<HTMLElement>(".experiment")];
    this.experiments = experimentEls.map((el) => new Experiment({ el }));
  }
}
