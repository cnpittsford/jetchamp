// ----------------
// BEGIN INIT CODE
// ----------------
// namespace
namespace userconfig {
    export const ARCADE_SCREEN_WIDTH = 240
    export const ARCADE_SCREEN_HEIGHT = 180
}
namespace SpriteKind {
    export let CheckpointLocked = SpriteKind.create()
    export let CheckpointUnlocked = SpriteKind.create()
    export let Indicator = SpriteKind.create()
    export let NoInteractions = SpriteKind.create()
    export let UI = SpriteKind.create()
    export let Bouncer = SpriteKind.create()
    export let Cutscene = SpriteKind.create()
    export let NPC = SpriteKind.create()
    export let Battery = SpriteKind.create()
}
// enum
enum EnemyDirection {
    Up,
    Down,
    Left,
    Right
}
enum SwapTile {
    Red,
    Green
}
enum StoryPoint {
    None,
    Start,
    GameIntro,
    End
}
// const
const PLAYER_GRAV: number = 200
const MAX_WIND_SPEED: number = 150
const WIND_ACCELERATION: number = 8
const WIND_FRICTION: number = 3
const STARS_EFFECT: SpreadEffectData = extraEffects.createCustomSpreadEffectData(
    [13, 11, 12],
    false,
    [1],
    extraEffects.createPercentageRange(100, 100),
    extraEffects.createPercentageRange(100, 100),
    extraEffects.createTimeRange(3000, 4000)
)
const ANTI_STARS_EFFECT: SpreadEffectData = extraEffects.createCustomSpreadEffectData(
    [12, 11, 13],
    false,
    [1],
    extraEffects.createPercentageRange(100, 100),
    extraEffects.createPercentageRange(100, 100),
    extraEffects.createTimeRange(3000, 4000)
)
const FIRE_EFFECT = extraEffects.createCustomSpreadEffectData(
    [2, 4, 5],
    true,
    [4, 6, 8],
    extraEffects.createPercentageRange(50, 100),
    extraEffects.createPercentageRange(50, 100),
    extraEffects.createTimeRange(400, 600),
    0,
    60,
    extraEffects.createPercentageRange(50, 100),
    -60,
    0,
    5000
)
const RAINBOW_EFFECT = extraEffects.createCustomSpreadEffectData(
    [2, 2, 4, 5, 7, 9, 8, 10, 3],
    true,
    [20, 10, 5],
    extraEffects.createPercentageRange(0, 0),
    extraEffects.createPercentageRange(50, 100),
    extraEffects.createTimeRange(400, 600)
)
const CHECKPOINT_EFFECT = extraEffects.createCustomSpreadEffectData(
    [7, 6],
    true,
    [10, 5],
    extraEffects.createPercentageRange(0, 0),
    extraEffects.createPercentageRange(50, 100),
    extraEffects.createTimeRange(400, 600)

)
const HIT_EFFECT = extraEffects.createCustomSpreadEffectData(
    [2, 14],
    true,
    [10, 5],
    extraEffects.createPercentageRange(0, 0),
    extraEffects.createPercentageRange(50, 100),
    extraEffects.createTimeRange(400, 600)

)
const EXPLODE_EFFECT = extraEffects.createCustomSpreadEffectData(
    [5, 4, 2],
    false,
    [40, 30, 20, 5],
    extraEffects.createPercentageRange(0, 0),
    extraEffects.createPercentageRange(30, 100),
    extraEffects.createTimeRange(200, 500)
)
const ELECTRIC_EFFECT = extraEffects.createCustomSpreadEffectData(
    [4, 5, 1],
    false,
    [10, 5, 10, 5],
    extraEffects.createPercentageRange(0, 0),
    extraEffects.createPercentageRange(60, 100),
    extraEffects.createTimeRange(200, 500)
)
// let
let gameStarted: boolean = false
let swapTileActive: SwapTile = SwapTile.Green
let curStoryPoint: StoryPoint = StoryPoint.None
let skipPrompt: TextSprite = textsprite.create("Hold B to skip story.")
let transition = sprites.create(assets.image`invis240x180`, SpriteKind.UI)
let megaphone: Sprite
let levelAnnouncement: Sprite = sprites.create(assets.image`invis`, SpriteKind.UI)
let courseNum = textsprite.create("")
let onScreenThreshold: number = 110
let curSpeedFromWind: number = 0
let voidTiles: Image[] = [assets.tile`void1`, assets.tile`void2`, assets.tile`void3`, assets.tile`void4`, assets.tile`void5`, assets.tile`void6`]
let antivoidTiles: Image[] = [assets.tile`antivoid1`, assets.tile`antivoid2`, assets.tile`antivoid3`, assets.tile`antivoid4`, assets.tile`antivoid5`, assets.tile`antivoid6`]
let level: number = 0
let player: Sprite = null
let verticalSpeedLimit: number = null
let thrustAnim: Sprite = null
let fuel: number = null
let lastFuel: number = null
let lastAPressed: number = null
let fuelCooldownStarted: boolean = null
let fuelCooldownMax: number = null
let fuelCooldown: number = null
let prevRunTime: number = null
let statusbar: StatusBarSprite = null
let spawnPoint: tiles.Location = null
let rain: Sprite = null
let enemyFireCounter: number = 0
// misc
courseNum.setOutline(1, 15)
courseNum.setFlag(SpriteFlag.RelativeToCamera, true)
courseNum.z = 1001
levelAnnouncement.setFlag(SpriteFlag.RelativeToCamera, true)
levelAnnouncement.z = 1000
transition.setFlag(SpriteFlag.RelativeToCamera, true)
transition.z = 9999
skipPrompt.setPosition(175, 7)
skipPrompt.setFlag(SpriteFlag.RelativeToCamera, true)
skipPrompt.z = 999
skipPrompt.setOutline(1, 15)
skipPrompt.setFlag(SpriteFlag.Invisible, true)
game.setDialogCursor(assets.image`a`)
game.setDialogFrame(assets.image`dialogue`)
// class
class MusicController {
    static playMusic: boolean = true
    static theme1: music.Playable[] = [
        music.createSong(assets.song`theme1p1`),
        music.createSong(assets.song`theme1p2`),
        music.createSong(assets.song`theme1p3`),
        music.createSong(assets.song`theme1p4`),
        music.createSong(assets.song`theme1p5`)
    ]
    static theme2: music.Playable[] = [
        music.createSong(assets.song`theme2p1`),
        music.createSong(assets.song`theme2p2`),
        music.createSong(assets.song`theme2p3`),
        music.createSong(assets.song`theme2p4`),
        music.createSong(assets.song`theme2p5`),
        music.createSong(assets.song`theme2p6`)
    ]

    static playTheme1() {
        MusicController.endCurrentMusic()

        timer.after(50, function () {
            MusicController.playMusic = true
            while (MusicController.playMusic) {
                for (let i = 0; i < MusicController.theme1.length; i++) {
                    music.play(MusicController.theme1[i], music.PlaybackMode.UntilDone)
                    if (!MusicController.playMusic) {
                        break
                    }
                }
            }
        })
    }

    static playTheme2() {
        MusicController.endCurrentMusic()


        timer.after(50, function () {
            MusicController.playMusic = true
            while (MusicController.playMusic) {
                for (let i = 0; i < MusicController.theme2.length; i++) {
                    music.play(MusicController.theme2[i], music.PlaybackMode.UntilDone)
                    if (!MusicController.playMusic) break
                }
            }
        })
    }

    static endCurrentMusic() {
        MusicController.playMusic = false
        music.stopAllSounds()
    }

}
// --------------
// END INIT CODE
// --------------

// ------------------------
// BEGIN TITLE SCREEN CODE
// ------------------------
let fadeStarted = false
let logoHovering = false
let bg: Sprite = null
let logo: Sprite = null
let startText: TextSprite = null

