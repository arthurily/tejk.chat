import Image from "next/image";
import type { CSSProperties } from "react";
import { floatingPhotos } from "./photoConfig";

export default function Home() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 text-center">
      <div className="pointer-events-none absolute inset-0">
        {floatingPhotos.map((photo) => (
          <div
            key={`${photo.src}-${photo.top}-${photo.left}`}
            className="floating-photo-frame hold-photo-frame"
            style={
              {
                top: photo.top,
                left: photo.left,
                width: `${photo.size}px`,
                animationDelay: photo.delay,
                animationDuration: photo.duration,
                ["--drift-x" as const]: photo.driftX,
                ["--drift-y" as const]: photo.driftY,
                ["--photo-rotate" as const]: photo.rotate,
              } as CSSProperties
            }
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              width={photo.size}
              height={Math.round(photo.size * 1.25)}
              className="floating-photo"
            />
          </div>
        ))}
      </div>

      <section className="relative z-10 max-w-xl rounded-2xl border border-white/30 bg-white/15 p-8 text-white shadow-2xl backdrop-blur-md">
        <h1 className="text-3xl font-semibold">Tej is asleep</h1>
        <p className="mt-3 text-white/85">This website is currently down.</p>
      </section>
    </main>
  );
}
