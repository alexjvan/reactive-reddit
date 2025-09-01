import { isImageLink, isVideoLink } from './imageHelpers';

export function modLine(line) {
    let split = line.split('');
    let modded = '';
    let word = '';

    let inItalic = false;
    let italicString = '';

    let inLink = false;
    let passedLinkText = false;
    let linkText = '';
    let linkLink = '';

    // Gather links here instead of calling setMediaText
    let mediaLinks = [];

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
                        modded += `<a class="findableImage" data-link="${linkLink}">${linkText}</a>`;
                        mediaLinks.push(linkLink);
                        inLink = false;
                        passedLinkText = false;
                        linkText = '';
                        linkLink = '';
                    } else {
                        modded += `<a class="otherSite" href="${linkLink}" target="_blank">${linkText}</a>`;
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
                    modded += `<a class="findableImage" data-link="${word}">${word}</a> `;
                    mediaLinks.push(word);
                } else if (word.startsWith("(http") && word.endsWith(")")) {
                    let inner = word.substring(1, word.length - 1);
                    modded += `(<a class="findableImage" data-link="${inner}">${word}</a>) `;
                    mediaLinks.push(inner);
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
                if (split[i + 1] === '-')
                    continue;
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
            modded += `<a class="findableImage" data-link="${word}">${word}</a> `;
            mediaLinks.push(word);
        } else {
            modded += word;
        }
    }
    if (inItalic) modded += '*' + italicString;

    return { html: modded, mediaLinks };
}