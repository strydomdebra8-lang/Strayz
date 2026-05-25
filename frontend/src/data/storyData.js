export const CHARACTERS = [
  {
    id: "chris",
    name: "Chris",
    age: 10,
    gender: "male",
    role: "The Curious Whiz",
    specialty: "Math & Logic",
    color: "#4ADE80",
    image:
      "https://api.dicebear.com/7.x/adventurer/svg?seed=ChrisBoyStrayz&backgroundColor=4ADE80&radius=20",
    bio: "The youngest Stray. A boy genius with numbers who never stops asking 'why?'",
    family: "kid",
  },
  {
    id: "archie",
    name: "Archie",
    age: 16,
    gender: "male",
    role: "The Music Maven",
    specialty: "Music & Arts",
    color: "#FB923C",
    image:
      "https://api.dicebear.com/7.x/adventurer/svg?seed=ArchieBoyStrayz&backgroundColor=FB923C&radius=20",
    bio: "Teen lad with perfect pitch and an encyclopedic knowledge of music.",
    family: "teen",
  },
  {
    id: "lynn",
    name: "Lynn",
    age: 22,
    gender: "female",
    role: "The Explorer",
    specialty: "History & Geography",
    color: "#38BDF8",
    image:
      "https://api.dicebear.com/7.x/adventurer/svg?seed=LynnGirlStrayz&backgroundColor=38BDF8&radius=20",
    bio: "Young woman backpacker who has trekked every continent. Reads ancient maps like comics.",
    family: "young-adult",
  },
  {
    id: "deb",
    name: "Deb",
    age: 28,
    gender: "female",
    role: "The Scientist",
    specialty: "Science & Nature",
    color: "#A78BFA",
    image:
      "https://api.dicebear.com/7.x/adventurer/svg?seed=DebGirlStrayz&backgroundColor=A78BFA&radius=20",
    bio: "Eldest sibling. Lab whizz with a thermos of coffee and a microscope.",
    family: "young-adult",
  },
  {
    id: "dolly",
    name: "Dolly",
    age: 48,
    gender: "female",
    role: "The Quizmaster Mum",
    specialty: "General Knowledge & Home",
    color: "#F472B6",
    image:
      "https://api.dicebear.com/7.x/adventurer/svg?seed=DollyMomStrayz&backgroundColor=F472B6&radius=20",
    bio: "Mum of the crew. A walking trivia encyclopedia who runs the cosy family base camp.",
    family: "parent",
  },
  {
    id: "arthur",
    name: "Arthur",
    age: 50,
    gender: "male",
    role: "The Sports Coach Dad",
    specialty: "Sports & Endurance",
    color: "#22D3EE",
    image:
      "https://api.dicebear.com/7.x/adventurer/svg?seed=ArthurDadStrayz&backgroundColor=22D3EE&radius=20",
    bio: "Dad of the crew. Ex-athlete and sports nerd who cheers louder than anyone — earns the team a bonus on every correct answer.",
    family: "parent",
  },
];

// Each character's specialty maps to a level id (for bonus rewards).
// Arthur has no level match — instead he gives a flat +5 bonus on every correct answer (see GamePlay).
export const CHARACTER_SPECIALTY_LEVEL = {
  chris: 1, // Math & Logic -> Jungle Ruins
  archie: 2, // Music -> Musical Museum
  lynn: 3, // History & Geography -> Ancient Library
  deb: 4, // Science -> Science Lab
  dolly: 5, // General Knowledge -> Final Showdown (mixed)
};

// Flat per-correct bonus that applies regardless of level (Arthur's coach buff).
export const CHARACTER_FLAT_BONUS = {
  arthur: 5,
};

