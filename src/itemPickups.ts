import * as THREE from 'three';
import { ITEM_DB, type ItemTemplate, type InventoryManager } from './inventory';

export interface ItemPickupSpawn {
  itemId: string;
  quantity: number;
  x: number;
  z: number;
  y?: number;
}

interface PickupData {
  sprite: THREE.Sprite;
  itemId: string;
  quantity: number;
  x: number;
  z: number;
  baseY: number;
  bobOffset: number;
}

export class ItemPickupManager {
  private readonly scene: THREE.Scene;
  private readonly inventory: InventoryManager;
  private readonly loader = new THREE.TextureLoader();

  private pickups: PickupData[] = [];
  private iconTextureCache = new Map<string, THREE.Texture>();

  private animTime = 0;

  // MVP tuning knobs (kept local to avoid widening CONFIG surface area)
  private readonly pickupRadius = 0.75;
  private readonly bobSpeed = 2.2;
  private readonly bobHeight = 0.08;
  private readonly pulseSpeed = 3.0;
  private readonly pulseAmount = 0.10;

  constructor(scene: THREE.Scene, inventory: InventoryManager) {
    this.scene = scene;
    this.inventory = inventory;
  }

  spawn(spawn: ItemPickupSpawn): void {
    const tpl = ITEM_DB[spawn.itemId];
    if (!tpl) return;

    const baseY = spawn.y ?? 0.4;

    const material = new THREE.SpriteMaterial({
      map: this.getOrLoadIconTexture(tpl),
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const sprite = new THREE.Sprite(material);
    sprite.position.set(spawn.x, baseY, spawn.z);
    sprite.scale.set(0.42, 0.42, 0.42);

    const pickup: PickupData = {
      sprite,
      itemId: spawn.itemId,
      quantity: Math.max(1, Math.floor(spawn.quantity)),
      x: spawn.x,
      z: spawn.z,
      baseY,
      bobOffset: Math.random() * Math.PI * 2,
    };

    this.pickups.push(pickup);
    this.scene.add(sprite);
  }

  spawnMany(spawns: ItemPickupSpawn[]): void {
    spawns.forEach((s) => this.spawn(s));
  }

  update(dt: number, playerPos: THREE.Vector3): void {
    this.animTime += dt;

    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const p = this.pickups[i];

      // bob + pulse
      const bobY = Math.sin(this.animTime * this.bobSpeed + p.bobOffset) * this.bobHeight;
      p.sprite.position.y = p.baseY + bobY;

      const pulse = 1 + Math.sin(this.animTime * this.pulseSpeed + p.bobOffset) * this.pulseAmount;
      p.sprite.scale.set(0.42 * pulse, 0.42 * pulse, 0.42 * pulse);

      const mat = p.sprite.material as THREE.SpriteMaterial;
      mat.opacity = 0.85 + (pulse - 1) * 0.75;

      // pickup check
      const dx = playerPos.x - p.x;
      const dz = playerPos.z - p.z;
      const distance = Math.sqrt(dx * dx + dz * dz);

      if (distance < this.pickupRadius) {
        const ok = this.inventory.tryAddById(p.itemId, p.quantity);
        if (ok) {
          this.scene.remove(p.sprite);
          this.pickups.splice(i, 1);
        }
      }
    }
  }

  clear(): void {
    for (const p of this.pickups) this.scene.remove(p.sprite);
    this.pickups = [];
  }

  getActiveCount(): number {
    return this.pickups.length;
  }

  private getOrLoadIconTexture(tpl: ItemTemplate): THREE.Texture {
    const existing = this.iconTextureCache.get(tpl.id);
    if (existing) return existing;

    // Create a tiny placeholder texture so sprites render immediately
    const placeholder = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
    placeholder.needsUpdate = true;
    placeholder.colorSpace = THREE.SRGBColorSpace;
    this.iconTextureCache.set(tpl.id, placeholder);

    // Async load the real icon (often a data URI SVG)
    this.loader.load(
      tpl.icon,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.magFilter = THREE.NearestFilter;
        tex.minFilter = THREE.NearestFilter;
        tex.generateMipmaps = false;
        this.iconTextureCache.set(tpl.id, tex);

        // Update any existing sprites using the placeholder for this item
        for (const p of this.pickups) {
          if (p.itemId !== tpl.id) continue;
          const mat = p.sprite.material as THREE.SpriteMaterial;
          mat.map = tex;
          mat.needsUpdate = true;
        }
      },
      undefined,
      () => {
        // Keep placeholder on failure
      }
    );

    return placeholder;
  }
}
