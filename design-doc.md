# Design Overview

## Concept Design Differences

Using the feedback from the previous assignments about my concepts, I split the BetaVideo concept down to two generic concepts. I removed the BoardView concept because it's not so much a concept as much as it is UI rendering logic, as well as the Filter concept, because I think it serves more as a utility layer in the API as opposed to a concept with states. I have kept the Filter concepts and generated responses to show the process.

## Visual Design Differences

In terms of visual design differences, I largely kept the same UI as my proposed design on Figma. I also incorporated the dark mode theme and the colors that suited my theme the best. There were a few areas that were different due to being unaccounted for that I later implemented as I realized it was out of necessity.

For example, the UI having a button in the top right corner to create a problem. I tried to keep the UI familiar to the user by utilizing a view very similar to other instances where I displayed the board in the web app.

I also made some minor changes when it came to the problem card display, as I realized there were issues with aspect ratio for different sizes of the board. I also added some more tags and also rearranged the overall layout of the problem cards.

I also implemented quite a few small, yet meaningful changes to the UX through form validation features and other small tweaks that would make it harder for a user to perform an incorrect action that may break or negatively impact the experience. An example of this is in the grade input, which expects numbers only. It wouldn't make sense to be able to input anything other than a number.

# Project Reflection

Overall, this was a fun and challenging project. It was quite eye-opening just how impressive these agents are at building things, especially when tackled with an iterative approach. 

I think breaking important UI features down into smaller, more compartmentalized components made orchestrating the UI a lot easier. Rather than oneshotting, it allowed me to hone in on the more complex features and refine them. This meant keeping things that worked and not having to reset/discard everything.

Personally, I find it quite a headache to have everything separately. If I were to do this project myself with no bounds, I would utilize a monorepo structure to better allow Cursor to take in context, especially with its built-in features for codebase indexing.


