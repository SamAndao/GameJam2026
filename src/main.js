import kaplay from "kaplay";
// import "kaplay/global"; // uncomment if you want to use without the k. prefix
console.log("Vite is working!");
const k = kaplay({
    width:1536,
    height:768,
    letterbox: true,
    debug: true,


});
    k.setBackground(0,0,0);



const playerStats = {
    maxHealth: 250,
    maxMana: 250,
    health: 250,
    mana: 250,
    level: 0,
    maxSpeed: 200,
    speed: 200,
    speedScaling: 1,
    attack: 50,
    attackSpeed: .5, // seconds per attack
    count: 0,
    dashCooldown: 1,
    dashSpeed: 1000,
    dashDuration: 0.15,
    regenTime: 1,
}



const enemies = {
    "plant" : {
        spriteName: "plant",
        maxHealth: 200,
        attackVal: 20,
        hitbox: [k.vec2(0, 2), 10, 16],
        speed: 120,
        walk: "walk",
        attack: "attack",
        attackSpeed: 1,
        attackDelay: .2,
    },
    "spider" : {
        spriteName: "spider",
        maxHealth: 120,
        attackVal: 20,
        hitbox: [k.vec2(0, 2), 10, 16],
        speed: 190,
        walk: "walk",
        attack: "attack",
        attackSpeed: 1,
        attackDelay: .2,
    },


}




const gameStats = {

}

const levelStats = {
    forestDefeated: 0,
    forestTarget: 30,
    forestToSpawn: 0,
}


// LOAD GAME ASSETS
// backgrounds
k.loadSprite('bg-forest-1', 'sprites/backgrounds/Forest-1.png');
k.loadSprite('bg-forest-base', 'sprites/backgrounds/green-bg.png');
k.loadSprite('bg-falling-particles', 'sprites/backgrounds/falling particles.png', {
    sliceX: 6,
    sliceY: 6,
    anims: {
            fall: {
                from:0,
                to: 7,
                speed: 3,
                loop: true,
            },  
        }
});


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
k.loadSprite('dashEffect', 'sprites/others/dashEffect.png')
k.loadSprite('aoeCircle', 'sprites/others/aoeCircle.png')


// user interface 

k.loadSprite('statusFrame', 'sprites/ui/playerStatusFrame.png')
k.loadSprite('progressBar', 'sprites/ui/progressBar.png')


// entities
k.loadSprite('plant', 'sprites/characters/plantEnemy/plant spritesheet.png', {
    sliceX: 4,
    sliceY: 4,
    anims: {
        walk: {
            from:0,
            to: 7,
            speed: 10,
            loop: true
        },
        attack: {
            from:8,
            to: 11,
            speed: 10,
            loop: false
        }
    }
})
k.loadSprite('spider', 'sprites/characters/spiderEnemy/spider spritesheet.png', {
    sliceX: 4,
    sliceY: 4,
    anims: {
        walk: {
            from:0,
            to: 7,
            speed: 10,
            loop: true
        },
        attack: {
            from:8,
            to: 11,
            speed: 10,
            loop: false
        }
    }
})





k.loadSprite('character', "sprites/characters/character1/final character spritesheet.png", {
    sliceX: 8,
    sliceY: 9,
    anims: {
            walkUp: {
                from:40,
                to: 43,
                speed: 10,
                loop: true,
            },
            walkDown: {
                from:24,
                to: 27,
                speed: 10,
                loop: true,
            },
            walkLeft: {
                from:32,
                to: 35,
                speed: 10,
                loop: true,
            },
            walkRight: {
                from:32,
                to: 35,
                speed: 10,
                loop: true,
            },
            idle: {
                from:0,
                to: 3,
                speed: 4,
                loop: true,
            },
            jumpUp: {
                from:64,
                to: 71,
                speed: 12,
                loop: false,
            },
            jumpDown: {
                from:48,
                to: 55,
                speed: 12,
                loop: false,
            },
            jumpLeft: {
                from:56,
                to: 63,
                speed: 12,
                loop: false,
            },
            jumpRight: {
                from:56,
                to: 63,
                speed: 12,
                loop: false,
            },
        },
    });
    