// Character-specific dialogue lines (chosen at random)
export const CHARACTER_DIALOGUES = {
  chris: {
    onCorrect: [
      "YES! That's the magic of math!",
      "Boom! Numbers don't lie.",
      "Easy peasy — let's keep stacking wins!",
    ],
    onWrong: [
      "Hmm, let's check our working again.",
      "Even Einstein got things wrong sometimes!",
      "Don't worry — every wrong answer is a lesson.",
    ],
    onIdle: [
      "Did you know zero was invented in India around the 5th century?",
      "Patterns are everywhere — even in pineapples!",
      "If you double a penny every day, you'd be a millionaire in a month.",
    ],
    onLevelStart: [
      "Let's crunch some numbers!",
      "Logic is my superpower.",
      "Bring on the puzzles!",
    ],
  },
  archie: {
    onCorrect: [
      "That hit the right note!",
      "Sweet harmony — well played!",
      "Encore, encore!",
    ],
    onWrong: [
      "A wrong note happens to the best of us, mate.",
      "Re-tune and try again!",
      "Even Mozart wrote a sour line now and then.",
    ],
    onIdle: [
      "Did you know the longest song officially recorded is over 13 hours?",
      "Music makes your brain release dopamine — fun fact!",
      "There are exactly 12 notes in a chromatic scale.",
    ],
    onLevelStart: [
      "Let the rhythm guide you!",
      "I hear a tune of victory coming.",
      "Drop the beat, we've got this.",
    ],
  },
  lynn: {
    onCorrect: [
      "Cracked it like an ancient code!",
      "Bookmarked! That's another fact in the books.",
      "Pure brilliance — keep exploring!",
    ],
    onWrong: [
      "History repeats — we'll get it next round.",
      "Even great explorers misread maps.",
      "Pull up the atlas, let's reconsider.",
    ],
    onIdle: [
      "The Library of Alexandria once held over 400,000 scrolls.",
      "There are 195 countries today — quite the to-do list!",
      "Cleopatra lived closer to the Moon landing than the pyramids' construction.",
    ],
    onLevelStart: [
      "Time to dust off the maps!",
      "Every story has a secret — let's find it.",
      "Adventure awaits — boots on!",
    ],
  },
  deb: {
    onCorrect: [
      "Empirically excellent!",
      "Hypothesis confirmed — high five!",
      "That's the scientific method in action!",
    ],
    onWrong: [
      "Re-run the experiment, scientist.",
      "Failure is just data we haven't analysed yet.",
      "Adjust the variables and try again.",
    ],
    onIdle: [
      "Octopuses have three hearts — wild, right?",
      "There are more stars in the universe than grains of sand on Earth.",
      "Bananas are slightly radioactive — don't panic, only slightly!",
    ],
    onLevelStart: [
      "Lab goggles on. Let's investigate!",
      "Every great discovery starts with curiosity.",
      "Hypothesis: we're about to crush this.",
    ],
  },
  dolly: {
    onCorrect: [
      "Brilliant, love! Mum's proud.",
      "Spot on — I'll put the kettle on to celebrate!",
      "That's my clever bunch!",
    ],
    onWrong: [
      "Chin up, dear — try again.",
      "Take a deep breath, you've got this.",
      "Even Mum gets the crossword wrong sometimes.",
    ],
    onIdle: [
      "Did you know honey never spoils?",
      "The dot over the letter 'i' is called a tittle.",
      "A group of flamingos is called a flamboyance.",
    ],
    onLevelStart: [
      "Right, who's ready for an adventure?",
      "Pack a snack, this could be a long one!",
      "Family powers — activate!",
    ],
  },
  arthur: {
    onCorrect: [
      "Yes! Goal! Back of the net!",
      "Champion! Coach is proud!",
      "Atta team! Bonus coin coming through.",
    ],
    onWrong: [
      "Shake it off and reset — we play on.",
      "No fouls in learning, kid.",
      "Next play, sharper focus.",
    ],
    onIdle: [
      "A football match runs 90 minutes plus stoppage time.",
      "Usain Bolt's top speed was around 12.4 metres per second.",
      "The marathon distance (42.195 km) was set at the 1908 London Olympics.",
    ],
    onLevelStart: [
      "Warm-up done — let's bring the energy!",
      "Game face on, team!",
      "Pace yourself and stay sharp.",
    ],
  },
};

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getCharacterLine(characterId, mood) {
  const lines = CHARACTER_DIALOGUES[characterId]?.[mood];
  if (!lines || lines.length === 0) return "";
  return pickRandom(lines);
}

