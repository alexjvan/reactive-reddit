import './Help.css';

export default function Help({ }) {
    return <div id="help">
        <div className='help-section'>
            <div className='help-section-title'>
                About
            </div>
            <div className='help-section-content'>
                <p>
                    This app was created as a way to address my grievances with Reddit and the lack of functionality in the core app.
                    I primarily use reddit as a marketplace search engine, and it is not built to be used that way.
                </p>
                <p>
                    My hope is that this helps others address similar grievances as well.
                </p>
                <p><b>
                    This does <span style={{ color: 'var(--bad)' }}>NOT</span> interact with your actual reddit account in any way.
                </b></p>
            </div>
        </div>
        <div className='help-section'>
            <div className='help-section-title'>
                Getting Started
            </div>
            <div className='help-section-content'>
                <p>
                    To start, the easiest thing to do is to copy the subreddit name of that which you want to start exploring and paste it into the text-bar under 'Subs' on the top-left of the home page.
                    This will automatically start retrieving that subreddits information and building out a displayable view in the large empty-section below.
                </p>
                <p>
                    You will start seeing posts, grouped by the user who posted them, being displayed into the page.
                    You can easily scroll through and look at the items, minimizing, closing, or "blocking" users you don't want to see content from.
                </p>
            </div>
        </div>
        <div className='help-section'>
            <div className='help-section-title'>
                Interacting with the App
            </div>
            <div className='help-section-content'>
                <div className='help-section'>
                    <div className='help-section-title'>
                        Header-Bar
                    </div>
                    <div className='help-section-content'>
                        <p>
                            On the top header bar there are three main components, followed by 2 sub-components.
                        </p>
                        <p>
                            To the far-left is the subreddit adder, mentioned in the previous section.
                            This is the way to add more subs into the retriever to be able to get posts into the app for you to interact with.
                            To add a sub, enter its name into the textbox and either hit 'enter' or the 'Go' button next to the textbox.
                        </p>
                        <p>
                            In the middle is the filter section.
                            This is the main place you will add in filters to the application.
                            Filters are used to (surprisingly) filter the posts in the page.
                            On the far-left of the box, you have a category drop down.
                            From here, choose what category you want to filter for.
                            Then, in the text-box, enter the actual filter you want to filter for.
                            Finally, select the '+' or '-' button to select if you want to show your filter or not.
                            Then, hit the 'Go' button next to the desired button, or hit 'enter' in the text-box.
                            To read more about filters, go to the 'Filters' section of the help page.
                        </p>
                        <p>
                            The final section, to the most right, is a post-count.
                            You don't interact with this in any way, but instead it shows you the total posts that are being displayed below.
                        </p>
                        <p>
                            {/* Intentionally Empty - Spacer */}
                        </p>
                        <p>
                            {/* Intentionally Empty - Spacer */}
                        </p>
                        <p>
                            This brings us onto the two subcomponents, positioned below the first 3 components.
                        </p>
                        <p>
                            The first is the grey/blue bar.
                            This is a progress-bar to show the progress of the post retriever.
                            When the bar is fully blue, it is not attempting to retrieve any posts.
                            This will automatically be updated as the app tries to retreive more posts.
                        </p>
                        <p>
                            Below the progress bar is a series of interactable tabs.
                            By default you should see a 'Default' tab and a text-box with a '+' button.
                            This bar is for groups.
                            'Groups' is a way to swap between multiple different collections of the app.
                            Subs, Posts, Filters, and Minimized Users are all localized within a group.
                            To create a new, empty, group - simply enter a name into the text box and hit the plus button.
                            To swap between groups, all you need to do is click the alternate tab.
                        </p>
                    </div>
                </div>
                <div className='help-section'>
                    <div className='help-section-title'>
                        Post-Display
                    </div>
                    <div className='help-section-content'>
                        <p>
                            The next main section is the post display.
                        </p>
                        <p>
                            Here is where you can view all the posts from the subreddits you have selected for the app to retrieve.
                            These are grouped by the actual user that posted them.
                            And by default are sorted by the latest time.
                        </p>
                        <p>
                            {/* Intentionally Empty - Spacer */}
                        </p>
                        <p>
                            {/* Intentionally Empty - Spacer */}
                        </p>
                        <p>
                            In the user-display, there is really two main components.
                        </p>
                        <p>
                            The top, header bar, is for interactions for the user.
                            To the left, you will find the user's name.
                            Following immediately after the username, is the post-count, surrounded by braces.
                            To the right, you will find three interactable buttons.
                            The first is a '-' button, which will minimize the user's content.
                            This will carry over between page refreshes.
                            The second is a 'x' button, which will remove all of the user's posts from being displayed.
                            The final is a 'Block' button, which will remove the user's posts from being displayed, and will automatically filter out any new posts from that user from being displayed.
                        </p>
                        <p>
                            Below this header bar is the post-display.
                            Here you will find the content for all of the posts retrieved from the particular user.
                        </p>
                        <p>
                            {/* Intentionally Empty - Spacer */}
                        </p>
                        <p>
                            {/* Intentionally Empty - Spacer */}
                        </p>
                        <p>
                            The post-display also is broken up into a similar breakdown.
                            The small exception is that posts will also have a colored-border.
                            These colors are randomly generated and will correlate to the subreddit the post belongs to.
                        </p>
                        <p>
                            The top content is all the quick-info about the post.
                            To the top left, you will find the post's title.
                            Upon clicking the title, this will open the actual reddit page in a new tab.
                            Below this is a series of quick-info; the subreddit it was posted to, the date/time stamp the post was posted, and how many duplicates of the posts were found during retrieval.
                            And finally, below this, there is the possibility of adding any of reddit's post-tags.
                            If a post-tag is found, it will be displayed in the subreddits intended color-format.
                            To the right, you will find similar '-' and 'x' buttons, which remove the post-content or remove the post altogether respectively.
                        </p>
                        <p>
                            Below this is the actual content of the post.
                            At the very top you will find the text of the post, displayed in a format that should replicate reddit's in a similar fashion.
                            Below this is the media content of the post.
                            This will be a collection of media links found within the post itself, as well as media attached to the post as a whole.
                            To the left and right are arrows that will let you cycle through the media.
                            And at the very bottom of the images/video will be small bars that allow you to easily navigate the media indicies.
                            Hyperlinked text in the text-display should automatically swap the media-display to the media that was linked at that point.
                        </p>
                    </div>
                </div>
                <div className='help-section'>
                    <div className='help-section-title'>
                        Settings
                    </div>
                    <div className='help-section-content'>
                        <p>
                            The next major section is settings.
                            The settings page is broken down into 3 main panels.
                        </p>
                        <p>
                            The first, top panel is the actual settings to modify how the app behaves.
                            Each setting should have a description displayed to detail what it does and a small foot-note for what the app's default setting is.
                        </p>
                        <p>
                            The next section is a group display.
                            This panel simply is a way to view a summary of the contents of groups, including the sub count, post count, and filter count.
                            Here you can also remove groups by simply clicking the 'x' next to the name of that group.
                        </p>
                        <p>
                            The final is a display for the current subs and filters applicable for your current group.
                            For the subs, you can view the total active posts-per-sub, and for the filters you can view how many posts that filter has removed.
                            In each row, you can also click the 'x' button to remove the subreddit from the retrievable subs, or the filters from the list of items to filter.
                        </p>
                    </div>
                </div>
                <div className='help-section'>
                    <div className='help-section-title'>
                        Stats
                    </div>
                    <div className='help-section-content'>
                        <p>
                            Finally we have the stats page.
                            This is a quick way to get quick-info on the content of the posts.
                        </p>
                    </div>
                </div>
            </div>
        </div>
        <div className='help-section'>
            <div className='help-section-title'>
                Filters - Basic
            </div>
            <div className='help-section-content'>
                <p>
                    Adding filters is very easy to do.
                </p>
                <p>
                    The main thing to watch for is the '+' or '-' being displayed as you add a filter.
                    If a '+' is being displayed, the app will only display posts that have that content.
                    If a '-' is being displayed, the app will only display posts that do not contain that content.
                </p>
                <p>
                    The next is the category.
                    Both the 'Author' and 'Tag' category will look for exact matches, while the 'Title' or 'Text' will look for any inclusion.
                    This means a tag filter of 'Sea' will <i>not</i> filter out 'Seattle', but a title filter of 'Sea' would filter out 'Seattle'.
                </p>
                <p>
                    The final is the filter itself.
                    This can get pretty advanced, and if you are looking for more advanced functions, look to the section below.
                    In general though, all you have to do is put in the filter you want to apply and hit 'Go'.
                </p>
            </div>
        </div>
        <div className='help-section'>
            <div className='help-section-title'>
                Filters - Advanced
            </div>
            <div className='help-section-content'>
                <p>
                    Now let's talk some tips and tricks for the filters.
                    Most of these are key-word variables that allow you to enter in more complex filters, or to make your life easier.
                </p>
                <p>
                    The first is the or operator '||'. This will check for multiple items in one check.
                    For example, you want to know if someone is contactable by either phone or email.
                    For this, you can create a new text filter with the filter of 'email||phone'.
                    This will display posts if they contain <i>either</i> the word email, or phone.
                </p>
                <p>
                    The next is %start%.
                    This will check that for items at the start of the filter's category.
                    For example, you only want posts that start with OPEN.
                    For this, you can create a title filter with the filter of '%start%OPEN'.
                </p>
                <p>
                    In a very similar fashion, the next one is %end%.
                    This one will check to see if the filter's category ends with your desired content.
                    Lets say you really like proper punctuation; you could add a filter with the filter content of '.%end%' to only show posts that end with periods.
                </p>
                <p>
                    The next is %opener%.
                    Don't you hate how sometimes posts will start with a keyword, but they are identified in a variety of different manners.
                    This keyword helps catch <i>most</i> of those keywords.
                    Having a filter of '%opener%OPEN' will filter all of the following; '(OPEN', '[OPEN', '{'{'}OPEN', and '%start%OPEN'.
                </p>
                <p>
                    Similar to that above, we have %closer%.
                    Having a filter of '.%closer%' will filter all of the following; '.)', '.]', '.{'}'}', and '.%end'.
                </p>
            </div>
        </div>
    </div>;
}
