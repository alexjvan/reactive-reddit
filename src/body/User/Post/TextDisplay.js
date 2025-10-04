import { useEffect, useMemo } from 'react';
import { TextModifierHeader, TextModifierHeaderPrefix, TextModifierIndented, TextModifierListItem } from '../../../app/constants';
import { modLine } from '../../../app/postHelpers/textHelpers';

export default function TextDisplay({
    t3,
    postText,
    setMediaText
}) {
    var lines = useMemo(
        () => postText.split('\n').filter((line) => line.trim() !== ''),
        [postText]
    );

    var moddedLines = useMemo(
        () => lines.map((line) => {
            var modifiers = [];
            var moddedLine = line;

            var foundModifiers = false;
            do {
                moddedLine = moddedLine.trim();
                foundModifiers = false;
                if (moddedLine.startsWith('>')) {
                    modifiers.push(TextModifierIndented);
                    moddedLine = moddedLine.substring(1);
                    foundModifiers = true;
                }
                if (moddedLine.startsWith('&gt;')) {
                    modifiers.push(TextModifierIndented);
                    moddedLine = moddedLine.substring(4);
                    foundModifiers = true;
                }
                if (moddedLine.startsWith('*' && moddedLine.endsWith('*'))) {
                    modifiers.push(TextModifierHeader);
                    moddedLine = moddedLine.substring(1, moddedLine.length - 1);
                    foundModifiers = true;
                }
                if (moddedLine.startsWith('* ')) {
                    modifiers.push(TextModifierListItem);
                    moddedLine = moddedLine.substring(2);
                    foundModifiers = true;
                }
                if (moddedLine.startsWith("#")) {
                    let headerLevel = 0;
                    while (moddedLine.startsWith("#")) {
                        headerLevel++;
                        moddedLine = moddedLine.substring(1);
                    }
                    modifiers.push(TextModifierHeaderPrefix + headerLevel);
                    foundModifiers = true;
                }
            } while (foundModifiers); // Loop through to catch multiple modifiers if present

            var htmlified = modLine(moddedLine, setMediaText);
            return { text: htmlified.html, modifiers: modifiers, media: htmlified.mediaLinks };
        }),
        [lines]
    );

    useEffect(() => {
        const allLinks = moddedLines.flatMap(line => line.mediaLinks);
        if (allLinks.length > 0) {
            setMediaText(allLinks);
        }
    }, [moddedLines]);

    const htmlDisplay = useMemo(
        () => moddedLines.map((line, index) => {
            const Tag = line.text.includes('<p>') ? 'div' : 'p';
            return <Tag
                key={t3 + index}
                dangerouslySetInnerHTML={{ __html: line.text }}
                className={line.modifiers.join(' ')}
            />;
        }),
        [moddedLines]
    );

    return <div className='post-text'>
        {htmlDisplay}
    </div>;
}