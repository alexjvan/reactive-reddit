import './TextDisplay.css';

export default function TextDisplay({
    processedText
}) {
    return <div className='post-text'>
        {processedText.map((line, index) => {
            const Tag = line.text.includes('<p>') ? 'div' : 'p';
            return <Tag
                key={index}
                dangerouslySetInnerHTML={{ __html: line.text }}
                className={line.modifiers.join(' ')}
            />;
        })}
    </div>;
}