export const STORY_INTRO = [
  {
    speaker: "Narrator",
    text: "Welcome to STRAYZ — the chronicles of the Stray family, an adventurous crew of six.",
  },
  {
    speaker: "Dolly",
    text: "Mum here. Five priceless artifacts have vanished from museums around the world. Pack a snack — we're going!",
  },
  {
    speaker: "Arthur",
    text: "Dad reporting for duty. I'll keep us fit and cheering — extra coins for every correct answer when I'm on the team!",
  },
  {
    speaker: "Deb",
    text: "I've calibrated the gear. Lab notebooks ready.",
  },
  {
    speaker: "Lynn",
    text: "Maps and compasses are packed. Each location guards its secrets.",
  },
  {
    speaker: "Archie",
    text: "And music codes! Some of these clues are hidden in melodies.",
  },
  {
    speaker: "Chris",
    text: "And the math puzzles! I've been practising — let's GO!",
  },
  {
    speaker: "Narrator",
    text: "Choose your difficulty, pick your hero, and prepare to recover what was lost.",
  },
];

export const LEVEL_INTROS = {
  1: "The team lands in the steamy jungle. An ancient Mayan temple looms ahead, its doors sealed with numerical riddles…",
  2: "Inside the Musical Museum, every display case has gone silent. To pass, you must answer the Music Maestro's challenges.",
  3: "Dust swirls in the Ancient Library. Scrolls float in mid-air, waiting for the right answer to settle.",
  4: "Beakers bubble in the abandoned Science Lab. A mysterious symbol glows on the wall — it's time for science!",
  5: "The mastermind's lair! Everything you have learned will be tested in this final showdown.",
};

export const BACKGROUNDS = {
  main:
    "https://static.prod-images.emergentagent.com/jobs/42ec3d3c-091c-44df-8238-21fdec8b0c5a/images/784f9b8b6afee81a87a38bd90f44cf7fa406c73f48f8ca49e030c7ac67bb8038.png",
  level_1:
    "https://static.prod-images.emergentagent.com/jobs/42ec3d3c-091c-44df-8238-21fdec8b0c5a/images/ce262c5d0850ca023fbce3be0b28c362dfc870f72bcbe51498f7cc87bb63bcd9.png",
  level_2:
    "https://static.prod-images.emergentagent.com/jobs/42ec3d3c-091c-44df-8238-21fdec8b0c5a/images/b8a05d9cbc08d9fd76dd3e7637dbe54cf48f3530281b3bbcb1d0544b0641a79b.png",
  level_3:
    "https://static.prod-images.emergentagent.com/jobs/42ec3d3c-091c-44df-8238-21fdec8b0c5a/images/b8a05d9cbc08d9fd76dd3e7637dbe54cf48f3530281b3bbcb1d0544b0641a79b.png",
  level_4:
    "https://static.prod-images.emergentagent.com/jobs/42ec3d3c-091c-44df-8238-21fdec8b0c5a/images/ce262c5d0850ca023fbce3be0b28c362dfc870f72bcbe51498f7cc87bb63bcd9.png",
  level_5:
    "https://static.prod-images.emergentagent.com/jobs/42ec3d3c-091c-44df-8238-21fdec8b0c5a/images/784f9b8b6afee81a87a38bd90f44cf7fa406c73f48f8ca49e030c7ac67bb8038.png",
  treasure:
    "https://images.unsplash.com/photo-1642211841112-2beeda7bfc07?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDR8MHwxfHNlYXJjaHwzfHx0cmVhc3VyZSUyMGNoZXN0JTIwc2hpbnklMjBnb2xkJTIwY29pbnN8ZW58MHx8fHwxNzc5NzIwNzg0fDA&ixlib=rb-4.1.0&q=85",
};