// too much player in this game
const spawnPlayer = (posX = 85, posY = 380) => { 
        const player = createPlayer(posX, posY);
        initiateMovement(player, true);
        createShadow(player, 20, false);
        
        let regenTime = 0;
        onUpdate(() => {
            regenTime += dt()
            if (playerStats.health <= playerStats.maxHealth && regenTime > playerStats.regenTime) {
                playerStats.health +=5;
                regenTime = 0;
            }
        })

        return player;
}


const createFootsteps = (entity, size = 3) => {
    add([
            sprite("footsteps"),       
            pos(entity.pos.x, entity.pos.y + 40), 
            anchor("center"),
            layer("effects-back"),
            lifespan(1),           
            opacity(.3),
            scale(size)
        ]);
        

}

const createEffect = (spriteName, entity, offsetX = 0, offsetY = 0, size = 5, opacityVal = 1, life = 0) => {
    if (life) {
        return add([
            sprite(spriteName), 
            pos(entity.pos.x + offsetX, entity.pos.y +offsetY), 
            layer("effects-front"),
            anchor('center'),
            scale(size),
            opacity(opacityVal),
            offscreen({ destroy: true }),
            lifespan(life),
        ])
    } else {
        return add([
            sprite(spriteName), 
            pos(entity.pos.x, entity.pos.y + 40), 
            layer("effects-front"),
            anchor('center'),
            scale(size),
            opacity(.4),
        ])
    }
    
}

const createShadow = (entity, offset, offs = false, size = 5) => {
    if (offs) {
        return add([
            sprite('shadow'), 
            pos(),
            follow(entity, vec2(0, offset)),
            layer("effects-back"),
            anchor('center'),
            scale(size),
            opacity(.4),
            offscreen({ destroy: true }),
            lifespan(2),
        ])
    } else {
        return add([
            sprite('shadow'), 
            pos(),
            follow(entity, vec2(0, offset)),
            layer("effects-back"),
            anchor('center'),
            scale(size),
            opacity(.4),
        ])
    }
    
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
                shape: new k.Rect(k.vec2(0, 2), 10, 16)
            }),
            body(),
            {
                speed: playerStats.speed
            },
            'player'
        ]
        
    )
} 

