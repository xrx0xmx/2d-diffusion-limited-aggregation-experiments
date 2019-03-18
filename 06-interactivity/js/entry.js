import Settings from './Settings';
import DLA from '../../core/DLA';
import Player from './Player';
import SVGLoader from '../../core/SVGLoader';

let dla, player;

const TRAIL = 0,
      GRAVITY =  1,
      ASTEROIDS = 2,
      RADIAL = 3;
let currentEffectMode = GRAVITY;

let particleSpreadRadius = 20;

const sketch = function (p5) {
  // Setup ---------------------------------------------------------------
  p5.setup = function () {
    p5.createCanvas(window.innerWidth, window.innerHeight);
    p5.colorMode(p5.HSB, 255);
    p5.ellipseMode(p5.CENTER);

    // Set up the interactive player object for ASTEROIDS and RADIAL modes
    player = new Player(p5, window.innerWidth/2, window.innerHeight/2);

    // Set up the simulation environment
    dla = new DLA(p5, Settings);
    reset();
  }

  // Draw ----------------------------------------------------------------
  p5.draw = function () {
    // Iterate and draw all walkers and clustered particles
    dla.iterate();
    dla.draw();

    switch(currentEffectMode) {
      // In "trail" mode, spawn walkers continuously when the mouse is pressed
      case TRAIL:
        if(
          p5.mouseIsPressed && p5.mouseButton === p5.LEFT && 
          p5.mouseX >= dla.edges.left + particleSpreadRadius && 
          p5.mouseX <= dla.edges.right - particleSpreadRadius && 
          p5.mouseY >= dla.edges.top + particleSpreadRadius && 
          p5.mouseY <= dla.edges.bottom - particleSpreadRadius
        ) {
          dla.createWalker({
            x: p5.mouseX + p5.random(-particleSpreadRadius, particleSpreadRadius),
            y: p5.mouseY + p5.random(-particleSpreadRadius, particleSpreadRadius)
          });
        }

        break;

      // In "radial" mode, draw a circle indicating the path the player travels on
      case RADIAL:
        p5.stroke(200);
        p5.noFill();
        p5.ellipse(window.innerWidth / 2, window.innerHeight / 2, 800);

        // Point the player towards the mouse
        player.heading = Math.atan2(p5.mouseY - player.y, p5.mouseX - player.x);

        break;
    }

    if(currentEffectMode == ASTEROIDS || currentEffectMode == RADIAL) {
      player.move();
      player.draw();

      if(player.isShooting && p5.frameCount % 5 == 0) {
        dla.createWalker({
          x: player.x,
          y: player.y,
          BiasTowards: {
            x: Math.cos(player.heading) * 5000,
            y: Math.sin(player.heading) * 5000
          }
        });
      }

      if(!p5.mouseIsPressed) {
        player.isShooting = false;
      }

      // Wrap player when it leaves the screen's edge
      if(player.x < dla.edges.left) {
        player.x = dla.edges.right;
      }

      if(player.x > dla.edges.right) {
        player.x = dla.edges.left;
      }

      if(player.y < dla.edges.top) {
        player.y = dla.edges.bottom;
      }

      if(player.y > dla.edges.bottom) {
        player.y = dla.edges.top;
      }
    }
  }

  function reset() {
    dla.removeAll();

    if(currentEffectMode == TRAIL || currentEffectMode == ASTEROIDS || currentEffectMode == RADIAL) {
      dla.showWalkers = true;
      // dla.createDefaultClusters('Point');
      createCustomShapesFromSVG(require('../svg/dla.svg'));
    } else if(currentEffectMode == GRAVITY) {
      dla.showWalkers = false;
    }

    switch(currentEffectMode) {
      case TRAIL:
        dla.settings.BiasTowards = 'Center';
        break;

      case ASTEROIDS:
        player.movementMode = player.FREE;
        break;

      case RADIAL:
        player.movementMode = player.RADIAL;
        player.x = window.innerWidth / 2 - 800 / 2;
        player.y = window.innerHeight / 2;
        player.velocity.x = 0;
        player.velocity.y = 0;
        break;
    }
  }

  function createCustomShapesFromSVG(file) {
    let paths = SVGLoader.loadFromFileContents(file);
    
    for(let path of paths) {
      path.stuck = true;
      path.solid = false;
      path.x += window.innerWidth / 2 - 900 / 2;
      path.y += window.innerHeight / 2 - 900 / 2;
    }

    dla.createShapesFromPaths(paths);
  }

  // Key down handler -------------------------------------------------------
  p5.keyPressed = function () {
    switch(p5.key) {
      case 'w':
        if(currentEffectMode == ASTEROIDS) {
          player.isBoosting = true;
          player.isBraking = false;
        }

        break;

      case 's':
        if(currentEffectMode == ASTEROIDS) {
          player.isBoosting = false;
          player.isBraking = true;
        }

        break;
      
      case 'a':
        if(currentEffectMode == ASTEROIDS) {
          player.isRotatingLeft = true;
          player.isRotatingRight = false;
        } else if(currentEffectMode == RADIAL) {
          player.isMovingCounterclockwise = true;
          player.isMovingClockwise = false;
        }

        break;

      case 'd':
        if(currentEffectMode == ASTEROIDS) {
          player.isRotatingLeft = false;
          player.isRotatingRight = true;
        } else if(currentEffectMode == RADIAL) {
          player.isMovingCounterclockwise = false;
          player.isMovingClockwise = true;
        }

        break;

      case ' ':
        player.isShooting = true;
        break;
    }
  }
  
  // Key up handler ---------------------------------------------------------
  p5.keyReleased = function () {
    if(currentEffectMode == ASTEROIDS || currentEffectMode == RADIAL) {
      switch(p5.key) {
        case 'w':
          if(currentEffectMode == ASTEROIDS) {
            player.isBoosting = false;
          }

          break;

        case 's':
          if(currentEffectMode == ASTEROIDS) {
            player.isBraking = false;
          }

          break;

        case 'a':
          if(currentEffectMode == ASTEROIDS) {
            player.isRotatingLeft = false;
          } else if (currentEffectMode == RADIAL) {
            player.isMovingCounterclockwise = false;
          }

          break;

        case 'd':
          if(currentEffectMode == ASTEROIDS) {
            player.isRotatingRight = false;
          } else if(currentEffectMode == RADIAL) {
            player.isMovingClockwise = false;
          }

          break;

        case ' ':
          player.isShooting = false;
          break;
      }
    }

    switch (p5.key) {
      case ' ':
        if(currentEffectMode != ASTEROIDS && currentEffectMode != RADIAL) {
         dla.togglePause();
        }

        break;

      case 'w':
        if(currentEffectMode != ASTEROIDS && currentEffectMode != RADIAL) {
          dla.toggleShowWalkers();
        }

        break;

      case 'c':
        dla.toggleShowClusters();
        break;

      case 'r':
        reset();
        break;

      case 'f':
        dla.toggleUseFrame();
        reset();
        break;

      case 'l':
        dla.toggleLineRenderingMode();
        break;
        
      case 'e':
        dla.export();
        break;

      case '1':
        currentEffectMode = GRAVITY;
        reset();
        break;

      case '2':
        currentEffectMode = TRAIL;
        reset();
        break;

      case '3':
        currentEffectMode = ASTEROIDS;
        reset();
        break;

      case '4':
        currentEffectMode = RADIAL;
        reset();
        break;
    }
  }

  // Mouse down handler ----------------------------------------------------------
  p5.mousePressed = function() {
    switch(currentEffectMode) {
      case GRAVITY:
        // Spawn walkers in randomly in a circle around the mouse
        dla.settings.CircleCenter = {x: p5.mouseX, y: p5.mouseY};
        dla.createDefaultWalkers(8000, 'Circle');

        // Add a single clustered "seed" particle at the mouse position
        dla.createClusterFromParams([
          {
            x: p5.mouseX,
            y: p5.mouseY
          }
        ]);

        // Make all walkers move towards the mouse
        for(let body of dla.bodies) {
          body.BiasTowards = {
            x: p5.mouseX,
            y: p5.mouseY
          };
        }

        break;

      case RADIAL:
        player.isShooting = true;
        break;
    }
  }

  // Mouse up handler -----------------------------------------------------------
  p5.mouseReleased = function() {
    switch(currentEffectMode) {
      case GRAVITY:
        reset();
        break;
    }
  }
}

// Launch the sketch using p5js in instantiated mode
new p5(sketch);