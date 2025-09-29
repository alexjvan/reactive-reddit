TODO
## Purpose
Looking at the TODOs in this repo, summarizing to narrow down items to work on:

## Large Projects:
- Info! Tooltips, help/info page
- Filters! New Filter Variables, custom filters.
    * For whats left, I will need to be able to do evaluative filters
- Pre-processed Posts! Save the react-only data for posts, enable Media caching.
    * Thinking ahead on this, would this mean I need seperate models for all the items that won't be processing things again?
    * Once again, thinking ahead. Maybe just save retrieved media?
    * I actually think this might be a dumb one to pick up now.
        * I think this is going to add a lot of complexity to the stack, as well as the possibility of missing out on a lot of new data as added-in.
        * The primary goal of this was to eliminate the number of 404s on images.
        * Will leave this as an item to possibly be tackled for now. 
        * Will keep the media validation logic commented out for a little until I've had some time to think it over, then will remove it.

## One-off Items:
- Snapshot the data to save to disk, "saves"
- On initial load, snapshot storage. Create way to restore initial session
- Stop grabber button
- Setting Items
    * Sorting Options
    * Display Options
    * I had one for auto-refresh? What does that mean?

## Performance-Based Items:
- Not constantly be saving data into storage during retrieval
- Save scroll position (I believe the main issue with current implementation is post-shifting. But not 100% sure how to fix yet)
- HTML Error Code for cached Media
- Figure out why duplicate posts are being grabbed. Why is the second filtering required in the grabber

## Bugs/Errors:
- SOMETIMES, crashing wipes all data?
    * With groups, this only wipes the CURRENT groups data???
        * I think this means that the data is being corrupted on-load and never gets saved
        * But why does this *wipe* the current data?
        * Save-snapshots *might* fix this
