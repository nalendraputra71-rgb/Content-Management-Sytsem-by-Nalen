import React, { createContext, useContext } from 'react';

export const ContentModalContext = createContext<any>(null);

export const useContentModal = () => useContext(ContentModalContext);
