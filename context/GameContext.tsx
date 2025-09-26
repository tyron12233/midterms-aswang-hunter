import React, { createContext, useReducer, useEffect, ReactNode } from 'react';
import { GameState, GameAction, StoryData } from '../types';

export const storyData: StoryData = {
  "start": {
    "text": "You arrive at the dimly lit town of San Gubat. The air is heavy with a palpable fear, and the silence is only broken by the distant howl of a dog. Who do you seek for information first?",
    "choices": [
      {
        "text": "Find the old Albularyo (Healer) at the edge of town.",
        "to": "askAlbularyo"
      },
      {
        "text": "Report to the Barangay Captain at the dilapidated town hall.",
        "to": "askCaptain"
      }
    ]
  },
  "askAlbularyo": {
    "text": "'It has wings like a bat and separates at the waist,' the old healer whispers, his voice raspy. He hands you a rough pouch that smells of the sea. 'Take this salt. The Manananggal despises it.' You've gained Asin (Salt).",
    "onArrive": { "addItem": "Asin" },
    "choices": [
      {
        "text": "Thank him and head to the old church where it was last seen.",
        "to": "oldChurch_entry"
      }
    ]
  },
  "askCaptain": {
    "text": "'My best men have vanished,' the captain says grimly, his face etched with worry. He hands you a braid of garlic. 'We believe it's a Wakwak, a different kind of horror. This might keep it at bay.' You've gained Bawang (Garlic).",
    "onArrive": { "addItem": "Bawang" },
    "choices": [
      {
        "text": "Nod grimly and head to the old church where it was last seen.",
        "to": "oldChurch_entry"
      }
    ]
  },
  "oldChurch_entry": {
    "text": "The ancient church is a hollowed-out skeleton, its stone walls covered in moss. Dust motes dance in the single moonbeam piercing the collapsed roof. Do you investigate the crumbling bell tower or the desecrated altar?",
    "choices": [
      {
        "text": "Climb the creaking stairs to the bell tower.",
        "to": "bellTower"
      },
      {
        "text": "Inspect the altar at the far end of the church.",
        "to": "altar"
      }
    ]
  },
  "bellTower": {
    "text": "In the belfry, a creature with ragged, leathery wings and sharp talons screeches! It's a Wakwak, feasting on a goat. It turns its glowing red eyes on you!",
    "jumpScare": {
      "image": "https://picsum.photos/seed/wakwak_scare/1200/800",
      "sound": "https://cdn.pixabay.com/audio/2022/02/17/audio_39c3629707.mp3"
    },
    "choices": [
      {
        "text": "Thrust the garlic braid at it!",
        "to": "useGarlicOnWakwak",
        "requires": "Bawang"
      },
      {
        "text": "You have no garlic! Fight it with your bolo knife!",
        "to": "fightWakwakNoGarlic",
        "hideIf": "Bawang"
      },
      {
        "text": "This isn't a Manananggal. The salt is useless here.",
        "to": "fightWakwakNoGarlic",
        "requires": "Asin"
      }
    ]
  },
  "useGarlicOnWakwak": {
    "text": "The Wakwak recoils from the pungent garlic, giving you an opening! You slash with your bolo, wounding its wing. It shrieks and flies off into the night, dropping something shiny.",
    "onArrive": { "addItem": "Agimat" },
    "choices": [
      {
        "text": "You found an Agimat (Amulet)! Continue to the rice fields.",
        "to": "riceFields_entry"
      }
    ]
  },
  "fightWakwakNoGarlic": {
    "text": "Without the garlic to weaken it, the Wakwak is too fast and ferocious. It claws you deeply before you can land a solid blow. It escapes into the night.",
    "onArrive": { "takeDamage": 30 },
    "choices": [
      {
        "text": "Wounded, you limp towards the rice fields.",
        "to": "riceFields_entry"
      }
    ]
  },
  "altar": {
    "text": "The altar is overturned. Behind it, you find a small, intricately carved amulet throbbing with a faint warmth. It feels protective. You've found an Agimat (Amulet).",
    "onArrive": { "addItem": "Agimat" },
    "choices": [
      {
        "text": "With the amulet secured, you head towards the rice fields.",
        "to": "riceFields_entry"
      }
    ]
  },
  "riceFields_entry": {
    "text": "The moon hangs high over the vast, dark rice paddies. The water reflects the stars like broken glass. In the distance, you hear the faint sound of a baby crying.",
    "choices": [
      {
        "text": "It's a trap. A Tiyanak. Ignore it and press on.",
        "to": "baleteTree_approach"
      },
      {
        "text": "It could be a real child! Investigate the sound.",
        "to": "investigateTiyanak"
      }
    ]
  },
  "investigateTiyanak": {
    "text": "You follow the crying to a small thicket. As you part the leaves, the crying stops. A small, monstrous creature with sharp teeth leaps out, lunging for you before you can react!",
    "jumpScare": {
        "image": "https://picsum.photos/seed/tiyanak_scare/1200/800",
        "sound": "https://cdn.pixabay.com/audio/2022/10/24/audio_39b251e687.mp3"
    },
    "choices": [
      {
        "text": "It bites your leg before scurrying away! You fell for the oldest trick...",
        "to": "tiyanakDamage",
        "hideIf": "Agimat"
      },
      {
        "text": "Your Agimat glows, repelling the creature before it can bite!",
        "to": "baleteTree_approach",
        "requires": "Agimat"
      }
    ]
  },
  "tiyanakDamage": {
    "text": "The bite is painful and you feel a strange weakness spreading. You curse your foolishness and continue towards the ominous Balete tree.",
    "onArrive": { "takeDamage": 25 },
    "choices": [
      {
        "text": "Continue, more cautious than before.",
        "to": "baleteTree_approach"
      }
    ]
  },
  "baleteTree_approach": {
    "text": "You've reached the heart of the darkness: a massive, ancient Balete tree with thick, hanging roots that look like grasping arms. You can hear a sickening squelching sound from above. The Manananggal is here. This is the final battle.",
    "choices": [
      {
        "text": "Charge the tree and attack the creature head-on!",
        "to": "finalFight_direct"
      },
      {
        "text": "Remember the lore. Search for the lower half of its body.",
        "to": "finalFight_search"
      }
    ]
  },
  "finalFight_direct": {
    "text": "You attack the flying creature directly, but it's too agile in the air. It swoops down, its long, sharp tongue lashing out. Your bravery costs you dearly.",
    "onArrive": { "takeDamage": 50 },
    "jumpScare": {
      "image": "https://picsum.photos/seed/manananggal_scare/1200/800",
      "sound": "https://cdn.pixabay.com/audio/2023/08/04/audio_3a651cce6a.mp3"
    },
    "choices": [
      {
        "text": "You're heavily wounded! You must find its lower half!",
        "to": "finalFight_search"
      }
    ]
  },
  "finalFight_search": {
    "text": "You ignore the airborne horror and frantically search the base of the Balete tree. Hidden among the gnarled roots, you find it: the creature's vulnerable lower torso, standing motionless.",
    "choices": [
      {
        "text": "Pour the holy salt into the torso!",
        "to": "goodEnding",
        "requires": "Asin"
      },
      {
        "text": "You don't have salt! Hack at it with your bolo!",
        "to": "badEnding_noSalt",
        "hideIf": "Asin"
      }
    ]
  },
  "goodEnding": {
    "text": "As the salt touches the flesh, the torso erupts in black smoke. High above, the winged creature gives a final, agonizing shriek and disintegrates into dust. The sun begins to rise. You have saved San Gubat.",
    "isEnding": true
  },
  "badEnding_noSalt": {
    "text": "Your bolo cuts deep, but it's not enough. The creature swoops down, enraged, and impales you with its sharp tongue. Your lack of the proper tool was your undoing. GAME OVER.",
    "isEnding": true
  },
  "gameOver_hp": {
    "text": "Your wounds are too severe. You collapse, and the darkness consumes you. Your hunt ends in failure. GAME OVER.",
    "isEnding": true
  }
};

