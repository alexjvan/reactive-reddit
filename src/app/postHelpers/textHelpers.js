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

    for(let i = 0; i < split.length; i++) {
        let char = split[i];
        switch(char) {
            case '*':
                if(inItalic) {
                    modded += '<i>' + italicString + '</i>';
                    italicString = '';
                }
                inItalic = !inItalic;
                break;
            case '[':
                if(passedLinkText) {
                    linkLink += char;
                } else if(inLink) {
                    modded += '['+linkText;
                    linkText = '';
                } else {
                    inLink = true;
                }
                break;
            case ']':
                if(passedLinkText) {
                    linkLink += char;
                } else if(inLink) {
                    if(split[i + 1] === '(') {
                        passedLinkText = true;
                    } else {
                        modded += '['+linkText+']';
                    }
                } else {
                    modded += char;
                }
                break;
            case '(':
                if(inLink) {
                    passedLinkText = true;
                } else {
                    modded += char;
                }
                break;
            case ')':
                if(passedLinkText) {
                    if(isImageLink(linkLink) || isVideoLink(linkLink)) {
                        modded += '<a class="findableImage" data-link="'+linkLink+'">'+linkText+'</a>';
                        const tempLink = linkLink; // The next line is async, while nothing else is. This is to keep the value during that op (I hate react)
                        setMediaText((prev) => [...prev, tempLink]);
                        inLink = false;
                        passedLinkText = false;
                        linkText = '';
                        linkLink = '';
                    } else {
                        modded += '<a class="otherSite" href="'+linkLink+' target=_blank">'+linkText+'</a>';
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
                if(word === '' && !inItalic && !passedLinkText && !inLink) {
                    modded += ' ';
                } else if(word.startsWith("http")) {
                    modded += '<a class="findableImage" data-link="'+word+'">'+word+'</a> ';
                    const tempLink = word; // The next line is async, while nothing else is. This is to keep the value during that op (I hate react)
                    setMediaText((prev) => [...prev, tempLink]);
                } else {
                    if(inItalic) {
                        italicString += ' ';
                    } else if(passedLinkText) {
                        linkLink += ' ';
                    } else if(inLink) {
                        linkText += ' ';
                    } else {
                        modded += word + ' ';
                    }
                }
                word = '';
                break;
            default:
                if(inItalic) {
                    italicString += char;
                } else if(passedLinkText) {
                    linkLink += char;
                } else if(inLink) {
                    linkText += char;
                } else {
                    word += char;
                }
                break;
        }
    }

    if(passedLinkText) {
        modded += '['+linkText+']('+linkLink;
    } else if(inLink) {
        modded += '['+linkText;
    } else {
        if(word.startsWith("http")) {
            modded += '<a class="findableImage" data-link="'+word+'">'+word+'</a> ';
            const tempLink = word; // The next line is async, while nothing else is. This is to keep the value during that op (I hate react)
            setMediaText((prev) => [...prev, tempLink]);
        } else {
            modded += word;
        }
    }
    if(inItalic) modded += '*' + italicString; 

    return modded;
}