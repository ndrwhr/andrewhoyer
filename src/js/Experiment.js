import ExperimentBackground from './ExperimentBackground';
import ExperimentSketch from './ExperimentSketch';

export default class Experiment {
  constructor({ el }) {
    this.sketch = new ExperimentSketch({
      svg: el.querySelector('svg'),
    });

    this.background = new ExperimentBackground({
      el: el.querySelector('.experiment__background'),
    });
  }
}
