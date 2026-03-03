export type FloatingPhoto = {
  src: string;
  alt: string;
  top: string;
  left: string;
  size: number;
  delay: string;
  duration: string;
  rotate: string;
};

// Add your image files in /public/photos and then add entries here.
// Example src values: "/photos/tej-1.jpg", "/photos/friends.png"
export const floatingPhotos: FloatingPhoto[] = [];
