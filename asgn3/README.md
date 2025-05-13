Simple minecraft project (Create a virtual world)

DISCLAIMER - I've tried many ways of localhosting but the only way that was able to run my code fully without any glitches was to use my server.py file then load localhost from there. even trying to load a localhost 8000 without the server.py file was giving me glitches in my code.

Have a ground created with a flattened cube and sky from a big cube. - check
Texture working on at least one object. - check
Texture on some objects and color on some other objects. All working together. - sky is color, other blocks are textured (grass, stone, gold)
Implement camera movement. - check (wasd)
Key commands for rotation work. Use Q (rotate left) & E (rotate right). - check
Perspective camera implemented/Rotate camera with the mouse. - check (can drag mouse for left, right, up, down)
World is implemented. There is some interesting world to walk around. - check (although not 32x32, I have downscaled to 8x8 for performance reasons)
Multiple textures - check (grass, stone, gold)
Add/delete blocks - check
Add simple story or game to world - my game is that there are 3 randomly generated gold treasure blocks and the objective is to find all of them. once you walk towards one it is collected. you win by collecting all of them and the console gives you a fun message
Performance - tried my best to follow the steps on this and my 32x32 map seems to run at a decent rate. I think my computer is definitely slow though. (check?)
Wow - Okay so I couldn't think of anything majestic to add so I just enhanced functionality a lot. here are some things that I did
    - Adding and deleting blocks will have a white texture over the block that was just added (to indicate that it was added) and any added block you look at will have a red highlight that indicates you can press G to delete it
    - Once adding blocks, you can save the world "l" and load a saved world "k". I've made some really cool things using this and it was sort of difficult to implement
    - Treasure hunt game - Made it not as simple as it sounds. I've made it really scalable so the treaasure can be randomly generated to be a lot farther apart (by changing one variable) but I also added a hint system that took quite a bit of time. It will display from the console a hint as to where the nearest piece of treasure is (by direction) so you can walk towards it. This, by far, took me the longest time to impelement.

Also used ChatGPT to help me debug and stuff but it wasn't super helpful