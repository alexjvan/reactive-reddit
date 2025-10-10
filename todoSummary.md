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
    * Fixed Picture Size
- Categorize Left Over Post Cleaner Items
- Find better spot for image movers (prev/next) so they don't shift with each image-change
- https://www.redditmedia.com/mediaembed/*

## Performance-Based Items:
- Not constantly be saving data into storage during retrieval
- Save scroll position (I believe the main issue with current implementation is post-shifting. But not 100% sure how to fix yet)
- Figure out why duplicate posts are being grabbed. Why is the second filtering required in the grabber
- Seperate CSS files out of one-parent (for example, bring TextDisplay css into its own file)

## Bugs/Errors:
- SOMETIMES, crashing wipes all data?
    * With groups, this only wipes the CURRENT groups data???
        * I think this means that the data is being corrupted on-load and never gets saved
        * But why does this *wipe* the current data?
        * Save-snapshots *might* fix this
- To catch reddit placeholder images, I am checking for 130x60 images.
    * This catches other images too, need to find a better option
