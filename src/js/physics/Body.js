import { vec2 } from 'gl-matrix';

export default class Body {
  constructor(bodyDef) {
    this.mass = bodyDef.mass || 1;
    this.current = bodyDef.current || vec2.create();
    this.previous = bodyDef.current || vec2.create();
    this.acceleration = vec2.create();
    this.friction = bodyDef.friction;
  }

  applyAcceleration(acceleration) {
    this.acceleration = vec2.add(
      vec2.create(),
      this.acceleration,
      acceleration,
    );
  }

  applyForce(force) {
    this.applyAcceleration(vec2.scale(vec2.create(), force, 1 / this.mass));
  }

  move(dt) {
    // Perform verlet integration to move the this.
    const delta = vec2.subtract(
      vec2.create(),
      vec2.scale(vec2.create(), this.current, 2 - this.friction),
      vec2.scale(vec2.create(), this.previous, 1 - this.friction)
    );
    const accel = vec2.scale(vec2.create(), this.acceleration, dt * dt);
    const newCurrent = vec2.add(vec2.create(), delta, accel);

    this.previous = this.current;
    this.current = newCurrent;

    // Reset the acceleration being applied to the this.
    this.acceleration = vec2.create();
  }
}
