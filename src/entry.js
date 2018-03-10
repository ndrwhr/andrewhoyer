import random from 'lodash/random';

import Browser from './js/utils/Browser';
import SiteBackground from './js/SiteBackground';
import Experiments from './js/Experiments';

import './entry.css';

window.addEventListener('DOMContentLoaded', () => {
  Browser.init();

  const background = new SiteBackground();
  const experiments = new Experiments();

  document.body.classList.add(`site--color-${random(1, 5)}`);
});
