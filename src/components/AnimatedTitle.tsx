import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AnimatedTitleProps {
    text: string;
}

const AnimatedTitle: React.FC<AnimatedTitleProps> = ({ text }) => {
    const [glitching, setGlitching] = useState(false);

    // Randomly trigger glitch effect
    useEffect(() => {
        const glitchInterval = setInterval(() => {
            setGlitching(true);
            setTimeout(() => setGlitching(false), 200);
        }, 3000 + Math.random() * 5000);

        return () => clearInterval(glitchInterval);
    }, []);

    // Transform the original title text to include emojis
    const transformTitle = (title: string) => {
        // Parse original title to separate the main title from the baby sia part
        const mainPart = title.replace(/\(and baby sia\)/, '').trim();

        // Replace "Dirty 30" with "DIRTY 30 🎲" and add emojis
        const newMainPart = mainPart
            .replace("DIRTY 30", "D1RTY 30")
            .replace("TRIP", "TR1P 🎰");

        return {
            mainTitle: `🍾 ${newMainPart}`,
            subTitle: "+ baby sia 😜"
        };
    };

    const { mainTitle, subTitle } = transformTitle(text);

    // Separate words to animate them differently
    const mainWords = mainTitle.split(' ');

    // Animation variants for container
    const container = {
        hidden: { opacity: 0 },
        visible: (i = 1) => ({
            opacity: 1,
            transition: { staggerChildren: 0.12, delayChildren: 0.04 * i },
        }),
    };

    // Animation for each character
    const child = {
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 200,
            },
        },
        hidden: {
            opacity: 0,
            y: 20,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 200,
            },
        },
    };

    return (
        <motion.div
            className="relative"
            initial="hidden"
            animate="visible"
            variants={container}
        >
            <div className="flex flex-wrap justify-center items-center">
                {mainWords.map((word, wordIndex) => (
                    <div key={wordIndex} className="mx-2 my-1 relative">
                        {/* Word container */}
                        <motion.div
                            className="flex"
                            variants={container}
                            custom={wordIndex}
                        >
                            {Array.from(word).map((char, charIndex) => (
                                <motion.span
                                    key={charIndex}
                                    className={`inline-block ${
                                        // Apply different color classes based on content
                                        wordIndex === 0 || wordIndex === 1 || char === '3' || char === '0' || char === '1'
                                            ? 'text-cyber-pink'
                                            : wordIndex === 2
                                                ? 'text-cyber-blue'
                                                : 'text-cyber-gold'
                                        } font-bold text-5xl md:text-7xl neon-text`}
                                    variants={child}
                                    style={{
                                        // Apply random glitch effect
                                        transform: glitching && Math.random() > 0.7
                                            ? `translate(${(Math.random() - 0.5) * 10}px, ${(Math.random() - 0.5) * 10}px)`
                                            : 'none',
                                        opacity: glitching && Math.random() > 0.8 ? 0 : 1,
                                    }}
                                >
                                    {char}
                                </motion.span>
                            ))}
                        </motion.div>

                        {/* Glitch duplicates that show occasionally */}
                        {glitching && (
                            <>
                                <div
                                    className="absolute top-0 left-0 right-0 text-cyber-pink opacity-80 flex"
                                    style={{
                                        transform: `translate(${(Math.random() - 0.5) * 10}px, ${(Math.random() - 0.5) * 5}px)`,
                                        clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 45%)'
                                    }}
                                >
                                    {Array.from(word).map((char, i) => (
                                        <span key={i} className="text-5xl md:text-7xl font-bold">{char}</span>
                                    ))}
                                </div>
                                <div
                                    className="absolute top-0 left-0 right-0 text-cyber-blue opacity-80 flex"
                                    style={{
                                        transform: `translate(${(Math.random() - 0.5) * 10}px, ${(Math.random() - 0.5) * 5}px)`,
                                        clipPath: 'polygon(0 45%, 100% 45%, 100% 100%, 0 100%)'
                                    }}
                                >
                                    {Array.from(word).map((char, i) => (
                                        <span key={i} className="text-5xl md:text-7xl font-bold">{char}</span>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>

            {/* 3D parallax effect for title with outer glow */}
            <div
                className="absolute -inset-1 bg-gradient-to-r from-cyber-pink via-cyber-blue to-cyber-green rounded-lg opacity-20 blur-xl"
                style={{
                    transform: 'translateZ(-10px)',
                    filter: 'blur(20px)',
                    borderRadius: '100px',
                    zIndex: -1
                }}
            />

            {/* Baby Sia subtitle on a new line */}
            <motion.div
                className="flex justify-center mt-2"
                variants={container}
                initial="hidden"
                animate="visible"
                custom={2}
            >
                {Array.from(subTitle).map((char, charIndex) => (
                    <motion.span
                        key={charIndex}
                        className="inline-block text-cyber-green font-bold text-3xl md:text-5xl neon-text"
                        variants={child}
                        style={{
                            transform: glitching && Math.random() > 0.7
                                ? `translate(${(Math.random() - 0.5) * 10}px, ${(Math.random() - 0.5) * 10}px)`
                                : 'none',
                            opacity: glitching && Math.random() > 0.8 ? 0 : 1,
                        }}
                    >
                        {char}
                    </motion.span>
                ))}
            </motion.div>

            {/* Vegas-themed decorative elements with higher z-index */}
            <motion.div
                className="absolute -top-6 -right-6 text-4xl z-10"
                animate={{
                    rotate: [0, 10, 0, -10, 0],
                    scale: [1, 1.2, 1, 1.2, 1]
                }}
                transition={{
                    duration: 5,
                    repeat: Infinity,
                    repeatType: "reverse"
                }}
            >
                ✨
            </motion.div>

            <motion.div
                className="absolute -bottom-6 -left-6 text-4xl z-10"
                animate={{
                    rotate: [0, -10, 0, 10, 0],
                    scale: [1, 1.2, 1, 1.2, 1]
                }}
                transition={{
                    duration: 5,
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: 0.5
                }}
            >
                💸
            </motion.div>
        </motion.div>
    );
};

export default AnimatedTitle; 