const initiateMovement = (player, makesSteps = false) => {
    
    const diagonalFactor = 1 / Math.sqrt(2);
    let lastDir = 'down';

    const FOOTSTEP_INTERVAL = 0.3;
    let footstepTimer = 0;


    let isJumping = false;
    let jumpState = 0;
    let jumpTimer = 0;

    const JUMP_DELAY = 1 / 20;
    const FRAMES = 8;

    let isDashing = false;
    let canDash = true;

    const characterClone = add(
        [
            sprite("character", { frame: 0 }),
            pos(),
            scale(5),
            anchor("center"),
            layer('entities'),
            follow(player, vec2(0, -30)),
            opacity(0)
        ],
        'characterClone'
    )


    k.onKeyPress("left", () => lastDir = "left");
    k.onKeyPress("right", () => lastDir = "right");
    k.onKeyPress("up", () => lastDir = "up");
    k.onKeyPress("down", () => lastDir = "down");
    k.onKeyPress("e", () => {
        if (canDash) {
            isDashing = true;
            let dir = null
            if (isKeyDown("a")) dir = "left";
            else if (isKeyDown("d")) dir = "right";
            else if (isKeyDown("w")) dir = "up";
            else if (isKeyDown("s")) dir = "down";
            else {
                isDashing = false;
                return;
            }
            canDash = false;

            if (dir) {
                wait(playerStats.dashDuration, () => {
                    isDashing = false;
                    wait(playerStats.dashCooldown, () => {
                        canDash = true;
                    })
                })
            } else {
                canDash = true;
            }
        }
    })
    k.onKeyDown("space", () => {
            if (!isJumping) {
                isJumping = true;
                jumpState = 0;
                jumpTimer = 0;
                player.stop();
                player.opacity = 0;
                characterClone.opacity = 1;
                wait(.55, () => {
                    isJumping = false;
                    player.opacity = 1;
                    characterClone.opacity = 0;
                });
                let dir = "down";

                if (isKeyDown("a")) dir = "left";
                else if (isKeyDown("d")) dir = "right";
                else if (isKeyDown("w")) dir = "up";
                else if (isKeyDown("s")) dir = "down";

                let base = 0;

                if (dir === "left") {
                    characterClone.flipX = true;
                    base = 56; // row 1
                } 
                else if (dir === "right") {
                    characterClone.flipX = false;
                    base = 56;
                } 
                else if (dir === "up") {
                    base = 64;
                } 
                else {
                    base = 48; // row 2
                }
                characterClone.frame = base;
            }
        });

    k.onUpdate(() => {
        if (isJumping) {
            player.drawPos = player.pos.add(k.vec2(0, -90)); // move sprite 90px up
        } else {
            player.drawPos = player.pos; // reset to normal
        }
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

        if (!isJumping && anim) {
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
        } else if (!isKeyDown("w") && !isKeyDown("s") && !isKeyDown("a") && !isKeyDown("d") && !isJumping) {
            if (player.curAnim() !== "idle") {
                player.play("idle");
            }
          
        } else if (isJumping)
            {
            jumpTimer += dt();
            if (jumpTimer >= JUMP_DELAY) {

                // determine direction LIVE
                let dir = "down";

                if (isKeyDown("a")) dir = "left";
                else if (isKeyDown("d")) dir = "right";
                else if (isKeyDown("w")) dir = "up";
                else if (isKeyDown("s")) dir = "down";

                let base = 0;

                if (dir === "left") {
                    characterClone.flipX = true;
                    base = 56; // row 1
                } 
                else if (dir === "right") {
                    characterClone.flipX = false;
                    base = 56;
                } 
                else if (dir === "up") {
                    base = 64;
                } 
                else {
                    base = 48; // row 2
                }

                characterClone.frame = base + jumpState;
                jumpState++;
                jumpTimer = 0;
                if (jumpState >= FRAMES) {
                    jumpState = FRAMES - 1; // hold last frame
                }

            }
        }
        
        if (isDashing) {
            if (directionVector.x && directionVector.y) {
                player.move(directionVector.scale(diagonalFactor * playerStats.dashSpeed));
            } else {
                player.move(directionVector.scale(playerStats.dashSpeed));
            }
            createEffect("dashEffect", player, 0,-10, 2.5, .4, .15);
        } else {
            if (directionVector.x && directionVector.y) {
                player.move(directionVector.scale(diagonalFactor * playerStats.speed));
            } else {
                player.move(directionVector.scale(playerStats.speed));
            }
        }
         
    });

  
}



const spawnProjectile = (spriteName, getFrom, getDestination, spread = 0, dmg = 1, fromPlayer = true) => {

    const from = getFrom();
    const destination = getDestination();

    const randX = k.rand(-spread, spread);
    const randY = k.rand(-spread, spread);
    const dir = vec2(destination.x, destination.y).sub(from).unit();
    let projectile;
    if (fromPlayer) {
        projectile = add([
            sprite(spriteName),
            layer("effects-front"),
            pos(from.x, from.y),
            area(),
            move(vec2(dir.x +randX, dir.y + randY), 900),           
            offscreen({ destroy: true }),
            scale(.5),
            opacity(1),
            lifespan(2),
            anchor('center'),
            "playerProjectile"
        ]
    );
    } else {
        projectile = add([
            sprite(spriteName),
            layer("effects-front"),
            pos(from.x, from.y),
            area(),
            move(vec2(dir.x +randX, dir.y + randY), 900),           
            offscreen({ destroy: true }),
            scale(.5),
            opacity(1),
            lifespan(2),
            anchor('center')
        ], "projectile");
    }
    const shadow = createShadow(projectile, 20, true);
    projectile.shadow = shadow;
    projectile.onDestroy(() => {
    shadow.fadeOut(0.1);
        wait(0.1, () => destroy(shadow));
    });
    return projectile;

}


