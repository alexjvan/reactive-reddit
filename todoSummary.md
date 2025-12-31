TODO
## Purpose
Looking at the TODOs in this repo, summarizing to narrow down items to work on:

## Large Projects:
- Filters! New Filter Variables, custom filters.
    * For whats left, I will need to be able to do evaluative filters
- New Settings
    * Only keep posts before a certain time (setting?)
        - Might be worth having a sub-setting to keep old posts from users who have recent posts as well
            * This way you can view older posts from people still active, but remove inactive users
        - !! Need to create some sort of dependent-setting system if I want to make this work. For now, just going to do inactive users
    * Fixed Picture Size
        - !! Also requires some sort of dependent-setting system (need a numerical input if this is selected)
    * Remove users' posts when deleted (from UserRetriever)
    * Highlight required filters

## One-off Items:
- On initial load, snapshot storage. Create way to restore initial session
- Stop grabber button
- Find better spot for image movers (prev/next) so they don't shift with each image-change
- More Media links
- UsersSubs: Remove user on 404?
- Try and make Grabber + UserRetriever generic
- "Storage Managed Items"
- Image comparison for duplicates
- Text compare on processed multilines
- Image tags
- I HATE the header layout on mobile/reduced screens

## Performance-Based Items:
- Save scroll position (I believe the main issue with current implementation is post-shifting. But not 100% sure how to fix yet)
- Figure out why duplicate posts are being grabbed. Why is the second filtering required in the grabber
    * I am wondering if the problem here is if reddit doesn't want to /not/ return items, so its looping the subs (similar to what I was seeing in the after looping). But why wouldn't utc checking catch this? 
- Lag spikes on saves

## Bugs/Errors:
- To catch reddit placeholder images, I am checking for 130x60 images.
    * This catches other images too, need to find a better option
- Import on mobile completely broken?
    * Filters aren't applying
    * Progress Bar not working
    * No "page content" (subs, filters) - but grabbing new posts?
    * !! After a while, filters applied - but still no page content being shown? Not sure what changed here?
        * Then more showed up that aren't being filtered? NO CLUE whats happening with importss here
