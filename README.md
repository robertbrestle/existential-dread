# Existential Dread
A horror-themed platformer originally developed during the 2013 [Global Game Jam](https://globalgamejam.org).  

Play this project:  
https://johtull.com/existential-dread/index.html

Original 2013 Global Game Jam Entry:  
https://johtull.com/existential-dread/download/Existential+Dread+v1.2+-+GGJ+2013.jar

# Purpose
The primary purpose of this port is preservation amidst the aging technology it was originally built with (Java 1.7). Rewritten entirely in vanilla JavaScript for HTML5 canvas, we have improved the core gameplay mechanics while retaining the initial inspiration.

## History and Future
Since the Global Game Jam is a 48 hour challenge, we were unable to complete our vision for this project. Instead, we created an enjoyable gameplay experience with 3 solid levels to show off the functionality.  

With more time and motivation, I have been able to revisit this project and tailor it more to our ideal vision.  

This version has been updated to:  
- clean and modernize the codebase
- fix outstanding bugs
- add new gameplay mechanics (future)
- add new levels (future)
- add custom level editor (future)
- add new sprites (future)
- add new music (future)

### Specific Improvements
- updated tick logic for smoother/consistent gameplay
- usage of spritesheets
- use maps as hybrid configuration files instead of hardcoded values
- general cleanup

# Gameplay
Existential Dread plays like a traditional, minimal 2D platformer.

## Controls
* WASD or Arrow Keys for movement  
* SPACE or W for jumping  
* Hold SHIFT to sprint or super-jump  
* F to toggle your lantern  
  
## Stats / UI
There are 3 player stat bars in the top right corner:  
  
### Health - Top Red Bar
The amount of hit points your player has. When this reaches 0, the game is over.  
### Stamina - Middle Green Bar
The amount of sprint/super-jump energy you have. You recover stamina slowly over time.  
If you run out, you will be temporarily incapacitated while you catch your breath.  
### Battery Charge - Bottom Yellow Bar
The amount of charge your lantern has. Find more batteries to add more charge. If you run out, you will not be able to use your lantern until you find more batteries.  
Once you obtain the lantern, this bar will appear.  
  
## Objectives
Your goal is to survive the night by completing levels without succumbing to the Darkness.  
  
The moving black clouds/walls are the Darkness. For every moment in the Darkness while your 
lantern is off, you will take damage. When your health is depleted, the game is over.  

&nbsp;
