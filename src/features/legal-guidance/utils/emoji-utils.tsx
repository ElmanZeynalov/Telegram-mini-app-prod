import React from "react"

/**
 * Regex to match emojis.
 * This is a comprehensive regex for most emoji characters.
 */
const EMOJI_REGEX = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu

export function formatWithLargerEmojis(text: string): React.ReactNode[] {
    const parts = text.split(EMOJI_REGEX)

    return parts.map((part, index) => {
        if (part.match(EMOJI_REGEX)) {
            return (
                <span key={index} className="inline-block text-[1.4em] leading-none align-middle mx-[1px]">
                    {part}
                </span>
            )
        }
        return <span key={index}>{part}</span>
    })
}

export function processEmojiChildren(children: React.ReactNode): React.ReactNode {
    return React.Children.map(children, (child) => {
        if (typeof child === 'string') {
            return formatWithLargerEmojis(child)
        }
        if (React.isValidElement(child)) {
            // If it has children, recurse? 
            // ReactMarkdown usually passes strings as children to leaf nodes like 'strong' or 'em'.
            // But 'p' might contain 'strong' elements.
            // So we generally don't need to deeply recurse if we override all leaf nodes,
            // OR we just recurse for safety.
            return React.cloneElement(child as React.ReactElement<any>, {
                children: processEmojiChildren((child.props as any).children)
            })
        }
        return child
    })
}
