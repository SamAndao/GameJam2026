import kaplay from "kaplay";
// import "kaplay/global"; // uncomment if you want to use without the k. prefix

const k = kaplay({
    width:1536,
    height:768,
    // letterbox: true,
    debug: true

});

const playerStats = {
    speed: 200,
    speedScaling: 1,
    attackSpeed: .7, // seconds per attack
}

const gameStats = {

}

const levelStats = {

}


// LOAD GAME ASSETS
// backgrounds
k.loadSprite('bg-forest-1', 'sprites/backgrounds/Forest-1.png');


// projectiles 
k.loadSprite('sampleProjectile', 'sprites/objects/sampleProjectile.png', {
    sliceX: 8,
    sliceY: 1,
    anims: {
            spin: {
                from:0,
                to: 7,
                speed: 20,
                loop: true,
            },  
        }
}) 



// others
k.loadSprite('shadow', 'sprites/others/shadow.png')
k.loadSprite('footsteps', 'sprites/others/footsteps.png')



k.loadSprite('characterJump', "sprites/characters/character1/CharacterJump.png", {
    sliceX: 8,
    sliceY: 1,
    anims: {
            jump: {
                from:0,
                to: 7,
                speed: 12,
                loop: false,
            },  
        }
    })

k.loadSprite('character', "sprites/characters/character1/Character SpriteSheet.png", {
    sliceX: 4,
    sliceY: 6,
    anims: {
            walkUp: {
                from:20,
                to: 23,
                speed: 10,
                loop: true,
            },
            walkDown: {
                from:12,
                to: 15,
                speed: 10,
                loop: true,
            },
            walkLeft: {
                from:16,
                to: 19,
                speed: 10,
                loop: true,
            },
            walkRight: {
                from:16,
                to: 19,
                speed: 10,
                loop: true,
            },
            idle: {
                from:0,
                to: 3,
                speed: 4,
                loop: true,
            }
        },
    });
    
// too much player in this game
const spawnPlayer = (posX = 500, posY = 500) => { 
        const player = createPlayer(posX, posY);
        initiateMovement(player, true);
        createShadow(player, 20);
        
        return player;
}


const createFootsteps = (entity, size = 3) => {
    add([
            sprite("footsteps"),       
            pos(entity.pos.x, entity.pos.y + 40), 
            anchor("center"),
            layer("effects-back"),
            lifespan(1),           
            opacity(.2),
            scale(size)
        ]);
}

const createShadow = (entity, offset, offs = false, size = 5) => {
    add([
        sprite('shadow'), 
        pos(),
        follow(entity, vec2(0, offset)),
        layer("effects-back"),
        anchor('center'),
        scale(size),
        opacity(.4),
        offscreen({ destroy: offs }),
    ])
}

const createPlayer = (posX, posY) => {
    return add(
        [
            sprite("character", { frame: 0 }),
            pos(posX, posY),
            scale(5),
            anchor("center"),
            layer('entities'),
            k.area({
                shape: new k.Rect(k.vec2(0), 10, 16)
            }),
            body(),
            {
                speed: playerStats.speed
            }
        ],
        'character'
    )
} 

