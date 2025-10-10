import { useEffect, useMemo } from 'react';
import { 
    TextModifierBold,
    TextModifierHeaderPrefix, 
    TextModifierItalic,
    TextModifierIndented, 
    TextModifierListItem,
    TextModifierNoTopPadding
} from '../../../app/constants';
import { modLine } from '../../../app/postHelpers/textHelpers';

export default function TextDisplay({
    setPosts,
    t3,
    postText,
    setMediaText
}) {
    var lines = useMemo(
        () => postText.split('\n').filter((line) => line.trim() !== ''),
        [postText]
    );

    var moddedLines = useMemo(
        () => lines.map((line, index) => {
            var modifiers = (index === 0) ? [TextModifierNoTopPadding] : [];
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
                if (moddedLine.length > 3 && moddedLine.startsWith('**') && moddedLine.endsWith('**')) {
                    modifiers.push(TextModifierBold);
                    moddedLine = moddedLine.substring(2, moddedLine.length - 2);
                    foundModifiers = true;
                }
                if (moddedLine.length > 1 && moddedLine.startsWith('*') && moddedLine.endsWith('*')) {
                    modifiers.push(TextModifierItalic);
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

            var htmlified = modLine(moddedLine);
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

    useEffect(() => {
        setPosts(prev =>
            prev.map(p => {
                if (p.name !== t3) return p;
                const hasText = moddedLines.length > 0;
                if (p.hasText === hasText) return p; // prevent no-op updates
                return { ...p, hasText };
            })
        );
    }, [moddedLines.length]);

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