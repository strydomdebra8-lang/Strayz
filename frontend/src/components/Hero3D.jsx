// Pure CSS 3D treasure chest — no extra deps, no React version conflicts.
// Uses CSS transform/perspective for a real 3D feel.
import { useEffect, useState } from "react";

export default function Hero3D() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const loop = () => {
      setTick((performance.now() - start) / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const rotY = tick * 35; // deg
  const float = Math.sin(tick * 1.6) * 14;

  return (
    <div
      className="w-full h-56 sm:h-64 lg:h-72 rounded-3xl border-4 border-slate-800 tactile-shadow-lg overflow-hidden relative"
      style={{
        background:
          "radial-gradient(circle at 30% 20%, #FEF3C7 0%, #FBBF24 60%, #FB923C 100%)",
        perspective: "900px",
        perspectiveOrigin: "50% 60%",
      }}
      data-testid="hero-3d"
    >
      {/* Sparkles */}
      {Array.from({ length: 12 }).map((_, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: `${4 + (i % 4)}px`,
            height: `${4 + (i % 4)}px`,
            left: `${(i * 53) % 100}%`,
            top: `${(i * 37) % 100}%`,
            opacity: 0.6 + Math.sin(tick * 2 + i) * 0.4,
            boxShadow: "0 0 8px #fff",
          }}
        />
      ))}

      {/* Floating coin orbit */}
      <div
        className="absolute left-1/2 top-1/2"
        style={{
          transformStyle: "preserve-3d",
          transform: `translate(-50%, -50%) rotateY(${rotY * 1.4}deg)`,
        }}
      >
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * 360;
          return (
            <div
              key={i}
              className="absolute w-7 h-7 rounded-full"
              style={{
                left: -14,
                top: -14,
                background:
                  "radial-gradient(circle at 30% 30%, #FCD34D, #B45309)",
                border: "2px solid #1E293B",
                transform: `rotateY(${angle}deg) translateZ(150px)`,
              }}
            />
          );
        })}
      </div>

      {/* Treasure chest */}
      <div
        className="absolute left-1/2 top-1/2"
        style={{
          transformStyle: "preserve-3d",
          transform: `translate(-50%, calc(-50% + ${float}px)) rotateX(-15deg) rotateY(${rotY}deg)`,
        }}
      >
        {/* Front */}
        <div
          className="absolute w-[180px] h-[110px] border-4 border-slate-900 rounded-b-2xl"
          style={{
            left: -90,
            top: -55,
            background:
              "linear-gradient(180deg, #FB923C 0%, #C2410C 100%)",
            transform: "translateZ(60px)",
          }}
        >
          <div className="absolute left-1/2 -translate-x-1/2 top-3 w-12 h-12 rounded-lg border-2 border-slate-900 bg-amber-300 flex items-center justify-center font-display font-bold text-slate-900">
            S
          </div>
          <div className="absolute left-3 top-3 bottom-3 w-2 bg-slate-900 rounded-full" />
          <div className="absolute right-3 top-3 bottom-3 w-2 bg-slate-900 rounded-full" />
        </div>
        {/* Back */}
        <div
          className="absolute w-[180px] h-[110px] border-4 border-slate-900 rounded-b-2xl"
          style={{
            left: -90,
            top: -55,
            background:
              "linear-gradient(180deg, #C2410C 0%, #7C2D12 100%)",
            transform: "translateZ(-60px) rotateY(180deg)",
          }}
        />
        {/* Left side */}
        <div
          className="absolute w-[120px] h-[110px] border-4 border-slate-900"
          style={{
            left: -60,
            top: -55,
            background:
              "linear-gradient(90deg, #9A3412 0%, #FB923C 100%)",
            transform: "rotateY(-90deg) translateZ(90px)",
          }}
        />
        {/* Right side */}
        <div
          className="absolute w-[120px] h-[110px] border-4 border-slate-900"
          style={{
            left: -60,
            top: -55,
            background:
              "linear-gradient(90deg, #FB923C 0%, #9A3412 100%)",
            transform: "rotateY(90deg) translateZ(90px)",
          }}
        />
        {/* Lid */}
        <div
          className="absolute w-[180px] h-[44px] border-4 border-slate-900 rounded-t-2xl"
          style={{
            left: -90,
            top: -100,
            background:
              "linear-gradient(180deg, #F472B6 0%, #BE185D 100%)",
            transform: "translateZ(60px)",
          }}
        >
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-8 h-2 rounded-full bg-amber-400 border-2 border-slate-900" />
        </div>
        {/* Lid back */}
        <div
          className="absolute w-[180px] h-[44px] border-4 border-slate-900 rounded-t-2xl"
          style={{
            left: -90,
            top: -100,
            background:
              "linear-gradient(180deg, #BE185D 0%, #831843 100%)",
            transform: "translateZ(-60px) rotateY(180deg)",
          }}
        />
        {/* Top */}
        <div
          className="absolute w-[180px] h-[120px] border-4 border-slate-900"
          style={{
            left: -90,
            top: -98,
            background:
              "linear-gradient(180deg, #F472B6 0%, #FB7185 100%)",
            transform: "rotateX(90deg) translateZ(22px)",
          }}
        />
      </div>

      {/* Glow */}
      <div
        className="absolute left-1/2 bottom-3 -translate-x-1/2 w-40 h-3 rounded-full"
        style={{
          background: "radial-gradient(ellipse, rgba(0,0,0,0.35), transparent 70%)",
        }}
      />

      {/* Label */}
      <span className="absolute bottom-3 left-1/2 -translate-x-1/2 font-accent text-slate-900 bg-amber-200/90 border-2 border-slate-900 rounded-full px-3 py-0.5 text-xs">
        3D Teaser
      </span>
    </div>
  );
}
