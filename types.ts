export interface Choice {
  text: string;
  to: string;
  requires?: string;
  hideIf?: string;
}

export interface OnArrive {
  addItem?: string;
  takeDamage?: number;
}

export interface JumpScare {
    image: string;
    sound: string;
}

export interface StoryNode {
  text: string;
  choices?: Choice[];
  onArrive?: OnArrive;
  isEnding?: boolean;
  jumpScare?: JumpScare;
}

export interface StoryData {
  [key: string]: StoryNode;
}

export interface GameState {
  playerName: string;
  hp: number;
  inventory: string[];
  currentScene: string;
  gameStarted: boolean;
  damageTaken: boolean;
  jumpScare: JumpScare | null;
}

export type GameAction =
  | { type: 'START_GAME'; payload: { playerName: string } }
  | { type: 'MAKE_CHOICE'; payload: { scene: StoryNode, to: string } }
  | { type: 'RESET_GAME' }
  | { type: 'LOAD_GAME'; payload: GameState }
  | { type: 'ACKNOWLEDGE_DAMAGE' }
  | { type: 'CLEAR_JUMPSCARE' };