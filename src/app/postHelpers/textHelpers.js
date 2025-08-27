import { isImageLink, isVideoLink } from './imageHelpers';

export function modLine(line, setMediaText) {
    let split = line.split('');

    let modded = '';
    let word = '';

    let inItalic = false;
    let italicString = '';

    let inLink = false;
    let passedLinkText = false;
    let linkText = '';
    let linkLink = '';

    for (let i = 0; i < split.length; i++) {
        let char = split[i];
        switch (char) {
            case '*':
                if (inItalic) {
                    if (italicString !== '') {
                        modded += '<i>' + italicString + '</i>';
                    }
                    italicString = '';
                }
                inItalic = !inItalic;
                break;
            case '[':
                if (passedLinkText) {
                    linkLink += char;
                } else if (inLink) {
                    modded += '[' + linkText;
                    linkText = '';
                } else {
                    inLink = true;
                }
                break;
            case ']':
                if (passedLinkText) {
                    linkLink += char;
                } else if (inLink) {
                    if (split[i + 1] === '(') {
                        passedLinkText = true;
                    } else {
                        modded += '[' + linkText + ']';
                    }
                } else {
                    word += char;
                }
                break;
            case '(':
                if (inLink) {
                    passedLinkText = true;
                } else {
                    word += char;
                }
                break;
            case ')':
                if (passedLinkText) {
                    if (isImageLink(linkLink) || isVideoLink(linkLink)) {
                        modded += '<a class="findableImage" data-link="' + linkLink + '">' + linkText + '</a>';
                        const tempLink = linkLink; // The next line is async, while nothing else is. This is to keep the value during that op (I hate react)
                        setMediaText((prev) => [...prev, tempLink]);
                        inLink = false;
                        passedLinkText = false;
                        linkText = '';
                        linkLink = '';
                    } else {
                        modded += '<a class="otherSite" href="' + linkLink + ' target=_blank">' + linkText + '</a>';
                        inLink = false;
                        passedLinkText = false;
                        linkText = '';
                        linkLink = '';
                    }
                } else {
                    word += char;
                }
                break;
            case ' ':
                if (word === '' && !inItalic && !passedLinkText && !inLink) {
                    modded += ' ';
                } else if (word.startsWith("http")) {
                    modded += '<a class="findableImage" data-link="' + word + '">' + word + '</a> ';
                    const tempLink = word; // The next line is async, while nothing else is. This is to keep the value during that op (I hate react)
                    setMediaText((prev) => [...prev, tempLink]);
                } else if(word.startsWith("(http") && word.endsWith(")")) { // One or the other, considering typo until further discovery
                    modded += '(<a class="findableImage" data-link="' + word.substring(1, word.length - 1) + '">' + word + '</a>) ';
                    const tempLink = word; // The next line is async, while nothing else is. This is to keep the value during that op (I hate react)
                    setMediaText((prev) => [...prev, tempLink]);
                } else {
                    if (inItalic) {
                        italicString += ' ';
                    } else if (passedLinkText) {
                        linkLink += ' ';
                    } else if (inLink) {
                        linkText += ' ';
                    } else {
                        modded += word + ' ';
                    }
                }
                word = '';
                break;
            case '\\':
                if (split[i + 1] === '-') {
                    continue;
                }
            default:
                if (inItalic) {
                    italicString += char;
                } else if (passedLinkText) {
                    linkLink += char;
                } else if (inLink) {
                    linkText += char;
                } else {
                    word += char;
                }
                break;
        }
    }

    if (passedLinkText) {
        modded += '[' + linkText + '](' + linkLink;
    } else if (inLink) {
        modded += '[' + linkText;
    } else {
        if (word.startsWith("http")) {
            modded += '<a class="findableImage" data-link="' + word + '">' + word + '</a> ';
            const tempLink = word; // The next line is async, while nothing else is. This is to keep the value during that op (I hate react)
            setMediaText((prev) => [...prev, tempLink]); // TODO: (Why is this showing up at all? Also doesn't always show up? Caching maybe?) textHelpers.js:130 Warning: Cannot update a component (`Post`) while rendering a different component (`TextDisplay`). To locate the bad setState() call inside `TextDisplay`, follow the stack trace as described in https://reactjs.org/link/setstate-in-render
        } else {
            modded += word;
        }
    }
    if (inItalic) modded += '*' + italicString;

    return modded;
}