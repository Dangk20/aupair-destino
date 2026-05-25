// context/MobileContext.jsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";

const MobileContext = createContext({ isMobile: false, isTablet: false, width: 1200 });

export function MobileProvider({ children }) {
  const [width, setWidth] = useState(1200);

  useEffect(() => {
    const update = () => setWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <MobileContext.Provider value={{
      isMobile: width < 768,
      isTablet: width >= 768 && width < 1024,
      width,
    }}>
      {children}
    </MobileContext.Provider>
  );
}

export const useMobile = () => useContext(MobileContext);