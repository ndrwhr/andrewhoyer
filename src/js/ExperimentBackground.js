import { vec2 } from 'gl-matrix';
import random from 'lodash/random';

import Body from './physics/Body';
import Spring from './physics/Spring';
import Clock from './utils/Clock';

export default class ExperimentBackground {
  constructor({ el }) {
    this.el = el;

    this.body = new Body({
      mass: 1,
      friction: random(0.15, 0.2),
      current: vec2.fromValues(-15, -15),
    });
    this.spring = new Spring({
      k: random(0.0001, 0.0003),
      body: this.body,
    });

    Clock.addListener(this.tick.bind(this));
  }

  tick(dt) {
    this.spring.satisfy();
    this.body.move(dt);

    this.el.style.transform =
      `translate(${this.body.current[0]}px, ${this.body.current[1]}px)`;
  }
}
