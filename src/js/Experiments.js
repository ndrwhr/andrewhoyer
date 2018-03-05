import Experiment from './Experiment';

export default class Experiments {
  constructor() {
    this.experiments = [...document.querySelectorAll('.experiment')].map((el) => (
      new Experiment({ el })
    ));
  }
};
