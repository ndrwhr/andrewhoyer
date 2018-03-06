import { vec2 } from 'gl-matrix';
import random from 'lodash/random';

import Body from './physics/Body';
import Spring from './physics/Spring';
import { addClockListener } from './utils/Clock';

export default class ExperimentBackground {
  constructor({ el }) {
    this.el = el;

    const avgFriction = 0.175;
    const frictionDelta = avgFriction * 0.3;
    this.body = new Body({
      mass: 1,
      friction: random(avgFriction - frictionDelta, avgFriction + frictionDelta),
      current: vec2.fromValues(-15, -15),
    });

    const avgK = 0.0002;
    const kDelta = avgK * 0.3;
    this.spring = new Spring({
      k: random(avgK - kDelta, avgK + kDelta),
      body: this.body,
    });

    addClockListener(this.tick.bind(this));
  }

  tick(dt, { windowAcceleration }) {
    this.body.applyAcceleration(
      vec2.scale(vec2.create(), windowAcceleration, 0.1)
    );

    this.spring.satisfy();
    this.body.move(dt);

    this.el.style.transform =
      `translate(${this.body.current[0]}px, ${this.body.current[1]}px)`;
  }
}
