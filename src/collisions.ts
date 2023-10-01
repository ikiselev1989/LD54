import { CollisionGroup, CollisionGroupManager } from 'excalibur';

export const characterGroup = CollisionGroupManager.create('characters');
export const bordersGroup = CollisionGroupManager.create('borders');
export const boozesGroup = CollisionGroupManager.create('boozes');

export const characterCanCollide = CollisionGroup.collidesWith([characterGroup, bordersGroup]);
export const boozesCanCollide = CollisionGroup.collidesWith([boozesGroup]);
