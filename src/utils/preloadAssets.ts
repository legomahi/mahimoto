export function preloadAssets(urls: string[]): Promise<void> {
  return Promise.all(
    urls.map(url => {
      if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
        return new Promise(resolve => {
          const img = new window.Image();
          img.src = url;
          img.onload = resolve;
          img.onerror = resolve;
        });
      } else if (url.match(/\.(mp4|webm|ogg)$/i)) {
        return new Promise(resolve => {
          const video = document.createElement('video');
          video.src = url;
          video.onloadeddata = resolve;
          video.onerror = resolve;
        });
      }
      // If not image or video, resolve immediately
      return Promise.resolve();
    })
  ).then(() => undefined);
} 