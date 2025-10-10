import { createContext, useContext, useRef } from 'react';

const ImageCacheContext = createContext();

export function ImageCacheProvider({ children }) {
  const cacheRef = useRef(new Map());
  return (
    <ImageCacheContext.Provider value={cacheRef.current}>
      {children}
    </ImageCacheContext.Provider>
  );
}

export function useImageCache() {
  return useContext(ImageCacheContext);
}