import * as THREE from 'three';
import * as CANNON from 'cannon-es'
import {engine} from './Core/Engine.js'
import { GameObject } from './Core/GameObject.js';
import * as Objects from './Objects/Objects.js'





await engine.Init();
Objects.LoadGame();

const projectile = new Objects.Projectile();

projectile.MakeTarget(head);



