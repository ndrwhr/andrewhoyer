import { random } from "lodash-es";
import Browser from "./utils/Browser";
import SiteBackground from "./SiteBackground";
import Experiments from "./Experiments";

import "../styles/site.css";

window.addEventListener("DOMContentLoaded", () => {
  Browser.init();

  new SiteBackground();
  new Experiments();

  document.body.classList.add(`site--color-${random(1, 5)}`);
});
