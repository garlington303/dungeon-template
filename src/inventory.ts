
export type ItemType = 'gold' | 'potion' | 'key';

export interface InventoryItem {
  type: ItemType;
  count: number;
  maxStack: number;
  icon: string; // URL or color for placeholder
  name: string;
  description: string;
}

export const ITEM_DEFINITIONS: Record<ItemType, Omit<InventoryItem, 'count'>> = {
  gold: {
    type: 'gold',
    maxStack: 99,
    icon: 'gold-icon', // We'll handle rendering logic separately
    name: 'Gold Coin',
    description: 'Currency of the realm.'
  },
  potion: {
    type: 'potion',
    maxStack: 5,
    icon: 'potion-icon',
    name: 'Health Potion',
    description: 'Restores 25 HP.'
  },
  key: {
    type: 'key',
    maxStack: 1,
    icon: 'key-icon',
    name: 'Dungeon Key',
    description: 'Unlocks a door.'
  }
};

export class InventoryManager {
  private items: (InventoryItem | null)[];
  private capacity: number = 10;
  private isVisible: boolean = false;
  private container: HTMLElement | null = null;

  constructor() {
    this.items = new Array(this.capacity).fill(null);
    this.createUI();
  }

  private createUI(): void {
    // Create container
    this.container = document.createElement('div');
    this.container.id = 'inventory-ui';
    this.container.style.position = 'absolute';
    this.container.style.top = '50%';
    this.container.style.left = '50%';
    this.container.style.transform = 'translate(-50%, -50%)';
    this.container.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    this.container.style.border = '4px solid #444';
    this.container.style.padding = '20px';
    this.container.style.display = 'none'; // Hidden by default
    this.container.style.gridTemplateColumns = 'repeat(5, 64px)';
    this.container.style.gridTemplateRows = 'repeat(2, 64px)';
    this.container.style.gap = '10px';
    this.container.style.pointerEvents = 'auto'; // Allow interaction if needed
    this.container.style.zIndex = '1000';

    // Add title
    const title = document.createElement('div');
    title.innerText = 'INVENTORY';
    title.style.position = 'absolute';
    title.style.top = '-30px';
    title.style.left = '0';
    title.style.width = '100%';
    title.style.textAlign = 'center';
    title.style.color = 'white';
    title.style.fontFamily = 'monospace';
    title.style.fontWeight = 'bold';
    this.container.appendChild(title);

    document.body.appendChild(this.container);
    this.render();
  }

  public toggleVisibility(): void {
    this.isVisible = !this.isVisible;
    if (this.container) {
      this.container.style.display = this.isVisible ? 'grid' : 'none';
    }
  }

  public addItem(type: ItemType, count: number = 1): boolean {
    const def = ITEM_DEFINITIONS[type];
    let remaining = count;

    // 1. Try to stack with existing items
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      if (item && item.type === type && item.count < item.maxStack) {
        const space = item.maxStack - item.count;
        const add = Math.min(space, remaining);
        item.count += add;
        remaining -= add;
        if (remaining === 0) break;
      }
    }

    // 2. If still remaining, add to empty slots
    if (remaining > 0) {
      for (let i = 0; i < this.items.length; i++) {
        if (this.items[i] === null) {
          const add = Math.min(def.maxStack, remaining);
          this.items[i] = {
            ...def,
            count: add
          };
          remaining -= add;
          if (remaining === 0) break;
        }
      }
    }

    this.render();
    return remaining === 0; // Return true if all items were added
  }

  public isFull(): boolean {
    return this.items.every(item => item !== null && item.count >= item.maxStack);
  }

  private render(): void {
    if (!this.container) return;

    // Clear existing slots (except title which is absolute)
    // Actually, let's just rebuild the grid content.
    // We need to keep the title, so let's remove children that are slots.
    const slots = this.container.querySelectorAll('.inv-slot');
    slots.forEach(s => s.remove());

    this.items.forEach((item, index) => {
      const slot = document.createElement('div');
      slot.className = 'inv-slot';
      slot.style.width = '64px';
      slot.style.height = '64px';
      slot.style.backgroundColor = '#222';
      slot.style.border = '2px solid #666';
      slot.style.position = 'relative';
      slot.style.display = 'flex';
      slot.style.justifyContent = 'center';
      slot.style.alignItems = 'center';

      if (item) {
        // Icon (placeholder)
        const icon = document.createElement('div');
        icon.style.width = '40px';
        icon.style.height = '40px';
        
        if (item.type === 'gold') icon.style.backgroundColor = 'gold';
        else if (item.type === 'potion') icon.style.backgroundColor = 'red';
        else if (item.type === 'key') icon.style.backgroundColor = 'silver';
        
        icon.style.borderRadius = item.type === 'potion' ? '50%' : '0';
        slot.appendChild(icon);

        // Count
        if (item.maxStack > 1) {
          const count = document.createElement('div');
          count.innerText = item.count.toString();
          count.style.position = 'absolute';
          count.style.bottom = '2px';
          count.style.right = '4px';
          count.style.color = 'white';
          count.style.fontSize = '14px';
          count.style.fontWeight = 'bold';
          count.style.textShadow = '1px 1px 0 #000';
          slot.appendChild(count);
        }
        
        // Full slot highlight
        if (item.count >= item.maxStack) {
            slot.style.borderColor = '#aa0';
        }
      }

      this.container!.appendChild(slot);
    });
  }
}
