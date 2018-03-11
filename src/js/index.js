import random from 'lodash/random';

import Browser from './utils/Browser';
import SiteBackground from './SiteBackground';
import Experiments from './Experiments';

window.addEventListener('DOMContentLoaded', () => {
  Browser.init();

  const background = new SiteBackground();
  const experiments = new Experiments();

  document.body.classList.add(`site--color-${random(1, 5)}`);
});