const initialState: GameState = {
  playerName: '',
  hp: 100,
  inventory: [],
  currentScene: 'start',
  gameStarted: false,
  damageTaken: false,
  jumpScare: null,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...initialState,
        playerName: action.payload.playerName,
        gameStarted: true,
      };
    case 'MAKE_CHOICE': {
      // NOTE: The scene passed in is the *destination* scene object
      const { scene, to } = action.payload;
      let newHp = state.hp;
      let newInventory = [...state.inventory];
      let damageTaken = false;
      let jumpScare = null;

      if (scene) {
        if (scene.onArrive) {
          if (scene.onArrive.addItem) {
            if(!newInventory.includes(scene.onArrive.addItem)) {
              newInventory.push(scene.onArrive.addItem);
            }
          }
          if (scene.onArrive.takeDamage) {
            newHp -= scene.onArrive.takeDamage;
            damageTaken = true;
          }
        }
        if (scene.jumpScare) {
            jumpScare = scene.jumpScare;
        }
      }
      
      const finalScene = newHp <= 0 ? 'gameOver_hp' : to;

      return {
        ...state,
        hp: newHp,
        inventory: newInventory,
        currentScene: finalScene,
        damageTaken,
        jumpScare,
      };
    }
    case 'RESET_GAME':
      localStorage.removeItem('gameState');
      return {
        ...initialState,
        gameStarted: false,
      };
    case 'LOAD_GAME':
      return {...action.payload, jumpScare: null}; // Ensure jump scares don't persist on load
    case 'ACKNOWLEDGE_DAMAGE':
      return {
        ...state,
        damageTaken: false
      };
    case 'CLEAR_JUMPSCARE':
        return {
            ...state,
            jumpScare: null,
        };
    default:
      return state;
  }
}

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}>({
  state: initialState,
  dispatch: () => null,
});

export const GameProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  useEffect(() => {
    try {
      const savedState = localStorage.getItem('gameState');
      if (savedState) {
        const parsedState: GameState = JSON.parse(savedState);
        if (parsedState.gameStarted) {
            dispatch({ type: 'LOAD_GAME', payload: parsedState });
        }
      }
    } catch (error) {
        console.error("Failed to parse saved game state:", error);
        localStorage.removeItem('gameState');
    }
  }, []);

  useEffect(() => {
    if (state.gameStarted) {
      localStorage.setItem('gameState', JSON.stringify(state));
    }
  }, [state]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

export default GameContext;