const initiateBasicAttack = (player) => {
    let attackTimer = 0;
    k.onKeyPress("up", () => playerStats.attackSpeed -= .05 );
    k.onKeyPress("down", () => playerStats.attackSpeed += .05);
    onUpdate(() => {
        attackTimer += dt();
    })
    onMouseDown(() => {
        if (attackTimer > playerStats.attackSpeed) {

            const projectile = spawnProjectile(
            'sampleProjectile',
            () => vec2(player.pos),    
            () => mousePos(),
            .07           
            );
            attackTimer = 0;
        }
    
    });
    
}




const lockProjectile = () => {

}




const spawnEnemy = (enemyName, posX, posY, size = 3, player) => {

    const enemyObject = enemies[enemyName]
    
    const enemy = add(
        [
            sprite(enemyObject.spriteName, { frame: 0 }),
            pos(posX, posY),
            scale(3),
            anchor("center"),
            layer('entities'),
            k.area({
                shape: new k.Rect(...enemyObject.hitbox)
            }),
            body(),
            z(-10),
            {
                health: enemyObject.maxHealth
            },
            'enemy'
        ]
    )
    enemy.onDestroy(() => {
        destroy(shadow);
        destroy(enemyHealthBar);

        if (enemy.aoeCircle) destroy(enemy.aoeCircle);
        if (enemy.attackHitbox) destroy(enemy.attackHitbox);
        levelStats.forestToSpawn += 1;
        console.log('des')
    });
    const enemyHealthBar = add([
        rect(25, 3),
        color(17, 155, 27),
        pos(0, 0),
        scale(3),
        anchor("center"),
        layer('entities'),
        follow(enemy, vec2(0, 70)),
        body(),
        z(-10),
    ])

    let isAttacking = false;
    const shadow = createShadow(enemy, 30, false, 4);

    enemy.onCollide('playerProjectile', (projectile) => {
        const dir = enemy.pos.sub(projectile.pos).unit();
        shake(2);
        projectile.destroy(); // remove bullet

        enemy.move(dir.scale(1500)); // knockback
        enemy.health -= playerStats.attack;
        
        enemyHealthBar.width = (enemy.health/enemyObject.maxHealth) * 25;
        if(enemy.health <= 0) {
            destroy(enemy);
            enemy.isDestroyed = true;
            levelStats.forestDefeated++;

        }
    })
    let canBeHit = true;
    
    onUpdate(() => {
        const toPlayer = player.pos.sub(enemy.pos);
        if (toPlayer.x > 0) {
            enemy.flipX = true;
        } else {
            enemy.flipX = false;
        }
        if (toPlayer.len() > 80 && !isAttacking) {
            if(enemy.curAnim() != enemyObject.walk) {
                enemy.play(enemyObject.walk);
            }
            const dir = toPlayer.unit();
            enemy.move(dir.scale(enemyObject.speed));
        } else if (!enemy.isDestroyed) {
            if (!isAttacking) {
                isAttacking = true;
                enemy.play(enemyObject.attack);

                wait(enemyObject.attackDelay, () => {
                    const aoeCircle = add([
                                            sprite("aoeCircle"), 
                                            pos(enemy.pos.x, enemy.pos.y), 
                                            layer("effects-front"),
                                            anchor('center'),
                                            scale(.8),
                                            opacity(0.15),
                                            offscreen({ destroy: true }),
                                            lifespan(.8),
                                            follow(enemy)
                                        ])
                    const attackHitbox = add([
                        pos(enemy.pos.x, enemy.pos.y +10),
                        rect(120, 120),
                        follow(enemy, vec2(0,0)),
                        area(), 
                        anchor('center'),
                        offscreen({ destroy: true }),
                        lifespan(.5),
                        opacity(0),
                        layer("effects-front"),
                        'attackHitbox'
                    ])
                    enemy.attackHitbox = attackHitbox;
                    enemy.aoeCircle = aoeCircle;
                    attackHitbox.onCollide('player', () => {
                        if (canBeHit) {
                            canBeHit = false;
                            const dir = player.pos.sub(enemy.pos).unit()
                            player.move(dir.scale(playerStats.speed * 10)); // knockback
                            shake(2);
                            playerStats.health -= enemyObject.attackVal;
                            playerStats.speed =90;
                            wait(0.5, () => {
                                playerStats.speed = playerStats.maxSpeed;
                                canBeHit = true;
                            })
                        }
                    })
                })
                wait(enemyObject.attackSpeed, () => {
                    isAttacking = false;
                })
            }
        }
    });

}



