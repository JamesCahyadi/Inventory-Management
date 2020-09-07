import React, { useState, useEffect, createContext } from 'react';

export const WinWidthContext = createContext();

export const WinWidthProvider = ({ children }) => {
    const [width, setWidth] = useState(window.innerWidth);
    const [isSmallScreen, setIsSmallScreen] = useState(false);
    const smallScreenWidth = 710; // pixels

    const handleResize = () => {
        setWidth(window.innerWidth);
    }

    useEffect(() => {
        window.addEventListener('resize', handleResize);

        if (width < smallScreenWidth) {
            setIsSmallScreen(true);
        } else {
            setIsSmallScreen(false);
        }

        return () => {
            window.removeEventListener('resize', handleResize);
        }
    }, [width]);

    return (
        <WinWidthContext.Provider value={[isSmallScreen, setIsSmallScreen]}>
            {children}
        </WinWidthContext.Provider>
    )
}