const initiateMovement = (player, makesSteps = false) => {
    
    const diagonalFactor = 1 / Math.sqrt(2);
    let lastDir = 'down';

    const FOOTSTEP_INTERVAL = 0.3;
    let footstepTimer = 0;

    let isJumping = 0;


    const characterClone = add(
        [
            sprite("characterJump", { frame: 0 }),
            pos(),
            scale(5),
            anchor("center"),
            layer('entities'),
            follow(player, vec2(0, -30)),
            opacity(0)
        ],
        'characterClone'
    )

    



    onKeyPress(".", () => {
        debug.inspect = !debug.inspect;
    });



    k.onKeyPress("left", () => lastDir = "left");
    k.onKeyPress("right", () => lastDir = "right");
    k.onKeyPress("up", () => lastDir = "up");
    k.onKeyPress("down", () => lastDir = "down");
    k.onKeyPress("space", () => {
        if (!isJumping){
            isJumping = true;
            player.opacity = 0;
            characterClone.opacity = 1;
            characterClone.play("jump");
            k.wait(.6, () => {
                isJumping = false;
                player.opacity = 1;
                characterClone.opacity = 0;
                
            })
        }
    })


    k.onUpdate(() => {
        const directionVector = k.vec2(0, 0);

        if (k.isKeyDown("a")) directionVector.x -= 1;
        if (k.isKeyDown("d")) directionVector.x += 1;
        if (k.isKeyDown("w")) directionVector.y -= 1;
        if (k.isKeyDown("s")) directionVector.y += 1;

        let anim = null;

        if (lastDir === "left" && k.isKeyDown("left")) {
            anim = "walkLeft";
            player.flipX = true;
        } 
        else if (lastDir === "right" && k.isKeyDown("right")) {
            anim = "walkRight";
            player.flipX = false;
        } 
        else if (lastDir === "up" && k.isKeyDown("up")) {
            anim = "walkUp";
        } 
        else if (lastDir === "down" && k.isKeyDown("down")) {
            anim = "walkDown";
        }

        if (!anim) {
            if (directionVector.x !== 0) {
                anim = directionVector.x < 0 ? "walkLeft" : "walkRight";
                player.flipX = directionVector.x < 0;
            } else if (directionVector.y !== 0) {
                anim = directionVector.y < 0 ? "walkUp" : "walkDown";
            }
        }

        if (!isJumping) {

            if (anim) {
                if (player.curAnim() !== anim) {
                    player.play(anim);
                } 
                if (makesSteps) {
                    footstepTimer += k.dt();
                    if (footstepTimer >= FOOTSTEP_INTERVAL) {
                        createFootsteps(player)
                        footstepTimer = 0; 
                    }
                }
            } else {
                    if (player.curAnim() !== "idle") {
                        player.play("idle");
                    }
            } 
        }

        if (directionVector.x && directionVector.y) {
            player.move(directionVector.scale(diagonalFactor * playerStats.speed));
        } else {
            player.move(directionVector.scale(playerStats.speed));
        }
    });

    onUpdate(() => {
        if (!isKeyDown("w") && !isKeyDown("s") && !isKeyDown("a") && !isKeyDown("d")) {
            if (player.curAnim() !== "idle") {
                player.play("idle");
            }
        }            
    });

}


const spawnProjectile = (spriteName, getFrom, getDestination, dmg = 1) => {
    let attackTimer = 0;
    k.onKeyPress("up", () => playerStats.attackSpeed -= .05 );
    k.onKeyPress("down", () => playerStats.attackSpeed += .05);
    onUpdate(() => {
        attackTimer += dt();
    })
    onMouseDown(() => {
        
        if (attackTimer > playerStats.attackSpeed) {
            const from = getFrom();
            const destination = getDestination();
            const dir = vec2(destination).sub(from).unit();
    
            const projectile = add([
                sprite(spriteName),
                layer("effects-front"),
                pos(from.x, from.y),
                area(),
                move(dir, 900),           
                offscreen({ destroy: true }),
                scale(.5),
                opacity(1),
                lifespan(2),
                anchor('center')
            ]);
            createShadow(projectile, 20, true)
            projectile.play('spin');
            attackTimer = 0;
        }
    });
}


const initiateBasicAttack = (player) => {
    spawnProjectile(
        'sampleProjectile',
        () => vec2(player.pos),    
        () => mousePos()             
    );
}




const lockProjectile = () => {

}

// FUNCTION TOOLS

function addWallBoundaries() {
    const WALL = 10;

    add([rect(width(), WALL), pos(0, -WALL), area(), body({ isStatic: true })]);
    add([rect(width(), WALL), pos(0, height()), area(), body({ isStatic: true })]);
    add([rect(WALL, height()), pos(-WALL, 0), area(), body({ isStatic: true })]);
    add([rect(WALL, height()), pos(width(), 0), area(), body({ isStatic: true })]);
}

function setBackgroundImage(spriteName, r = 0, g = 0, b = 0) { 
    k.setBackground(r,g,b);
    const bg = add([
        sprite(spriteName),
        pos(k.center()),
        layer("background"),
        anchor('center')
    ]);
    bg.scale = k.vec2(
        k.width() / 256,
        k.height() / 144
    );
}



// forest
k.scene("forest-1", () => {
    addWallBoundaries();
    layers(['background', 'shadow', 'objects', 'effects-back', 'entities', 'effects-front', 'ui'], 'background');

    setBackgroundImage('bg-forest-1', 180, 131, 86)

    const map = [
        '                ',
        '                ',
        '                ',
        '                ',
        '                ',
        '                ',
        '                ',
        '                ',
        '                '
    ];

    const levelConfig = {
        tileWidth: 96,
        tileHeight: 96,
        tiles: {
          
        }
    };

    addLevel(map, levelConfig);
    const player = spawnPlayer();
    initiateBasicAttack(player);
})


k.go("forest-1")