// FUNCTION TOOLS

function addWallBoundaries() {
    const WALL = 50;

    add([rect(width(), WALL), pos(0, -WALL), area(), body({ isStatic: true })]);
    add([rect(width(), WALL), pos(0, height()), area(), body({ isStatic: true })]);
    add([rect(WALL, height()), pos(-WALL, 0), area(), body({ isStatic: true })]);
    add([rect(WALL, height()), pos(width(), 0), area(), body({ isStatic: true })]);
}

function setBackgroundImage(spriteName1, spriteName2, spriteName3) { 
    const ambientParticle = add([
        sprite(spriteName3),
        pos(k.center()),
        layer("ui"),
        opacity(.4),
        anchor('center'),
        z(100)
    ]);
    ambientParticle.scale = k.vec2(
        k.width() / 256,
        k.height() / 144
    );
    ambientParticle.play("fall");
    const bgFront = add([
        sprite(spriteName1),
        pos(k.center()),
        layer("background"),
        anchor('center'),
        z(10)
    ]);
    bgFront.scale = k.vec2(
        k.width() / 256,
        k.height() / 144
    );
    const bgBack = add([
        sprite(spriteName2),
        pos(k.center()),
        layer("background"),
        anchor('center'),
        z(1)
    ]);
    bgBack.scale = k.vec2(
        k.width() / (1000),
        k.height() / (500)

    );
}

function addUserInterface() {
    // const statusBackground = add([
    //     rect(64*6, 32*4),
    //     color(255, 223, 164),
    //     area(),
    //     pos(30, 30),
    //     layer("ui"),
    //     opacity(.7),
    //     //rgb(255, 223, 164) ui background color
    //     scale(5/6)
    // ])
    const statusFrame = add([
        sprite('statusFrame'),
        area(),
        pos(30 - 70, 30),
        layer("ui"),
        z(10),
        scale(5)
    ])
    const healthBar = add([
        rect(252, 30),
        color(206, 38, 38),
        pos(122 - 70, 40),
        layer("ui"),
        scale(5/6),
        //rgb(206, 38, 38) health color

    ])
    const manaBar = add([
        rect(252, 30),
        color(58, 92, 241),
        pos(122 - 70, 90),
        layer("ui"),
        scale(5/6),
        //rgb(58, 92, 241) health color

    ])

    const levelProgressBar = add([
        rect(410, 32),
        color(37, 175, 243),
        pos(598, 16),
        layer("ui"),
        scale(5/6),
    ])
    const levelProgressBarFrame = add([
        sprite('progressBar'),
        pos(1536/2, 30),
        anchor("center"),
        layer("ui"),
        scale(3),
    ])
    onKeyPress('m', () => {
        if (healthBar.width < 250) {
            healthBar.width += 250*.05
        }
        if (manaBar.width < 250) {
            manaBar.width += 250*.05
        }
    })
    onKeyPress('n', () => {
        if (healthBar.width > 0) {
            healthBar.width -= 250*.05
        }
        if (manaBar.width > 0) {
            manaBar.width -= 250*.05
        }
    })
    onUpdate(() => {
        healthBar.width = (playerStats.health/playerStats.maxHealth) * 250
        manaBar.width = (playerStats.mana/playerStats.maxMana) * 250
        levelProgressBar.width = 410 - (levelStats.forestDefeated/levelStats.forestTarget) * 410;
        console.log(levelStats.forestDefeated)
    })
}

