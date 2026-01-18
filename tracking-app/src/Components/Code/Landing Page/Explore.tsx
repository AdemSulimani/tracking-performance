import { useState, useEffect } from 'react'
import '../../Style/Landing style/Explore.css'

const buttonTexts = {
    'leave-policies': {
        userMessage: "I'm caring for a sick family member. What are my options for leave?",
        aiResponse: "Under our policy, you're eligible for two weeks of paid leave. Would you like to open a request?"
    },
    'career-growth': {
        userMessage: "I want to advance in my career. What opportunities are available?",
        aiResponse: "We offer various career development programs including mentorship, training courses, and internal mobility. Let me help you explore your options."
    },
    'manager-coaching': {
        userMessage: "I need help improving my management skills. What resources do you have?",
        aiResponse: "We provide comprehensive manager coaching programs, leadership workshops, and one-on-one sessions. Would you like to schedule a consultation?"
    }
}

function useTypingAnimation(text: string, speed: number = 30) {
    const [displayedText, setDisplayedText] = useState('')
    const [isComplete, setIsComplete] = useState(false)

    useEffect(() => {
        if (!text) {
            setDisplayedText('')
            setIsComplete(false)
            return
        }

        setDisplayedText('')
        setIsComplete(false)
        let currentIndex = 0

        const interval = setInterval(() => {
            if (currentIndex < text.length) {
                setDisplayedText(text.slice(0, currentIndex + 1))
                currentIndex++
            } else {
                setIsComplete(true)
                clearInterval(interval)
            }
        }, speed)

        return () => clearInterval(interval)
    }, [text, speed])

    return { displayedText, isComplete }
}

export function Explore() {
    const [selectedButton, setSelectedButton] = useState<'leave-policies' | 'career-growth' | 'manager-coaching' | null>(null)
    const [currentUserMessage, setCurrentUserMessage] = useState(buttonTexts['leave-policies'].userMessage)
    const [currentAiResponse, setCurrentAiResponse] = useState(buttonTexts['leave-policies'].aiResponse)
    const [shouldAnimateUser, setShouldAnimateUser] = useState(false)
    const [shouldAnimateAi, setShouldAnimateAi] = useState(false)

    const userTyping = useTypingAnimation(shouldAnimateUser ? currentUserMessage : '', 20)
    const aiTyping = useTypingAnimation(shouldAnimateAi ? currentAiResponse : '', 20)

    useEffect(() => {
        if (userTyping.isComplete && shouldAnimateUser) {
            setTimeout(() => {
                setShouldAnimateAi(true)
            }, 200)
        }
    }, [userTyping.isComplete, shouldAnimateUser])

    useEffect(() => {
        if (aiTyping.isComplete && shouldAnimateAi) {
            setTimeout(() => {
                setShouldAnimateUser(false)
                setShouldAnimateAi(false)
            }, 100)
        }
    }, [aiTyping.isComplete, shouldAnimateAi])

    const handleButtonClick = (buttonType: 'leave-policies' | 'career-growth' | 'manager-coaching') => {
        if (selectedButton === buttonType) return

        setSelectedButton(buttonType)
        setCurrentUserMessage(buttonTexts[buttonType].userMessage)
        setCurrentAiResponse(buttonTexts[buttonType].aiResponse)
        setShouldAnimateUser(true)
        setShouldAnimateAi(false)
    }

    return (
        <section className="explore">
            <div className="explore-container">
                <div className="explore-content">
                    <div className="explore-header-section">
                        <div className="explore-tag">DO MORE WITH LATTICE AI</div>
                        <h2 className="explore-heading">Lattice AI Agent</h2>
                    </div>
                    
                    <div className="explore-chat">
                        <div className="explore-user-message">
                            <div className="explore-message-icon">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M10 10C12.7614 10 15 7.76142 15 5C15 2.23858 12.7614 0 10 0C7.23858 0 5 2.23858 5 5C5 7.76142 7.23858 10 10 10Z" fill="currentColor"/>
                                    <path d="M10 12C6.68629 12 0 13.6863 0 17V20H20V17C20 13.6863 13.3137 12 10 12Z" fill="currentColor"/>
                                </svg>
                            </div>
                            <div className="explore-message-text">
                                {shouldAnimateUser ? userTyping.displayedText : currentUserMessage}
                                {shouldAnimateUser && !userTyping.isComplete && <span className="typing-cursor">|</span>}
                            </div>
                            <button className="explore-send-button">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M8 0L15.5 8L8 16M15.5 8H0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                        </div>
                        
                        <div className="explore-ai-response">
                            <div className="explore-ai-text">
                                {shouldAnimateAi ? aiTyping.displayedText : (shouldAnimateUser ? '' : currentAiResponse)}
                                {shouldAnimateAi && !aiTyping.isComplete && <span className="typing-cursor">|</span>}
                            </div>
                            <div className="explore-action-buttons">
                                <button 
                                    className="explore-action-button"
                                    onClick={() => handleButtonClick('leave-policies')}
                                >
                                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                        <path d="M2 4H14V12H2V4ZM2 4L8 8L14 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    Leave policies
                                </button>
                                <button 
                                    className="explore-action-button"
                                    onClick={() => handleButtonClick('career-growth')}
                                >
                                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                        <path d="M2 4H14V12H2V4ZM2 4L8 8L14 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    Career growth
                                </button>
                                <button 
                                    className="explore-action-button"
                                    onClick={() => handleButtonClick('manager-coaching')}
                                >
                                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                        <path d="M2 4H14V12H2V4ZM2 4L8 8L14 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    Manager coaching
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="explore-promotional">
                        <p className="explore-promotional-text-bottom">
                            HR teams spend 57% of their time on manual tasks. Get time back with fast, reliable support that transforms HR from reactive to proactive.
                        </p>
                        <button className="explore-learn-more-button">Learn more</button>
                    </div>
                </div>
            </div>
        </section>
    )
}