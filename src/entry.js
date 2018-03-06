
import { startClock } from './js/utils/Clock';
import SiteBackground from './js/SiteBackground';
import Experiments from './js/Experiments';

import './entry.css';

window.addEventListener('DOMContentLoaded', () => {
  startClock();

  const background = new SiteBackground();
  const experiments = new Experiments();
});