function handleEnemySpawn(player, stageStats) {
    for (let i = 0; i< 2; i++) {
        if (rand(-1,1)>0){
            spawnEnemy('plant', rand(380,1000), rand(50, 200), 3, player);
        } else {
            spawnEnemy('plant', rand(530,1000), rand(490, 700), 3, player);

        }
    }
    for (let i = 0; i< 2; i++) {
        if (rand(-1,1)>0){
            spawnEnemy('spider', rand(380,1000), rand(50, 200), 3, player);
        } else {
            spawnEnemy('spider', rand(530,1000), rand(490, 700), 3, player);

        }
    }
    onUpdate(() => {
        if (levelStats.forestToSpawn > 0) {
            if (rand(-1,1) > 0) {
                if (rand(-1,1)>0){
                    spawnEnemy('spider', rand(380,1000), rand(50, 200), 3, player);
                } else {
                    spawnEnemy('spider', rand(530,1000), rand(490, 700), 3, player);

                }
            } else {
                if (rand(-1,1)>0){
                    spawnEnemy('plant', rand(380,1000), rand(50, 200), 3, player);
                } else {
                    spawnEnemy('plant', rand(530,1000), rand(490, 700), 3, player);

                }
            }
            levelStats.forestToSpawn -= 1;
        }

    })

}


// forest
k.scene("forest-1", () => {
    addWallBoundaries();
    layers(['background', 'shadow', 'objects', 'effects-back', 'entities', 'effects-front', 'ui'], 'background');
    addUserInterface();
    setBackgroundImage('bg-forest-1', 'bg-forest-base', 'bg-falling-particles')

    const map = [
        'b              a',
        '                ',
        '                ',
        '                ',
        '                ',
        '                ',
        '               h',
        ' e             g',
        'cd             f'
    ];

    const levelConfig = {
        tileWidth: 96,
        tileHeight: 96,
        tiles: {
            "b" : () => [  
                rect(294, 230),
                area(),
                body({ isStatic: true }),
                'wall',
                pos(0, 0),
                opacity(0),
            ],
            "a" : () => [  
                rect(380, 152),
                opacity(0),
                area(),
                body({ isStatic: true }),
                'wall',
                pos(-292, 0),
            ],
            "c" : () => [  
                rect(292, 300),
                opacity(0),
                area(),
                body({ isStatic: true }),
                'wall',
                pos(0, -270),
            ],
            "d" : () => [  
                rect(292, 152),
                opacity(0),
                area(),
                body({ isStatic: true }),
                'wall',
                pos(96, -100),
            ],
            "e" : () => [  
                rect(292, 152),
                opacity(0),
                area(),
                body({ isStatic: true }),
                'wall',
                pos(0, -89),
            ],
            "f" : () => [  
                rect(500, 152),
                opacity(0),
                area(),
                body({ isStatic: true }),
                'wall',
                pos(-388, -99),
            ],
            "g" : () => [  
                rect(500, 152),
                opacity(0),
                area(),
                body({ isStatic: true }),
                'wall',
                pos(-292, -174),
            ],
            "h" : () => [  
                rect(500, 152),
                opacity(0),
                area(),
                body({ isStatic: true }),
                'wall',
                pos(-196, -164),
            ],
            
        }
    };

    addLevel(map, levelConfig);
    const player = spawnPlayer();
    initiateBasicAttack(player);
    debug.inspect = false;
    
    handleEnemySpawn(player);


    onKeyPress(".", () => {
        debug.inspect = !debug.inspect;
    });

})


k.go("forest-1")






