import Experiment from './Experiment';

export default class Experiments {
  constructor() {
    const experimentEls = [...document.querySelectorAll('.experiment')];
    this.experiments = experimentEls.map((el) => (
      new Experiment({ el })
    ));
  }
};
