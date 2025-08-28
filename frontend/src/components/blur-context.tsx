"use client";

import React, { createContext, useContext, useState } from "react";

type BlurState = {
  isBlurred: boolean;
  setIsBlurred: (v: boolean) => void;
};

const BlurContext = createContext<BlurState | undefined>(undefined);

export const BlurContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isBlurred, setIsBlurred] = useState<boolean>(false);

  return (
    <BlurContext.Provider value={{ isBlurred, setIsBlurred }}>
      {children}
    </BlurContext.Provider>
  );
};

export const useBlurContext = () => {
  const context = useContext(BlurContext);

  if (!context)
    throw new Error("useBlurContext must be used within BlurContextProvider");

  return context;
};
