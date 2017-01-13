function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function createCard({text, left = false, right = false}){
    const classes = [
        'card',
        left ? 'card--left' : '',
        right ? 'card--right' : '',
    ].join(' ');
    const container = document.createElement('div');

    container.innerHTML = `
        <div class="${classes}" style="">
            <div class="card__contents card__contents--back">${text}</div>
            <div class="card__contents card__contents--front"></div>
        </div>
    `;

    return container.firstElementChild;
}

function renderCards(seed){
    Math.seedrandom(seed);

    const names = [
        'Ed<br/>&amp;<br/>Judy',
        'Dave<br/>&amp;<br/>Teira',
        'Amy<br/>&amp;<br/>Andrew',
    ];

    const givers = shuffle(names);

    const receivers = [...givers.slice(1), givers[0]];

    const pairs = givers.map((name, index) => {
        return [name, receivers[index]];
    });

    const parent = document.querySelector('.app__cards');
    pairs.forEach((pair) => {
        const pairEl = document.createElement('div');
        pairEl.classList.add('app__card-pair');

        pairEl.appendChild(createCard({
            text: pair[0],
            left: true,
        }));

        const dividerEl = document.createElement('div');
        dividerEl.classList.add('app__card-pair-divider');
        dividerEl.innerHTML = 'gift to';
        pairEl.appendChild(dividerEl);

        pairEl.appendChild(createCard({
            text: pair[1],
            right: true,
        }));

        parent.appendChild(pairEl);
    });

    const cards = Array.from(document.querySelectorAll('.card'));
    setTimeout(() => {
        parent.classList.remove('app__cards--hidden');

        setTimeout(() => {
            cards.forEach((card) => {
                card.classList.add('card--show-back');
            });
        }, 1000);
    }, 100);
}

const seedRegex = /\?seed=(.*)/i;
if (seedRegex.test(window.location.search)){
    renderCards(seedRegex.exec(window.location.search)[1]);
} else {
    const controls = document.querySelector('.controls');
    controls.classList.remove('controls--hidden');
    document.querySelector('.controls__button').addEventListener('click', () => {
        const seed = document.querySelector('.controls__seed').value;
        window.history.replaceState(null, '', `?seed=${seed}`);

        controls.classList.add('controls--hide');
        setTimeout(() => {
            controls.classList.add('controls--hidden');
            renderCards(seed);
        }, 300);
    });
}
