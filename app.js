
const HOME_POSITIONS = [0, 200, 400];

const helmets = [
  document.getElementById('h1'),
  document.getElementById('h2'),
  document.getElementById('h3')
];
const puck = document.getElementById('puck');
const shuffleBtn = document.getElementById('shuffleBtn');

let tlShuffle;
let chosenIndex = 1; 
let isShuffling = false;
let revealed = false;
let userCanPick = false;

/**
 */
function setHelmetPositions(immediate = false) {
  helmets.forEach((helmet, i) => {
    const props = { x: 0, left: HOME_POSITIONS[i], y: 0, rotation: 0 };
    if (immediate) {
      gsap.set(helmet, props);
    } else {
      gsap.to(helmet, { ...props, duration: 0.32, ease: "power2.inOut" });
    }
  });
}

function attachPuckToHelmet(index) {
  const target = helmets[index];
  if (!target) return;
  target.appendChild(puck);
  puck.style.position = 'absolute';
  puck.style.left = '50%';
  puck.style.transform = 'translateX(-50%)';
  puck.style.bottom = '30px';
  puck.style.zIndex = '1';
  gsap.set(puck, { scale: 1 });
}

function movePuckToGameArea(leftPx, bottomPx = '12px') {
  const gameArea = document.getElementById('game-area');
  gameArea.appendChild(puck);
  puck.style.position = 'absolute';
  puck.style.left = leftPx + 'px';
  puck.style.transform = 'translateX(-50%)';
  puck.style.bottom = bottomPx;
  puck.style.zIndex = '1';
  gsap.set(puck, { scale: 1 });
}

function introLiftHighlight() {
  const gameArea = document.getElementById('game-area');
  const helmet = helmets[1]; // middle helmet

  const helmetRect = helmet.getBoundingClientRect();
  const gameRect = gameArea.getBoundingClientRect();

  const helmetCenterXInGame =
    helmetRect.left + helmetRect.width / 2 - gameRect.left;

  movePuckToGameArea(helmetCenterXInGame, '125px');
  gsap.set(puck, { autoAlpha: 0, scale: 1 });

  const t = gsap.timeline();
  t.to(helmet, { y: -70, duration: 0.45, ease: "back.out(1.6)" }, 0)
   .to(puck, { autoAlpha: 1, duration: 0.2 }, "<0.1")
   .to(helmet, { y: 0, duration: 0.35, ease: "back.in(1.1)", delay: 0.18 })
   .to(puck, { autoAlpha: 0, duration: 0.18 }, "-=0.18")
   .add(() => {
      attachPuckToHelmet(1);
      gsap.set(puck, { autoAlpha: 0, scale: 1 });
   });
}

function revealPuck(idx) {
  const helmet = helmets[idx];
  const gameArea = document.getElementById('game-area');
  const lift = gsap.timeline();

  lift.to(helmet, {
    y: -120,
    rotation: -6,
    duration: 0.6,
    ease: "back.out(1.4)",
    zIndex: 50
  });

  if (idx === chosenIndex) {

    const puckRect = puck.getBoundingClientRect();
    const gameRect = gameArea.getBoundingClientRect();

    const puckCenterXInGame =
      puckRect.left + puckRect.width / 2 - gameRect.left;
    const puckBottomInGame = gameRect.bottom - puckRect.bottom;


    movePuckToGameArea(puckCenterXInGame, puckBottomInGame + 'px');


    lift.to(puck, {
      autoAlpha: 1,
      scale: 1.25,
      duration: 0.25,
      ease: "power2.out"
    }, "<0.2").to(puck, {
      scale: 1,
      duration: 0.25
    }, "+=0.25");
  } else {

    lift.to(helmet, { x: "+=10", duration: 0.1, yoyo: true, repeat: 2 });
  }

  revealed = true;
  userCanPick = false;


  lift.to(
    helmet,
    {
      y: 0,
      rotation: 0,
      duration: 1,
      ease: "power1.inOut"
    },
    "+=0.8"
  )
  .add(() => {
    setTimeout(reset, 350);
  });
}

/**

 */
function createShuffleTimeline(numSwaps = 5) {
  if (tlShuffle) tlShuffle.kill();
  tlShuffle = gsap.timeline();

  let helmetToSlot = [0, 1, 2];
  let puckSlot = helmetToSlot[chosenIndex]; 

  function applySlots(immediate = false) {
    helmets.forEach((helmet, helmetIndex) => {
      const slot = helmetToSlot[helmetIndex];
      const props = { x: 0, left: HOME_POSITIONS[slot], y: 0, rotation: 0 };
      if (immediate) {
        gsap.set(helmet, props);
      } else {
        gsap.to(helmet, { ...props, duration: 0.32, ease: "power2.inOut" });
      }
    });
  }

  applySlots(true);

  for (let i = 0; i < numSwaps; i++) {

    const swapSlot = Math.floor(Math.random() * 2); 
    const otherSlot = swapSlot + 1;

    tlShuffle.add(() => {

      const helmetA = helmetToSlot.indexOf(swapSlot);
      const helmetB = helmetToSlot.indexOf(otherSlot);
 
      [helmetToSlot[helmetA], helmetToSlot[helmetB]] =
        [helmetToSlot[helmetB], helmetToSlot[helmetA]];

      if (puckSlot === swapSlot) puckSlot = otherSlot;
      else if (puckSlot === otherSlot) puckSlot = swapSlot;

      applySlots(false);
    }, "+=0.38");
  }

  tlShuffle.add(() => {
    applySlots(false);

    const helmetWithPuck = helmetToSlot.indexOf(puckSlot);
    chosenIndex = helmetWithPuck;   
    attachPuckToHelmet(chosenIndex);
    userCanPick = true;
    isShuffling = false;
  }, "+=0.38");
}

function startShuffling() {
  if (isShuffling) return;
  isShuffling = true;
  revealed = false;
  userCanPick = false;

  chosenIndex = 1;           
  setHelmetPositions(true);     
  attachPuckToHelmet(chosenIndex);
  gsap.set(puck, { autoAlpha: 0 });

  createShuffleTimeline(7);
}

function stopShuffling() {
  if (tlShuffle) tlShuffle.pause();
  isShuffling = false;
}

function reset() {
  if (tlShuffle) tlShuffle.kill();
  setHelmetPositions(true);    
  chosenIndex = 1;
  attachPuckToHelmet(1);
  gsap.set(puck, { autoAlpha: 0, scale: 1 });
  isShuffling = false;
  revealed = false;
  userCanPick = false;
  introLiftHighlight();
}

shuffleBtn.addEventListener('click', startShuffling);

helmets.forEach((h, idx) => {
  h.addEventListener('click', () => {
    if (userCanPick && !revealed) {
      revealPuck(idx);
    }
  });
});

window.addEventListener('load', () => {

  setHelmetPositions(true);
  attachPuckToHelmet(1);
  gsap.set(puck, { autoAlpha: 0, scale: 1 });
  introLiftHighlight();
});