bg = sprites.create(assets.image`titleBG`, SpriteKind.NoInteractions)
logo = sprites.create(assets.image`titleLogo`, SpriteKind.NoInteractions)
logo.setPosition(120, -90)
logo.vy = 200
startText = textsprite.create("Press A to start.")
startText.setFlag(SpriteFlag.Invisible, true)
startText.setOutline(1, 15)
startText.setPosition(120, 140)
startText.z = 2
music.play(music.createSong(assets.song`titleFanfare`), music.PlaybackMode.InBackground)

game.onUpdate(function () {
    if (logo && !(logoHovering) && logo.y >= 90 && !(fadeStarted)) {
        logo.vy = 0
        logo.ay = 0
        logoHovering = true
        extraEffects.createSpreadEffectOnAnchor(startText, EXPLODE_EFFECT, 1000, 200, 20)
    }
    if (logo && logoHovering && !(fadeStarted)) {
        logo.y = 90 + Math.sin(game.runtime() / 400) * 4
        startText.setFlag(SpriteFlag.Invisible, false)
    }
})

controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    if (logo && logoHovering) {
        music.play(music.melodyPlayable(music.baDing), music.PlaybackMode.InBackground)
        logoHovering = false
        fadeStarted = true
        color.startFade(color.originalPalette, color.Black, 500)
        timer.after(500, function () {
            sprites.destroy(bg)
            bg = null
            sprites.destroy(logo)
            logo = null
            sprites.destroy(startText)
            startText = null
            timer.background(function() {
                color.startFade(color.Black, color.originalPalette, 500)
            })
            startStory()
        })
    }
})
// ----------------------
// END TITLE SCREEN CODE
// ----------------------

