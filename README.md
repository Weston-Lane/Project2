# VR Project

This project is a Three.js-based WebXR application using the Vite build toolchain.

## Prerequisites

Ensure you have the following installed:
* **Node.js (LTS):** [Download Node.js](https://nodejs.org/)
* **npm:** (Included with Node.js)

---
In the terminal move to the VR App directory
```bash
cd VR App
```
## Project Setup
### 2. Install Dependencies
```bash
npm install
```
## RUN SERVER
```bash
npm run dev
```
The server should be hosted locally at
http://localhost:5173
just crtl click and the site should open up 

## ENGINE API
the engnine back end handles the updating of object, world and scene creation, and input handling.
I'm still working on functionality but to add any obj you just
```js
class Obj extends GameObject{
    
    constructor()
    {
        //EACH OBJ NEEDS A MESH AND A BODY PASSED INTO SUPER()
        //****These are not actual three JS function calls. Just psuedo code. Replace with the real ones when used     
        const geo = new THREE.Geometry();
        const mat = new THREE.Material();
        const mesh = new THREE.Mesh(geo, mat);

        const shape = new CANNON.Shape();
        const body = new CANNON.Body(); 

        super(mesh, body);
        //any object variables needed for obj behavior

    }

    OnUpdate()
    {
        super.OnUpdate();
        //obj behavior that should happen per frame

    }
    //other functions and behaviors can be added as methods to the class and be called from in the game loop or in the class. This is how you add behaviors to the objects created
}
```
If you have ever used Unity, it operates similar. Every Obj being a class that is created and behaviors are added to that.