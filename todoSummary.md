TODO
## Purpose
Looking at the TODOs in this repo, summarizing to narrow down items to work on:

## Large Projects:
- Filters! New Filter Variables, custom filters.
    * For whats left, I will need to be able to do evaluative filters
- Pre-processed Posts! Save the react-only data for posts, enable Media caching.
    * Thinking ahead on this, would this mean I need seperate models for all the items that won't be processing things again?
    * Once again, thinking ahead. Maybe just save retrieved media?
- Info! Tooltips, help/info page

## One-off Items:
- Snapshot the data to save to disk, "saves"
- On initial load, snapshot storage. Create way to restore initial session
- Stop grabber button
- Setting Items
    * Attempt Grab on Sub Addition
    * Sorting Options
    * I had one for auto-refresh? What does that mean?

## Performance-Based Items:
- Not constantly be saving data into storage during retrieval
- Save scroll position (I believe the main issue with current implementation is post-shifting. But not 100% sure how to fix yet)
- HTML Error Code for cached Media
- Save Validations
- Figure out why duplicate posts are being grabbed. Why is the second filtering required in the grabber

## Bugs/Errors:
- SOMETIMES, crashing wipes all data?
    * With groups, this only wipes the CURRENT groups data???
        * I think this means that the data is being corrupted on-load and never gets saved
        * But why does this *wipe* the current data?
        * Save-snapshots *might* fix this
- Tag filters sometimes vanish
