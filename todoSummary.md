TODO
## Purpose
Looking at the TODOs in this repo, summarizing to narrow down items to work on:

## Large Projects:
- Filters! New Filter Variables, custom filters.
    * For whats left, I will need to be able to do evaluative filters

## One-off Items:
- Snapshot the data to save to disk, "saves"
- On initial load, snapshot storage. Create way to restore initial session
- Stop grabber button
- New Settings
    * Only keep posts before a certain time (setting?)
        - Might be worth having a sub-setting to keep old posts from users who have recent posts as well
            * This way you can view older posts from people still active, but remove inactive users
        - !! Need to create some sort of dependent-setting system if I want to make this work. For now, just going to do inactive users
    * Fixed Picture Size
        - !! Also requires some sort of dependent-setting system (need a numerical input if this is selected)
- Categorize Left Over Post Cleaner Items
- Find better spot for image movers (prev/next) so they don't shift with each image-change
- More Media links
- Pop-Out Image Container
- Pull duplicate subreddits into subreddit list
- UsersSubs: Remove user on 404?
- Try and make Grabber + UserRetriever generic

## Performance-Based Items:
- Save scroll position (I believe the main issue with current implementation is post-shifting. But not 100% sure how to fix yet)
- Figure out why duplicate posts are being grabbed. Why is the second filtering required in the grabber

## Bugs/Errors:
- SOMETIMES, crashing wipes all data?
    * With groups, this only wipes the CURRENT groups data???
        * I think this means that the data is being corrupted on-load and never gets saved
        * But why does this *wipe* the current data?
        * Save-snapshots *might* fix this
- To catch reddit placeholder images, I am checking for 130x60 images.
    * This catches other images too, need to find a better option
- For SOME reason, the don't recommend in common subs takes FOREVER to update while the add doesn't?