// ----------------------------
// BEGIN LEVEL MANAGEMENT CODE
// ----------------------------
function setupGame() {
    if (player) return

    player = sprites.create(assets.image`playerDef`, SpriteKind.Player)
    player.ay = PLAYER_GRAV
    player.setStayInScreen(true)
    player.z = 1
    player.setFlag(SpriteFlag.Invisible, true)
    scene.cameraFollowSprite(player)
    verticalSpeedLimit = 50

    thrustAnim = sprites.create(assets.image`invis`, SpriteKind.Food)
    thrustAnim.z = 3

    fuel = 100
    lastFuel = 0
    fuelCooldownStarted = false
    fuelCooldownMax = 550;
    fuelCooldown = 0;
    prevRunTime = 0;
    statusbar = statusbars.create(30, 6, 0)
    statusbar.setColor(5, 15)
    statusbar.setBarBorder(1, 15)
    statusbar.value = fuel
    statusbar.setFlag(SpriteFlag.Invisible, true)

    scroller.setCameraScrollingMultipliers(0, .05, 0)
    scroller.setCameraScrollingMultipliers(0, .1, 1)
    scroller.setCameraScrollingMultipliers(0, .2, 2)
    scroller.setCameraScrollingMultipliers(0, .4, 3)
    scroller.scrollBackgroundWithCamera(scroller.CameraScrollMode.OnlyVertical, 0)
    scroller.scrollBackgroundWithCamera(scroller.CameraScrollMode.OnlyVertical, 1)
    scroller.scrollBackgroundWithCamera(scroller.CameraScrollMode.OnlyVertical, 2)
    scroller.scrollBackgroundWithCamera(scroller.CameraScrollMode.OnlyVertical, 3)

    nextLevel()
}
controller.B.onEvent(ControllerButtonEvent.Pressed, function() {
    if (!gameStarted) return
    if (level > 0 && level < 6) {
        music.play(music.tonePlayable(Note.C, music.beat(BeatFraction.Quarter)), music.PlaybackMode.InBackground)
        timer.after(90, function () {
            music.play(music.tonePlayable(Note.G, music.beat(BeatFraction.Quarter)), music.PlaybackMode.InBackground)
        })
    }
    switch (level) {
        case 1:
            game.showLongText(
                "-Hold A to fly.\n" +
                "-Move with the left and right buttons.\n" +
                "-Green arrows show the way.\n" +
                "-Touch red diamonds for checkpoints!\n" +
                "-Watch out, some bad guys can spit out boomerangs!\n" +
                "-Reach the Yellow Bull logo at the top to move on!\n"
                , DialogLayout.Center)
            break
        case 2:
            game.showLongText(
                "-This is not \"cheese\", it's the moon! Who made that mistake...\n" +
                "-Don't touch the red floating spikes!\n" +
                "-Look for low gravity zones!\n" +
                "-Tap A in the low gravity zones to fly higher."
                , DialogLayout.Center)
            break
        case 3:
            game.showLongText(
                "-We weren't supposed to send you here, whoopsie!\n" +
                "-Look for high gravity zones!\n" +
                "-Don't tap A often in high gravity zones.\n" +
                "-Touch the rainbow arrows to teleport up.\n" +
                "-Avoid the bad guys that bounce off walls, they will chomp you!\n"
                , DialogLayout.Center)
            break
        case 4:
            game.showLongText(
                "-Watch out, this thunderstorm has some gimmicks!\n" +
                "-Time your movements with the swapping platforms!\n" +
                "-The wind pushes you super fast, be careful.\n"
                , DialogLayout.Center)
            break
        case 5:
            game.showLongText(
                "-Make it to the end!\n" +
                "-Refresh your fuel by collecting batteries!"
                , DialogLayout.Center)
            break
        default:
            break
    }
    
})
function nextLevel() {
    animation.runImageAnimation(transition, assets.animation`levelTransition`, 50, false)
    music.play(music.createSoundEffect(WaveShape.Triangle, 1, 1040, 255, 0, 500, SoundExpressionEffect.None, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
    timer.after(250, function() {
        music.play(music.melodyPlayable(music.smallCrash), music.PlaybackMode.InBackground)
    })

    timer.after(500, function() {
        music.play(music.createSoundEffect(WaveShape.Triangle, 1040, 1, 255, 0, 500, SoundExpressionEffect.None, InterpolationCurve.Linear), music.PlaybackMode.InBackground)

        curStoryPoint = StoryPoint.None
        clearSprites()
        level += 1

        switch (level) {
            case 1:
                tiles.setCurrentTilemap(tilemap`level1Grassy`)
                tiles.placeOnTile(player, tiles.getTileLocation(7, 94))
                scene.setBackgroundColor(9)
                // make playewr and statusbar visible
                player.setFlag(SpriteFlag.Invisible, false)
                statusbar.setFlag(SpriteFlag.Invisible, false)
                // background layers
                scroller.setLayerImage(0,assets.image`grassyBG`)
                scroller.setLayerImage(1,assets.image`grassyLayer1`)
                scroller.setLayerImage(2,assets.image`grassyLayer2`)
                scroller.setLayerImage(3,assets.image`grassyLayer3`)

                level1Cutscene()
                break
            case 2:
                tiles.setCurrentTilemap(tilemap`level2Moon`)
                tiles.placeOnTile(player, tiles.getTileLocation(7, 94))
                scene.setBackgroundColor(15)
                // remove megaphone
                sprites.destroy(megaphone)
                // background layers
                scroller.setLayerImage(0,assets.image`moonBG`)
                scroller.setLayerImage(1,assets.image`moonLayer1`)
                scroller.setLayerImage(2,assets.image`moonLayer2`)
                scroller.setLayerImage(3,assets.image`moonLayer3`)

                MusicController.playTheme2()
                announceLevelStart()
                break
            case 3:
                tiles.setCurrentTilemap(tilemap`level3Factory`)
                tiles.placeOnTile(player, tiles.getTileLocation(7, 94))
                scene.setBackgroundColor(9)
                // background layers
                scroller.setLayerImage(0,assets.image`grassyBG`)
                scroller.setLayerImage(1,assets.image`factoryLayer1`)
                scroller.setLayerImage(2,assets.image`factoryLayer2`)
                scroller.setLayerImage(3,assets.image`factoryLayer3`)

                MusicController.playTheme1()
                announceLevelStart()
                break
            case 4:
                tiles.setCurrentTilemap(tilemap`level4Thunder`)
                tiles.placeOnTile(player, tiles.getTileLocation(7, 94))
                scene.setBackgroundColor(15)
                // rain
                rain = sprites.create(assets.image`invis`, SpriteKind.NoInteractions)
                animation.runImageAnimation(rain, assets.animation`rain`, 100, true)
                rain.setFlag(SpriteFlag.RelativeToCamera, true)
                rain.setPosition(0,0)
                rain.z = 10
                // background layers
                scroller.setLayerImage(0,assets.image`moonBG`)
                scroller.setLayerImage(1,assets.image`thunderLayer1`)
                scroller.setLayerImage(2,assets.image`thunderLayer2`)
                scroller.setLayerImage(3,assets.image`thunderLayer3`)

                MusicController.playTheme2()
                announceLevelStart()
                break
            case 5:
                tiles.setCurrentTilemap(tilemap`level5Stretch`)
                tiles.placeOnTile(player, tiles.getTileLocation(7, 94))
                scene.setBackgroundColor(9)
                // remove rain
                sprites.destroy(rain)
                // background layers
                scroller.setLayerImage(0,assets.image`stretchBG`)
                scroller.setLayerImage(1,assets.image`stretchLayer1`)
                scroller.setLayerImage(2,assets.image`stretchLayer2`)
                scroller.setLayerImage(3,assets.image`stretchLayer3`)

                MusicController.playTheme1()
                announceLevelStart()
                break
            case 6:
                tiles.setCurrentTilemap(tilemap`empty`)
                scene.setBackgroundColor(15)
                // remove player & status bar
                sprites.destroy(player)
                sprites.destroy(statusbar)
                // background layers
                scroller.setLayerImage(0, assets.image`invis`)
                scroller.setLayerImage(1, assets.image`invis`)
                scroller.setLayerImage(2, assets.image`invis`)
                scroller.setLayerImage(3, assets.image`invis`)

                endStory()
                break
            default:
                console.log('wut')
                break
        }

        if (level < 6) {
            statusbar.setPosition(player.x, player.y - 12)
            spawnPoint = player.tilemapLocation()
            spawnEnemies()
            replaceVoidTiles()
            replaceCheckpointTiles()
            replaceIndicatorTiles()
            replaceSawTiles()
            replaceBatteryTiles()
        }
    })
}
function level1Cutscene() {
    story.cancelAllCutscenes()
    story.startCutscene(function() {
        curStoryPoint = StoryPoint.GameIntro
        skipPrompt.setFlag(SpriteFlag.Invisible, false)

        megaphone = sprites.create(assets.image`invis`, SpriteKind.NPC)
        sprites.setDataString(megaphone, "name", "megaphone")
        megaphone.setPosition(7, 1488)
        timer.background(function () {
            for (let i = 0; i < 10; i++) {
                animation.runImageAnimation(megaphone, assets.animation`megaphone`, 100, false)
                pause(500)
            }
        })
        if (curStoryPoint != StoryPoint.GameIntro) {
            gameStarted = true
            return
        }
        story.printText("HEY! You finally showed up. We started the tryouts a while ago.", 60, 1470)
        timer.background(function () {
            for (let i = 0; i < 10; i++) {
                animation.runImageAnimation(megaphone, assets.animation`megaphone`, 100, false)
                pause(500)
            }
        })
        if (curStoryPoint != StoryPoint.GameIntro) {
            gameStarted = true
            return
        }
        story.printText("You must fly through five jetpack-focused obstacle courses.", 60, 1470)
        timer.background(function () {
            for (let i = 0; i < 10; i++) {
                animation.runImageAnimation(megaphone, assets.animation`megaphone`, 100, false)
                pause(500)
            }
        })
        if (curStoryPoint != StoryPoint.GameIntro) {
            gameStarted = true
            return
        }
        story.printText("To help, we gave all the contestants a journal which can be opened with B.", 60, 1470)
        timer.background(function () {
            for (let i = 0; i < 10; i++) {
                animation.runImageAnimation(megaphone, assets.animation`megaphone`, 100, false)
                pause(500)
            }
        })
        if (curStoryPoint != StoryPoint.GameIntro) {
            gameStarted = true
            return
        }
        story.printText("The tips inside change based on the course you are on, so keep checking it!", 60, 1470)
        timer.background(function () {
            for (let i = 0; i < 10; i++) {
                animation.runImageAnimation(megaphone, assets.animation`megaphone`, 100, false)
                pause(500)
            }
        })
        if (curStoryPoint != StoryPoint.GameIntro) {
            gameStarted = true
            return
        }
        story.printText("If you make it to the end, you earn the title of JetChamp! Now get going!", 60, 1470)
        skipPrompt.setFlag(SpriteFlag.Invisible, true)
        gameStarted = true
        announceLevelStart()
        MusicController.playTheme1()
    })
}
controller.B.onEvent(ControllerButtonEvent.Repeated, function () {
    switch (curStoryPoint) {
        case StoryPoint.Start:
            skipPrompt.setFlag(SpriteFlag.Invisible, true)
            music.stopAllSounds()
            story.cancelCurrentCutscene()
            story.clearAllText()
            setupGame()
            break
        case StoryPoint.GameIntro:
            skipPrompt.setFlag(SpriteFlag.Invisible, true)
            music.stopAllSounds()
            story.cancelCurrentCutscene()
            story.clearAllText()
            animation.stopAnimation(animation.AnimationTypes.All, megaphone)
            if (!gameStarted) announceLevelStart()
            gameStarted = true
            MusicController.playTheme1()
            curStoryPoint = StoryPoint.None
            break
        case StoryPoint.End:
            break
        default:
            console.log("skibid")
            break
    }
})
function startStory() {
    curStoryPoint = StoryPoint.Start

    skipPrompt.setFlag(SpriteFlag.Invisible, false)


    story.startCutscene(function () {
        let backgroundInfo1 = textsprite.create("In the year 2XXX where")
        backgroundInfo1.setPosition(120, 85)
        let backgroundInfo2 = textsprite.create("calculator droids rule the world...")
        backgroundInfo2.setPosition(120, 95)

        pause(3000)
        if (curStoryPoint != StoryPoint.Start) {
            sprites.destroy(backgroundInfo1)
            sprites.destroy(backgroundInfo2)
            return
        }
        color.startFade(color.originalPalette, color.Black, 500)
        pause(500)
        sprites.destroy(backgroundInfo1)
        sprites.destroy(backgroundInfo2)
        color.startFade(color.Black, color.originalPalette, 500)
        if (curStoryPoint != StoryPoint.Start) return

        music.play(music.createSong(assets.song`storyMusic`), music.PlaybackMode.LoopingInBackground)
        let startShot1 = sprites.create(assets.image`startShot1`, SpriteKind.Cutscene)
        startShot1.setPosition(120, 122)
        story.spriteMoveToLocation(startShot1, 120, 60, 25)

        if (curStoryPoint != StoryPoint.Start) {
            sprites.destroy(startShot1)
            return
        }
        pause(500)
        if (curStoryPoint != StoryPoint.Start) {
            sprites.destroy(startShot1)
            return
        }
        color.startFade(color.originalPalette, color.Black, 500)
        pause(500)
        sprites.destroy(startShot1)
        color.startFade(color.Black, color.originalPalette, 500)
        if (curStoryPoint != StoryPoint.Start) return

        let startShot2 = sprites.create(assets.image`invis`, SpriteKind.Cutscene)
        animation.runImageAnimation(startShot2, assets.animation`startShot2`, 300, false)
        startShot2.scale = 2
        timer.after(50, function() {
            startShot2.setPosition(120, 90) 
        }) // using delay because animation doesnt work well with setting position
        story.printText("This just in, some breaking news!", 120, 140)
        if (curStoryPoint != StoryPoint.Start) return
        story.printText("Energy drink maker Yellow Bull is looking for a new stunt artist.", 120, 140)
        if (curStoryPoint != StoryPoint.Start) return
        story.printText("The best jetpack user they find will be given the title of JetChamp.", 120, 140)
        if (curStoryPoint != StoryPoint.Start) return
        story.printText("Do you have what it takes? Sign up free online!", 120, 140)
        
        if (curStoryPoint != StoryPoint.Start) {
            sprites.destroy(startShot2)
            return
        }
        pause(500)
        if (curStoryPoint != StoryPoint.Start) {
            sprites.destroy(startShot2)
            return
        }
        color.startFade(color.originalPalette, color.Black, 500)
        pause(500)
        sprites.destroy(startShot2)
        color.startFade(color.Black, color.originalPalette, 500)
        if (curStoryPoint != StoryPoint.Start) return

        let startShot3 = sprites.create(assets.image`startShot3`, SpriteKind.Cutscene)
        startShot3.setPosition(120, 60)
        story.spriteMoveToLocation(startShot3, 120, 122, 25)
        pause(500)

        if (curStoryPoint != StoryPoint.Start) {
            sprites.destroy(startShot3)
            return
        }
        story.showPlayerChoices("Sign up", "Go to bed")
        let answer = story.getLastAnswer()

        if (curStoryPoint != StoryPoint.Start) {
            sprites.destroy(startShot3)
            return
        }
        pause(500)
        if (curStoryPoint != StoryPoint.Start) {
            sprites.destroy(startShot3)
            return
        }
        color.startFade(color.originalPalette, color.Black, 500)
        pause(500)
        sprites.destroy(startShot3)
        color.startFade(color.Black, color.originalPalette, 500)
        if (curStoryPoint != StoryPoint.Start) return

        if (answer == "Go to bed") {
            curStoryPoint = StoryPoint.None
            let lossText1 = textsprite.create("You... decided to go to bed.")
            lossText1.setPosition(120, 85)
            let lossText2 = textsprite.create("After, you forgot about JetChamp.")
            lossText2.setPosition(120, 95)
            pause(5000)
            music.stopAllSounds()
            game.gameOver(false)
        }

        let transitionText1 = textsprite.create("You signed up on their website.")
        transitionText1.setPosition(120, 85)
        let transitionText2 = textsprite.create("They sent out the meetup location.")
        transitionText2.setPosition(120, 95)
        pause(5000)
        
        music.stopAllSounds()
        sprites.destroy(transitionText1)
        sprites.destroy(transitionText2)
        setupGame()
    })
}
function endStory() {
    curStoryPoint = StoryPoint.End
    gameStarted = false
    MusicController.endCurrentMusic()

    timer.after(50, function() {
        music.play(music.createSong(assets.song`endFanfare`), music.PlaybackMode.InBackground)
    })
    let endText1 = textsprite.create("You did it! You are the JetChamp!")
    endText1.setPosition(120, 85)
    endText1.setFlag(SpriteFlag.RelativeToCamera, true)
    let endText2 = textsprite.create("Yellow Bull even gave you a trophy!!")
    endText2.setPosition(120, 95)
    endText2.setFlag(SpriteFlag.RelativeToCamera, true)
    pause(5000)

    let totalSec = game.runtime() / 1000
    let timeInMin = Math.floor(totalSec / 60)
    let timeInSec = Math.roundWithPrecision(totalSec % 60, 2)
    game.setGameOverMessage(true, "YOU WIN! Time: " + timeInMin + "min " + timeInSec + "sec")
    game.gameOver(true)
}
game.onUpdate(function() {
    if (rain) rain.setPosition(120, 90)
})

scene.onOverlapTile(SpriteKind.Player, assets.tile`levelupPortal`, function(sprite: Sprite, location: tiles.Location) {
    nextLevel()

    tiles.setTileAt(location, assets.tile`white`)
    timer.after(50, function() {
        tiles.setTileAt(location, assets.tile`empty`)
    })
})



function clearSprites() {
    sprites.destroyAllSpritesOfKind(SpriteKind.Enemy)
    sprites.destroyAllSpritesOfKind(SpriteKind.Projectile)
    sprites.destroyAllSpritesOfKind(SpriteKind.Bouncer)
    sprites.destroyAllSpritesOfKind(SpriteKind.CheckpointLocked)
    sprites.destroyAllSpritesOfKind(SpriteKind.CheckpointUnlocked)
    sprites.destroyAllSpritesOfKind(SpriteKind.Indicator)
    sprites.destroyAllSpritesOfKind(SpriteKind.NoInteractions)
    sprites.destroyAllSpritesOfKind(SpriteKind.NPC)
    sprites.destroyAllSpritesOfKind(SpriteKind.Battery)
}

function spawnEnemies() {
    // air tiles
    for (let loc of tiles.getTilesByType(assets.tile`airEnemyUp`)) {
        let newEnemy = sprites.create(assets.image`invis`, SpriteKind.Enemy)
        newEnemy.z = 2
        animation.runImageAnimation(newEnemy, assets.animation`enemyUp`, 50, false)
        sprites.setDataNumber(newEnemy, "Direction", EnemyDirection.Up)
        tiles.placeOnTile(newEnemy, loc)
        tiles.setTileAt(loc, assets.tile`empty`)
    }
    for (let loc of tiles.getTilesByType(assets.tile`airEnemyDown`)) {
        let newEnemy = sprites.create(assets.image`invis`, SpriteKind.Enemy)
        newEnemy.z = 2
        animation.runImageAnimation(newEnemy, assets.animation`enemyDown`, 50, false)
        sprites.setDataNumber(newEnemy, "Direction", EnemyDirection.Down)
        tiles.placeOnTile(newEnemy, loc)
        tiles.setTileAt(loc, assets.tile`empty`)
    }
    for (let loc of tiles.getTilesByType(assets.tile`airEnemyLeft`)) {
        let newEnemy = sprites.create(assets.image`invis`, SpriteKind.Enemy)
        newEnemy.z = 2
        animation.runImageAnimation(newEnemy, assets.animation`enemyLeft`, 50, false)
        sprites.setDataNumber(newEnemy, "Direction", EnemyDirection.Left)
        tiles.placeOnTile(newEnemy, loc)
        tiles.setTileAt(loc, assets.tile`empty`)
    }
    for (let loc of tiles.getTilesByType(assets.tile`airEnemyRight`)) {
        let newEnemy = sprites.create(assets.image`invis`, SpriteKind.Enemy)
        newEnemy.z = 2
        animation.runImageAnimation(newEnemy, assets.animation`enemyRight`, 50, false)
        sprites.setDataNumber(newEnemy, "Direction", EnemyDirection.Right)
        tiles.placeOnTile(newEnemy, loc)
        tiles.setTileAt(loc, assets.tile`empty`)
    }
    for (let loc of tiles.getTilesByType(assets.tile`airBouncer`)) {
        let newEnemy = sprites.create(assets.image`invis`, SpriteKind.Bouncer)
        newEnemy.z = 3
        animation.runImageAnimation(newEnemy, assets.animation`bouncer`, 50, true)
        tiles.placeOnTile(newEnemy, loc)
        tiles.setTileAt(loc, assets.tile`empty`)
    }

    // void tiles
    for (let loc of tiles.getTilesByType(assets.tile`voidEnemyUp`)) {
        let newEnemy = sprites.create(assets.image`invis`, SpriteKind.Enemy)
        newEnemy.z = 2
        animation.runImageAnimation(newEnemy, assets.animation`enemyUp`, 50, false)
        sprites.setDataNumber(newEnemy, "Direction", EnemyDirection.Up)
        tiles.placeOnTile(newEnemy, loc)
        tiles.setTileAt(loc, Math.pickRandom(voidTiles))
    }
    for (let loc of tiles.getTilesByType(assets.tile`voidEnemyDown`)) {
        let newEnemy = sprites.create(assets.image`invis`, SpriteKind.Enemy)
        newEnemy.z = 2
        animation.runImageAnimation(newEnemy, assets.animation`enemyDown`, 50, false)
        sprites.setDataNumber(newEnemy, "Direction", EnemyDirection.Down)
        tiles.placeOnTile(newEnemy, loc)
        tiles.setTileAt(loc, Math.pickRandom(voidTiles))
    }
    for (let loc of tiles.getTilesByType(assets.tile`voidEnemyLeft`)) {
        let newEnemy = sprites.create(assets.image`invis`, SpriteKind.Enemy)
        newEnemy.z = 2
        animation.runImageAnimation(newEnemy, assets.animation`enemyLeft`, 50, false)
        sprites.setDataNumber(newEnemy, "Direction", EnemyDirection.Left)
        tiles.placeOnTile(newEnemy, loc)
        tiles.setTileAt(loc, Math.pickRandom(voidTiles))
    }
    for (let loc of tiles.getTilesByType(assets.tile`voidEnemyRight`)) {
        let newEnemy = sprites.create(assets.image`invis`, SpriteKind.Enemy)
        newEnemy.z = 2
        animation.runImageAnimation(newEnemy, assets.animation`enemyRight`, 50, false)
        sprites.setDataNumber(newEnemy, "Direction", EnemyDirection.Right)
        tiles.placeOnTile(newEnemy, loc)
        tiles.setTileAt(loc, Math.pickRandom(voidTiles))
    }
    for (let loc of tiles.getTilesByType(assets.tile`voidBouncer`)) {
        let newEnemy = sprites.create(assets.image`invis`, SpriteKind.Bouncer)
        newEnemy.z = 3
        animation.runImageAnimation(newEnemy, assets.animation`bouncer`, 50, true)
        tiles.placeOnTile(newEnemy, loc)
        tiles.setTileAt(loc, Math.pickRandom(voidTiles))
    }

    // antivoid tiles
    for (let loc of tiles.getTilesByType(assets.tile`antivoidEnemyUp`)) {
        let newEnemy = sprites.create(assets.image`invis`, SpriteKind.Enemy)
        newEnemy.z = 2
        animation.runImageAnimation(newEnemy, assets.animation`enemyUp`, 50, false)
        sprites.setDataNumber(newEnemy, "Direction", EnemyDirection.Up)
        tiles.placeOnTile(newEnemy, loc)
        tiles.setTileAt(loc, Math.pickRandom(antivoidTiles))
    }
    for (let loc of tiles.getTilesByType(assets.tile`antivoidEnemyDown`)) {
        let newEnemy = sprites.create(assets.image`invis`, SpriteKind.Enemy)
        newEnemy.z = 2
        animation.runImageAnimation(newEnemy, assets.animation`enemyDown`, 50, false)
        sprites.setDataNumber(newEnemy, "Direction", EnemyDirection.Down)
        tiles.placeOnTile(newEnemy, loc)
        tiles.setTileAt(loc, Math.pickRandom(antivoidTiles))
    }
    for (let loc of tiles.getTilesByType(assets.tile`antivoidEnemyLeft`)) {
        let newEnemy = sprites.create(assets.image`invis`, SpriteKind.Enemy)
        newEnemy.z = 2
        animation.runImageAnimation(newEnemy, assets.animation`enemyLeft`, 50, false)
        sprites.setDataNumber(newEnemy, "Direction", EnemyDirection.Left)
        tiles.placeOnTile(newEnemy, loc)
        tiles.setTileAt(loc, Math.pickRandom(antivoidTiles))
    }
    for (let loc of tiles.getTilesByType(assets.tile`antivoidEnemyRight`)) {
        let newEnemy = sprites.create(assets.image`invis`, SpriteKind.Enemy)
        newEnemy.z = 2
        animation.runImageAnimation(newEnemy, assets.animation`enemyRight`, 50, false)
        sprites.setDataNumber(newEnemy, "Direction", EnemyDirection.Right)
        tiles.placeOnTile(newEnemy, loc)
        tiles.setTileAt(loc, Math.pickRandom(antivoidTiles))
    }
    for (let loc of tiles.getTilesByType(assets.tile`antivoidBouncer`)) {
        let newEnemy = sprites.create(assets.image`invis`, SpriteKind.Bouncer)
        newEnemy.z = 3
        animation.runImageAnimation(newEnemy, assets.animation`bouncer`, 50, true)
        tiles.placeOnTile(newEnemy, loc)
        tiles.setTileAt(loc, Math.pickRandom(antivoidTiles))
    }
}

function replaceVoidTiles() {
    for (let loc of tiles.getTilesByType(assets.tile`void`)) {
        tiles.setTileAt(loc, Math.pickRandom(voidTiles))
    }
    for (let loc of tiles.getTilesByType(assets.tile`antivoid`)) {
        tiles.setTileAt(loc, Math.pickRandom(antivoidTiles))
    }
}

function replaceCheckpointTiles() {
    for (let loc of tiles.getTilesByType(assets.tile`airCheckpoint`)) {
        let newCheckpoint = sprites.create(assets.image`invis`, SpriteKind.CheckpointLocked)
        newCheckpoint.z = 1
        animation.runImageAnimation(newCheckpoint, assets.animation`checkpointLocked`, 500, true)
        tiles.placeOnTile(newCheckpoint, loc)

        tiles.setTileAt(loc, assets.tile`empty`)
    }
    for (let loc of tiles.getTilesByType(assets.tile`voidCheckpoint`)) {
        let newCheckpoint = sprites.create(assets.image`invis`, SpriteKind.CheckpointLocked)
        newCheckpoint.z = 1
        animation.runImageAnimation(newCheckpoint, assets.animation`checkpointLocked`, 500, true)
        tiles.placeOnTile(newCheckpoint, loc)

        tiles.setTileAt(loc, Math.pickRandom(voidTiles))
    }
    for (let loc of tiles.getTilesByType(assets.tile`antivoidCheckpoint`)) {
        let newCheckpoint = sprites.create(assets.image`invis`, SpriteKind.CheckpointLocked)
        newCheckpoint.z = 1
        animation.runImageAnimation(newCheckpoint, assets.animation`checkpointLocked`, 500, true)
        tiles.placeOnTile(newCheckpoint, loc)

        tiles.setTileAt(loc, Math.pickRandom(antivoidTiles))
    }
}

function replaceIndicatorTiles() {
    for (let loc of tiles.getTilesByType(assets.tile`leavesIndicator`)) {
        let newCheckpoint = sprites.create(assets.image`invis`, SpriteKind.Indicator)
        animation.runImageAnimation(newCheckpoint, assets.animation`indicatorDown`, 200, true)
        tiles.placeOnTile(newCheckpoint, loc)

        tiles.setTileAt(loc, assets.tile`leaves`)
    }
    for (let loc of tiles.getTilesByType(assets.tile`airIndicator`)) {
        let newCheckpoint = sprites.create(assets.image`invis`, SpriteKind.Indicator)
        animation.runImageAnimation(newCheckpoint, assets.animation`indicatorDown`, 200, true)
        tiles.placeOnTile(newCheckpoint, loc)

        tiles.setTileAt(loc, assets.tile`empty`)
    }
    for (let loc of tiles.getTilesByType(assets.tile`voidIndicator`)) {
        let newCheckpoint = sprites.create(assets.image`invis`, SpriteKind.Indicator)
        animation.runImageAnimation(newCheckpoint, assets.animation`indicatorDown`, 200, true)
        tiles.placeOnTile(newCheckpoint, loc)

        tiles.setTileAt(loc, Math.pickRandom(voidTiles))
    }
    for (let loc of tiles.getTilesByType(assets.tile`antivoidIndicator`)) {
        let newCheckpoint = sprites.create(assets.image`invis`, SpriteKind.Indicator)
        animation.runImageAnimation(newCheckpoint, assets.animation`indicatorDown`, 200, true)
        tiles.placeOnTile(newCheckpoint, loc)

        tiles.setTileAt(loc, Math.pickRandom(antivoidTiles))
    }
}

function replaceSawTiles() {
    for (let loc of tiles.getTilesByType(assets.tile`airSaw`)) {
        let newSaw = sprites.create(assets.image`invis`, SpriteKind.Projectile)
        newSaw.z = 1
        animation.runImageAnimation(newSaw, assets.animation`saw`, 100, true)
        tiles.placeOnTile(newSaw, loc)

        tiles.setTileAt(loc, assets.tile`empty`)
    }

    for (let loc of tiles.getTilesByType(assets.tile`voidSaw`)) {
        let newSaw = sprites.create(assets.image`invis`, SpriteKind.Projectile)
        newSaw.z = 1
        animation.runImageAnimation(newSaw, assets.animation`saw`, 100, true)
        tiles.placeOnTile(newSaw, loc)

        tiles.setTileAt(loc, Math.pickRandom(voidTiles))
    }
    for (let loc of tiles.getTilesByType(assets.tile`antivoidSaw`)) {
        let newSaw = sprites.create(assets.image`invis`, SpriteKind.Projectile)
        newSaw.z = 1
        animation.runImageAnimation(newSaw, assets.animation`saw`, 100, true)
        tiles.placeOnTile(newSaw, loc)

        tiles.setTileAt(loc, Math.pickRandom(antivoidTiles))
    }
}

function replaceBatteryTiles() {
    for (let loc of tiles.getTilesByType(assets.tile`airBattery`)) {
        let newBattery = sprites.create(assets.image`invis`, SpriteKind.Battery)
        newBattery.z = 1
        animation.runImageAnimation(newBattery, assets.animation`battery`, 400, true)
        tiles.placeOnTile(newBattery, loc)

        tiles.setTileAt(loc, assets.tile`empty`)
    }

    for (let loc of tiles.getTilesByType(assets.tile`voidBattery`)) {
        let newBattery = sprites.create(assets.image`invis`, SpriteKind.Battery)
        newBattery.z = 1
        animation.runImageAnimation(newBattery, assets.animation`battery`, 400, true)
        tiles.placeOnTile(newBattery, loc)

        tiles.setTileAt(loc, Math.pickRandom(voidTiles))
    }
    for (let loc of tiles.getTilesByType(assets.tile`antivoidBattery`)) {
        let newBattery = sprites.create(assets.image`invis`, SpriteKind.Battery)
        newBattery.z = 1
        animation.runImageAnimation(newBattery, assets.animation`battery`, 400, true)
        tiles.placeOnTile(newBattery, loc)

        tiles.setTileAt(loc, Math.pickRandom(antivoidTiles))
    }
}

function announceLevelStart() {
    switch (level) {
        case 1:
            levelAnnouncement.setImage(assets.image`level1Announcement`)
            courseNum.setText("Course #1 of 5")
            break
        case 2:
            levelAnnouncement.setImage(assets.image`level2Announcement`)
            courseNum.setText("Course #2 of 5")
            break
        case 3:
            levelAnnouncement.setImage(assets.image`level3Announcement`)
            courseNum.setText("Course #3 of 5")
            break
        case 4:
            levelAnnouncement.setImage(assets.image`level4Announcement`)
            courseNum.setText("Course #4 of 5")
            break
        case 5:
            levelAnnouncement.setImage(assets.image`level5Announcement`)
            courseNum.setText("Course #5 of 5")
            break
        default:
            console.log('no level to announce')
            break
    }
    levelAnnouncement.setPosition(120, 45)
    levelAnnouncement.vy = -3
    courseNum.setPosition(120, 75)
    courseNum.vy = -3

    timer.after(3000, function() {
        levelAnnouncement.setImage(assets.image`invis`)
        courseNum.setText("")
    })
}
// --------------------------
// END LEVEL MANAGEMENT CODE
// --------------------------

// ---------------------
// BEGIN SWAP TILE CODE
// ---------------------
game.onUpdateInterval(2000, function() {
    if (!gameStarted) return
    if (level < 4) return // swap tiles only appear on level 4 and 5

    let swapTilesOnScreen: boolean = false

    if (swapTileActive == SwapTile.Green) {
        for (let loc of tiles.getTilesByType(assets.tile`redOff`)) {
            tiles.setTileAt(loc, assets.tile`redOn`)
            tiles.setWallAt(loc, true)
            if (!swapTilesOnScreen && Math.abs(loc.row * 16 - player.y) < onScreenThreshold) {
                swapTilesOnScreen = true
            }
        }
        for (let loc of tiles.getTilesByType(assets.tile`greenOn`)) {
            tiles.setTileAt(loc, assets.tile`greenOff`)
            tiles.setWallAt(loc, false)
            if (!swapTilesOnScreen && Math.abs(loc.row * 16 - player.y) < onScreenThreshold) {
                swapTilesOnScreen = true
            }
        }
        swapTileActive = SwapTile.Red
    }
    else if (swapTileActive == SwapTile.Red) {
        for (let loc of tiles.getTilesByType(assets.tile`greenOff`)) {
            tiles.setTileAt(loc, assets.tile`greenOn`)
            tiles.setWallAt(loc, true)
            if (!swapTilesOnScreen && Math.abs(loc.row * 16 - player.y) < onScreenThreshold) {
                swapTilesOnScreen = true
            }
        }
        for (let loc of tiles.getTilesByType(assets.tile`redOn`)) {
            tiles.setTileAt(loc, assets.tile`redOff`)
            tiles.setWallAt(loc, false)
            if (!swapTilesOnScreen && Math.abs(loc.row * 16 - player.y) < onScreenThreshold) {
                swapTilesOnScreen = true
            }
        }
        swapTileActive = SwapTile.Green
    }

    if (swapTilesOnScreen) {
        music.play(music.createSoundEffect(WaveShape.Noise, 5000, 0, 255, 0, 300, SoundExpressionEffect.None, InterpolationCurve.Logarithmic), music.PlaybackMode.InBackground)
    }
})
// -------------------
// END TILE SWAP CODE
// -------------------


// -----------------
// BEGIN EVENT CODE
// -----------------
sprites.onOverlap(SpriteKind.Player, SpriteKind.NPC, function(sprite: Sprite, otherSprite: Sprite) {
    switch (sprites.readDataString(otherSprite, "name")) {
        case "megaphone":
            timer.background(function () {
                for (let i = 0; i < 5; i++) {
                    animation.runImageAnimation(otherSprite, assets.animation`megaphone`, 100, false)
                    pause(500)
                }
            })
            story.printText("What are you waiting for?", 60, 1470)
            break
        default:
            console.log("impossiburger")
            break
    }
})
scene.onHitWall(SpriteKind.Player, function (sprite, location) {
    if (sprite.isHittingTile(CollisionDirection.Top) || sprite.isHittingTile(CollisionDirection.Bottom)) {
        sprite.vy = 0
    }
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.Projectile, function(sprite: Sprite, otherSprite: Sprite) {
    resetPlayer()
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.Bouncer, function (sprite: Sprite, otherSprite: Sprite) {
    resetPlayer()
})
scene.onOverlapTile(SpriteKind.Player, assets.tile`tpUpPortal`, function (sprite: Sprite, location: tiles.Location) {
    tiles.placeOnTile(sprite, tiles.getTileLocation(location.col, location.row - 2))
    extraEffects.createSpreadEffectAt(RAINBOW_EFFECT, player.x, player.y, 500, 32, 50)
    music.play(music.melodyPlayable(music.pewPew), music.PlaybackMode.InBackground)

    tiles.setTileAt(location, assets.tile`white`)
    timer.after(100, function () {
        tiles.setTileAt(location, assets.tile`tpUpPortal`)
    })
})
function resetPlayer() {
    tiles.placeOnTile(player, spawnPoint)
    extraEffects.createSpreadEffectAt(HIT_EFFECT, player.x, player.y, 500, 32, 50)
    curSpeedFromWind = 0
    player.vx = 0
    player.vy = 0
    music.play(music.melodyPlayable(music.zapped), music.PlaybackMode.InBackground)
}
sprites.onOverlap(SpriteKind.Player, SpriteKind.Battery, function (sprite: Sprite, otherSprite: Sprite) {
    fuel += 30
    statusbar.value = fuel
    music.play(music.createSoundEffect(WaveShape.Sawtooth, 820, 1, 255, 0, 200, SoundExpressionEffect.None, InterpolationCurve.Curve), music.PlaybackMode.InBackground)
    extraEffects.createSpreadEffectOnAnchor(otherSprite, ELECTRIC_EFFECT, 500, 50, 20)


    // destroy then respawn battery
    let batteryLoc = otherSprite.tilemapLocation()
    sprites.destroy(otherSprite)
    timer.after(4000, function() {
        let newBattery = sprites.create(assets.image`invis`, SpriteKind.Battery)
        newBattery.z = 1
        animation.runImageAnimation(newBattery, assets.animation`battery`, 400, true)
        tiles.placeOnTile(newBattery, batteryLoc)
        extraEffects.createSpreadEffectOnAnchor(newBattery, ELECTRIC_EFFECT, 500, 50, 20)
        music.play(music.createSoundEffect(WaveShape.Sawtooth, 1, 820, 255, 0, 200, SoundExpressionEffect.None, InterpolationCurve.Curve), music.PlaybackMode.InBackground)
    })
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.CheckpointLocked, function(sprite: Sprite, otherSprite: Sprite) {
    // set this one to be "unlocked"
    animation.runImageAnimation(otherSprite, assets.animation`checkpointUnlocked`, 500, true)
    otherSprite.setKind(SpriteKind.CheckpointUnlocked)
    spawnPoint = otherSprite.tilemapLocation()
    extraEffects.createSpreadEffectAt(CHECKPOINT_EFFECT, otherSprite.x, otherSprite.y, 500, 32, 50)
    music.play(music.melodyPlayable(music.magicWand), music.PlaybackMode.InBackground)

    // set all other checkpoints to be locked
    for (let unlockedCheckpoint of sprites.allOfKind(SpriteKind.CheckpointUnlocked)) {
        if (unlockedCheckpoint == otherSprite) continue
        animation.runImageAnimation(unlockedCheckpoint, assets.animation`checkpointLocked`, 500, true)
        unlockedCheckpoint.setKind(SpriteKind.CheckpointLocked)
    }
})
sprites.onCreated(SpriteKind.Bouncer, function(sprite: Sprite) {
    sprite.setBounceOnWall(true)
    let vx = Math.percentChance(50) ? 50 : -50
    let vy = Math.percentChance(50) ? 50 : -50
    sprite.setVelocity(vx, vy)
})
scene.onHitWall(SpriteKind.Bouncer, function (sprite, location) {
    if (Math.abs(sprite.y - player.y) < onScreenThreshold) {
        music.play(music.createSoundEffect(WaveShape.Noise, 2975, 1658, 255, 0, 200, SoundExpressionEffect.Vibrato, InterpolationCurve.Logarithmic), music.PlaybackMode.InBackground)
    }
})
// ---------------
// END EVENT CODE
// ---------------

// -----------------
// BEGIN ENEMY CODE
// -----------------
game.onUpdateInterval(1000, function() {
    
    let enemyOnScreen: boolean = false
    // Determine which enemy fires based on the enemy counter
    switch (enemyFireCounter) {
        case 0:
            for (let enemy of sprites.allOfKind(SpriteKind.Enemy)) {
                if (sprites.readDataNumber(enemy, "Direction") == EnemyDirection.Up) {
                    enemyFire(enemy, EnemyDirection.Up)
                    if (!enemyOnScreen && Math.abs(enemy.y - player.y) < onScreenThreshold) {
                        enemyOnScreen = true
                    }
                } 
            }   
            break
        case 1:
            for (let enemy of sprites.allOfKind(SpriteKind.Enemy)) {
                if (sprites.readDataNumber(enemy, "Direction") == EnemyDirection.Right) {
                    enemyFire(enemy, EnemyDirection.Right)
                    if (!enemyOnScreen && Math.abs(enemy.y - player.y) < onScreenThreshold) {
                        enemyOnScreen = true
                    }
                }
            }
            break
        case 2:
            for (let enemy of sprites.allOfKind(SpriteKind.Enemy)) {
                if (sprites.readDataNumber(enemy, "Direction") == EnemyDirection.Down) {
                    enemyFire(enemy, EnemyDirection.Down)
                    if (!enemyOnScreen && Math.abs(enemy.y - player.y) < onScreenThreshold) {
                        enemyOnScreen = true
                    }
                }
            }
            break
        case 3:
            for (let enemy of sprites.allOfKind(SpriteKind.Enemy)) {
                if (sprites.readDataNumber(enemy, "Direction") == EnemyDirection.Left) {
                    enemyFire(enemy, EnemyDirection.Left)
                    if (!enemyOnScreen && Math.abs(enemy.y - player.y) < onScreenThreshold) {
                        enemyOnScreen = true
                    }
                }
            }
            enemyFireCounter -= 4
            break
    }
    enemyFireCounter += 1

    if (enemyOnScreen) {
        music.play(music.createSoundEffect(WaveShape.Square, 2975, 1658, 255, 0, 100, SoundExpressionEffect.Vibrato, InterpolationCurve.Logarithmic), music.PlaybackMode.InBackground)
    }
})

function enemyFire(enemy: Sprite, dir: EnemyDirection) {
    let boomerang = sprites.create(assets.image`invis`, SpriteKind.Projectile)
    boomerang.z = 1
    boomerang.setFlag(SpriteFlag.GhostThroughWalls, true)
    animation.runImageAnimation(boomerang, assets.animation`boomerang`, 50, true)

    let horizontal: boolean
    let speed: number = 100
    switch (dir) {
        case EnemyDirection.Up:
            animation.runImageAnimation(enemy, assets.animation`enemyUp`, 200, false)
            boomerang.setPosition(enemy.x + 3, enemy.y)
            horizontal = false
            speed *= -1
            break
        case EnemyDirection.Right:
            animation.runImageAnimation(enemy, assets.animation`enemyRight`, 200, false)
            boomerang.setPosition(enemy.x, enemy.y + 4)
            horizontal = true
            break
        case EnemyDirection.Down:
            animation.runImageAnimation(enemy, assets.animation`enemyDown`, 200, false)
            boomerang.setPosition(enemy.x + 3, enemy.y)
            horizontal = false
            break
        case EnemyDirection.Left:
            animation.runImageAnimation(enemy, assets.animation`enemyLeft`, 200, false)
            boomerang.setPosition(enemy.x, enemy.y + 4)
            horizontal = true
            speed *= -1
            break
    }

    if (horizontal) {
        boomerang.vx = speed
        boomerang.ax = -speed
    }
    else {
        boomerang.vy = speed
        boomerang.ay = -speed
    }

    boomerang.lifespan = 2000
}
// ---------------
// END ENEMY CODE
// ---------------

// -------------------------
// BEGIN EXTRA VISUALS CODE
// -------------------------
function startPlayerFlyVisuals() {
    if (thrustAnim.image.equals(assets.image`invis`)) {
        animation.runImageAnimation(
            thrustAnim,
            assets.animation`flyEffect`,
            50,
            true
        )
        player.setImage(assets.image`playerFly`)
    }
}

// resets player's visuals to default
function stopPlayerFlyVisuals() {
    animation.stopAnimation(animation.AnimationTypes.All, thrustAnim)
    thrustAnim.setImage(assets.image`invis`)
    player.setImage(assets.image`playerDef`)
}

// stars in void tiles
game.onUpdateInterval(1000, function () {
    if (!gameStarted) return

    for (let voidTile of voidTiles) {
        for (let value of tiles.getTilesByType(voidTile)) {
            // only spawn 20% of the time
            if (!Math.percentChance(20)) continue
            
            let tileCenterX: number = value.column * 16 + 8
            let tileCenterY: number = value.row * 16 + 8
            // 120px vertical distance to player to spawn particles
            if (Math.abs(tileCenterY - player.y) < onScreenThreshold)
                extraEffects.createSpreadEffectAt(STARS_EFFECT, tileCenterX, tileCenterY, 1, 8, 1)
        }
    }
    for (let antivoidTile of antivoidTiles) {
        for (let value of tiles.getTilesByType(antivoidTile)) {
            // only spawn 20% of the time
            if (!Math.percentChance(20)) continue

            let tileCenterX: number = value.column * 16 + 8
            let tileCenterY: number = value.row * 16 + 8
            // 120px vertical distance to player to spawn particles
            if (Math.abs(tileCenterY - player.y) < onScreenThreshold)
                extraEffects.createSpreadEffectAt(ANTI_STARS_EFFECT, tileCenterX, tileCenterY, 1, 8, 1)
        }
    }
})

game.onUpdate(function () {
    if (!statusbar) return
    
    // flash to green once fuel becomes full
    if (fuel >= 100 && lastFuel < 100) {
        statusbar.setColor(1, 15)
        timer.after(50, function () {
            statusbar.setColor(7, 15)
        })
        timer.after(1000, function() {
            if (game.runtime() - lastAPressed > 1000) {
                statusbar.setFlag(SpriteFlag.Invisible, true)
            }
        })
    }

    // position above Player
    let statusbarX = 120 + (player.x - scene.cameraProperty(CameraProperty.X))
    let statusbarY = 90 + (player.y - scene.cameraProperty(CameraProperty.Y))
    statusbarY -= 12
    statusbar.setPosition(statusbarX, statusbarY)
})

// player look in direction of movement only when not flying
game.onUpdate(function() {
    if (!player || !gameStarted) return
    if (fuel > 1 && controller.A.isPressed()) return

    let left: number = controller.left.isPressed() ? -1 : 0
    let right: number = controller.right.isPressed() ? 1 : 0
    let inputAxis = left + right
    switch (inputAxis) {
        case -1:
            player.setImage(assets.image`playerLeft`)
            break
        case 0:
            player.setImage(assets.image`playerDef`)
            break
        case 1:
            player.setImage(assets.image`playerRight`)
            break
        default:
            console.log('huwh')
            break

    }
})

game.onUpdate(function() {
    if (thrustAnim && !controller.A.isPressed()) {
        thrustAnim.setImage(assets.image`invis`)
    }
})
// -----------------------
// END EXTRA VISUALS CODE`
// -----------------------

// ---------------------------
// BEGIN PLAYER CONTROLS CODE
// ---------------------------
game.onUpdate(function () {
    if (!gameStarted) return

    // clamp velocity
    if (player.vy <= -verticalSpeedLimit) {
        player.vy = -verticalSpeedLimit
    } else if (player.vy >= verticalSpeedLimit * 2) {
        player.vy = verticalSpeedLimit * 2
    }

    // ran out of fuel
    if (fuel <= 0) {
        if (!fuelCooldownStarted) {
            startFuelCooldown()
        }

        fuel = 0
        return;
    }

    // fly up
    if (controller.A.isPressed()) {
        player.vy += -12
        fuel -= 1
        scene.cameraShake(2, 50)
        timer.throttle("thrust", 50, function() {
            music.play(music.createSoundEffect(WaveShape.Noise, 121, 385, 255, 255, 100, SoundExpressionEffect.None, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
        })

        // set fire effects to be same position as player
        thrustAnim.setPosition(player.x, player.bottom + 2)
        extraEffects.createSpreadEffectAt(FIRE_EFFECT, thrustAnim.x - 5, thrustAnim.y, 1, 0, 1)
        extraEffects.createSpreadEffectAt(FIRE_EFFECT, thrustAnim.x + 2, thrustAnim.y, 1, 0, 1)
        statusbar.value = fuel
        statusbar.setColor(2, 15)
        statusbar.setFlag(SpriteFlag.Invisible, false)

        startPlayerFlyVisuals()
    }
})

game.onUpdate(function () {
    // ignore if the fuel cooldown hasn't been started
    if (!fuelCooldownStarted) {
        return;
    }

    // if the fuel refilling is still on cooldown,
    // update the cooldown every frame
    if (fuelCooldown > 0) {
        fuelCooldown -= (game.runtime() - prevRunTime)
        prevRunTime = game.runtime()
        return;
    }

    // refill the fuel meter, faster on ground than mid-air
    fuelCooldown = 0
    fuelCooldownStarted = false
    timer.background(function () {
        while (fuel < 100) {
            if (player.isHittingTile(CollisionDirection.Bottom)) {
                fuel += 3
                statusbar.setColor(5, 15)
            }
            else {
                fuel += 1
                statusbar.setColor(4, 15)
            }

            statusbar.value = fuel
            pause(50)

            // stop refilling if player tries to fly
            if (controller.A.isPressed()) {
                break;
            }
        }
    })
})

// ensure fuel cooldown is set every time button is released
controller.A.onEvent(ControllerButtonEvent.Released, function () {
    if (fuel <= 0) return;

    startFuelCooldown()
})

// info grabbing onUpdate (lastFuel, lastFlyPressed)
game.onUpdate(function() {
    if (!fuel) return

    if (fuel > 100) {
        fuel = 100
    }

    lastFuel = fuel

    if (controller.A.isPressed()) {
        lastAPressed = game.runtime()
    }
})
// initiate the timer to wait before refilling fuel
// and stop the player's flying visuals
function startFuelCooldown() {
    fuelCooldown = fuelCooldownMax;
    fuelCooldownStarted = true
    prevRunTime = game.runtime()
    statusbar.setColor(11, 15)
    stopPlayerFlyVisuals()
}

// set acceleration based on touched tiles
game.onUpdate(function () {
    if (!gameStarted) return

    let touchingVoid = false
    let touchingAntivoid = false
    // runs 6 times
    for (let voidTile of voidTiles) {
        if (tiles.tileAtLocationEquals(player.tilemapLocation(), voidTile)) {
            player.ay = PLAYER_GRAV / 2
            touchingVoid = true
            break;
        }
    }
    // runs 6 times
    for (let antivoidTile of antivoidTiles) {
        if (tiles.tileAtLocationEquals(player.tilemapLocation(), antivoidTile)) {
            player.ay = PLAYER_GRAV * 2
            touchingAntivoid = true
            break;
        }
    }
    // always reset player.ay if not touching any gravity tiles
    if (!touchingVoid && !touchingAntivoid) {
        player.ay = PLAYER_GRAV
    }
})

// horizontal movement
game.onUpdate(function () {
    if (!player || !gameStarted) return

    let left: number = controller.left.isPressed() ? -1 : 0
    let right: number = controller.right.isPressed() ? 1 : 0
    let inputAxis = left + right
    switch (inputAxis) {
        case -1:
            player.vx = -50
            break
        case 0:
            player.vx = 0
            break
        case 1:
            player.vx = 50
            break
        default:
            console.log('huwh')
            break

    }

    if (level < 4) return // wind tiles only appear on level 4 and 5

    let touchingWind: boolean = false

    if (tiles.tileAtLocationEquals(player.tilemapLocation(), assets.tile`windRight`)) {
        touchingWind = true
        if (curSpeedFromWind < MAX_WIND_SPEED) {
            curSpeedFromWind += WIND_ACCELERATION
        }
    } else if (tiles.tileAtLocationEquals(player.tilemapLocation(), assets.tile`windLeft`)) {
        touchingWind = true
        if (curSpeedFromWind > -MAX_WIND_SPEED) {
            curSpeedFromWind -= WIND_ACCELERATION
        }
    }

    if (touchingWind) {
        timer.throttle("wind", 100, function() {
            music.play(music.melodyPlayable(music.smallCrash), music.PlaybackMode.InBackground)
        })
    }
    else {
        if (curSpeedFromWind > 0) {
            curSpeedFromWind -= WIND_FRICTION
            if (curSpeedFromWind < 0) curSpeedFromWind = 0 // prevent overshoot
        } else if (curSpeedFromWind < 0) {
            curSpeedFromWind += WIND_FRICTION
            if (curSpeedFromWind > 0) curSpeedFromWind = 0 // prevent overshoot
        }
    }

    player.vx += curSpeedFromWind
})
// -------------------------
// END PLAYER CONTROLS CODE
// -------------------------