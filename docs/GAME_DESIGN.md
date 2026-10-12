# Berkeley Game — Design Doc

Living document. Edit freely; anything marked **TBD** needs input.

## Modes

1. **Story mode (platformer)** — Mario-style. Pick a character, run through the year level by level, fight bots, end at **graduation**.
2. **Aura Kombat (1v1 fighter)** — Mortal Kombat-style, any character vs any character. Built *after* story mode, reusing the same characters and abilities.

## Core systems

- **Two abilities per character**: a *normal* attack (unlimited, short cooldown) and a *super* (charged by collecting items / hitting enemies).
- **Aura meter** = the super meter, styled after the **Aura Tracker** app. Collect aura, fill the bar, unleash the super. Losing aura on hit.
- **Easter-egg deaths**: certain objects instantly kill specific characters (and only them). Each gets its own death animation + caption.
- **Number jokes** are everywhere: scores, timers, room numbers, secret codes (see below).

## Characters

In-game name = nickname.

| # | Name | Normal ability | Super ability | Easter-egg death / quirk |
|---|------|----------------|---------------|--------------------------|
| 1 | **Airbus** (Arthus) | Throws paper planes | **Red Mode**: drinks a beer, turns red, calls in a squadron of planes across the screen | Turns red whenever he grabs a beer |
| 2 | **Ricky Rick** (Aymeric) | Throws bricks | **"IDK" shrug**: does the face + hands-out shrug, shockwave stuns all enemies on screen | Name randomly changes each life: Ricky Rick / Rizzly the Brick / Bricky Brick / Rizzly Rick |
| 3 | **Guy** (Guilhem) | Fireball from his burnt hand | **Glass Door**: puts up a glass pane, then sprints through it — shards damage everything ahead | Touches a **DJ set** → becomes **"Guy Funk"** → dies |
| 4 | **Had** (Hadrien) | Cowboy boot kick | **Glasses laser**: puts on designer glasses, laser beam (internship ref) | Touches a **fish** → allergic → dies |
| 5 | **Virgule** (Virgile) | Throws commas `,` that freeze enemies (a comma = a pause) | **Run-on sentence**: endless stream of commas / or turns into a giant **broccoli** | Skin option: broccoli. **TBD** |
| 6 | **Mathou Mateux** (Mathieu) | Shoots "Zzz" that put enemies to sleep | **Gummies**: uncontrollable laugh at the SF Bay — laugh shockwave hits the whole screen | Falls asleep if you stop moving too long |
| 7 | **Nutty** (Natangwe) | Dread whip | **Aura activation**: goes nonchalant, glowing aura, invincible + basketball slam dunk on enemies | — |
| 8 | **Ele** (Eleonore) | Vape cloud that blinds/confuses enemies | Giant cloud — clouds become **temporary platforms** | **TBD** |
| 9 | **Lulu** (Lucie) | Shaka 🤙 wave projectile | **Broken voice** (Mexico trip): croaky scream sound wave | **TBD** |
| 10 | **Khalup** (Chloé) | Throws parasols | **Heatless curls**: hair whip + parasol glide (float slowly down) | **TBD** |
| 11 | **Ophé** (Ophélie) | **TBD** | **TBD** | **TBD** |
| 12 | **Camcam** (Camille) | **TBD** | **TBD** | **TBD** |
| ★ | **Le Goat** (Gautier) | Bow that shoots drinking straws | **Arrow to the eye** | Boss or unlockable? **TBD** |

## Levels (the year, in order)

Short game: aim for **5–6 levels** plus a final graduation stage. Draft order:

1. **Berkeley Campus / the Extension** — tutorial. First day, campus, classes. Teacher refs.
2. **Telegraph Ave** — street level. **Raleigh's** (must be iconic), **Tap Haus**, restaurants. Beer pong bonus room.
3. **1934 Bonita Ave + Airbus's rooftop** — house party level, night sky, ends on the rooftop.
4. **BART → San Francisco** — ride the BART (moving train section), through Oakland, into SF: **Monroe's** (always "Monroe's"), **Amélie**.
5. **Lake Tahoe** — snow/lake level, slippery physics.
6. **Mexico / Cancún** — beach level, **l'Entrecôte à Cancún**, Lulu's broken voice trip.
7. **Graduation** — final stage + boss, ends with the cap toss.

Trader Joe's: shop / checkpoint between levels (buy power-ups with aura?).

## Enemies & obstacles

- **Brainrot creatures** — the basic enemy types (various brainrots, each with its own movement).
- **TikTok / Reels phones** — enemies that hypnotize you into scrolling (slows you down).
- **"State?" guy** — security guard who yells *"State? This? State? Hit the road dude, this ain't no state property, this is private property"* and pushes you back. Use the real meme audio.
- **"Mardi c'est non"** — a barrier/bouncer that blocks the way on certain levels.
- **Teachers** — bosses. **TBD**: which teachers + their quirks.
- **People we know** — cameos as NPCs/enemies. **TBD**.

## Items & power-ups

- **Beer** — fills aura meter (Airbus turns red).
- **Gummies** — temporary power-up (slow-mo / laughing invincibility).
- **Aura** — main collectible / score, shown in an Aura Tracker-style HUD.
- **Claude** — friendly helper NPC that gives hints, or a power-up that auto-aims your attacks.

## Number jokes (where to use them)

6-7, 7-6, 13-14, 125, 215, 15h15, 51, 52, 53, 54, 55, 56

- Score milestones trigger a pop-up (hit 67 aura → "6-7!").
- In-game clock always shows **15h15**.
- Level codes / room numbers / bus & BART numbers use them.
- 51→56 counting sequence as a secret (hit things in order).

## Open questions

- Ricky Rick: random name each life? (proposed: yes)
- Art: pixel art. Photos of each person would help design sprites.
- Ophé & Camcam: need refs.
- Teachers + friends to cameo.
- Gautier: boss or playable?
