import { CollisionGroup, CollisionGroupManager } from 'excalibur';

export const characterGroup = CollisionGroupManager.create('characters');
export const tablesGroup = CollisionGroupManager.create('tables');

export const characterCanCollide = CollisionGroup.collidesWith([characterGroup, tablesGroup]);

