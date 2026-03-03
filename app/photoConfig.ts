export type FloatingPhoto = {
  src: string;
  alt: string;
  top: string;
  left: string;
  size: number;
  delay: string;
  duration: string;
  rotate: string;
  driftX: string;
  driftY: string;
};

// Add your image files in /public/photos and then add entries here.
// Example src values: "/photos/tej-1.jpg", "/photos/friends.png"
export const floatingPhotos: FloatingPhoto[] = [
  {
    src: "/photos/tej1.jpeg",
    alt: "Tej portrait 1",
    top: "8%",
    left: "6%",
    size: 320,
    delay: "0s",
    duration: "26s",
    rotate: "-5deg",
    driftX: "16vw",
    driftY: "9vh",
  },
  {
    src: "/photos/tej2.jpg",
    alt: "Tej portrait 2",
    top: "36%",
    left: "2%",
    size: 290,
    delay: "0.6s",
    duration: "30s",
    rotate: "-3deg",
    driftX: "22vw",
    driftY: "-8vh",
  },
  {
    src: "/photos/tej3.png",
    alt: "Tej portrait 3",
    top: "14%",
    left: "70%",
    size: 340,
    delay: "1.2s",
    duration: "28s",
    rotate: "4deg",
    driftX: "-18vw",
    driftY: "10vh",
  },
  {
    src: "/photos/tej4.jpeg",
    alt: "Tej portrait 4",
    top: "64%",
    left: "10%",
    size: 300,
    delay: "0.8s",
    duration: "31s",
    rotate: "-2deg",
    driftX: "14vw",
    driftY: "-10vh",
  },
  {
    src: "/photos/tej5.jpeg",
    alt: "Tej portrait 5",
    top: "70%",
    left: "70%",
    size: 285,
    delay: "1.6s",
    duration: "27s",
    rotate: "3deg",
    driftX: "-12vw",
    driftY: "-7vh",
  },
  {
    src: "/photos/tej6.jpg",
    alt: "Tej portrait 6",
    top: "2%",
    left: "40%",
    size: 310,
    delay: "0.4s",
    duration: "34s",
    rotate: "2deg",
    driftX: "-10vw",
    driftY: "11vh",
  },
  {
    src: "/photos/tej7.jpg",
    alt: "Tej portrait 7",
    top: "54%",
    left: "42%",
    size: 295,
    delay: "1.1s",
    duration: "29s",
    rotate: "-4deg",
    driftX: "12vw",
    driftY: "8vh",
  },
];
