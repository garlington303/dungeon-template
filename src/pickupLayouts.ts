export interface GridPickupSpawn {
  itemId: string;
  quantity?: number;
  gridX: number;
  gridZ: number;
}

export const DUNGEON_PICKUP_LAYOUT: GridPickupSpawn[] = [
  // Potion cluster near the starting hallway
  { itemId: 'potion_health', quantity: 1, gridX: 2, gridZ: 2 },
  { itemId: 'potion_health', quantity: 2, gridX: 3, gridZ: 2 },
  { itemId: 'potion_health', quantity: 1, gridX: 2, gridZ: 3 },

  // Key tucked a bit deeper into the first chamber
  { itemId: 'key_blue', quantity: 1, gridX: 5, gridZ: 3 },

  // Early weapon reward past the key
  { itemId: 'axe_basic', quantity: 1, gridX: 6, gridZ: 4 },
];
