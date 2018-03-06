import { vec2 } from 'gl-matrix';

export default class Spring {
  constructor(springDef) {
    this.k = springDef.k;
    this.body = springDef.body;
  }

  satisfy() {
    // The body should always be at 0, so we just have to scale its
    // position by the spring constant.
    const force = vec2.scale(vec2.create(), this.body.current, -this.k);
    this.body.applyForce(force);
  }
}
