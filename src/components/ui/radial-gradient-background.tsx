interface RadialGradientBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export function RadialGradientBackground({
  children,
  className = '',
}: RadialGradientBackgroundProps) {
  return (
    <div
      className={`min-h-screen flex items-center justify-center relative overflow-hidden ${className}`}
    >
      {/* Base gradient background - enhanced light mode visibility */}
      <div className="absolute inset-0 bg-gradient-radial from-blue-100/90 via-purple-50/80 to-emerald-100/70 dark:from-slate-900/90 dark:via-blue-950/70 dark:to-indigo-950/50" />

      {/* Static background elements - no animations to prevent hydration issues */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Corner lights */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300/40 dark:bg-blue-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300/35 dark:bg-pink-400/15 rounded-full blur-3xl" />

        {/* Additional accent lights */}
        <div className="absolute top-1/3 left-1/4 w-60 h-60 bg-emerald-200/30 dark:bg-emerald-400/10 rounded-full blur-2xl" />
        <div className="absolute top-20 right-1/3 w-40 h-40 bg-cyan-200/35 dark:bg-cyan-400/12 rounded-full blur-xl" />
        <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-teal-200/30 dark:bg-teal-400/12 rounded-full blur-xl" />

        {/* Subtle center accents */}
        <div className="absolute top-1/4 right-1/4 w-24 h-24 bg-green-200/25 dark:bg-green-400/8 rounded-full blur-xl" />

        {/* Additional light mode accents */}
        <div className="absolute top-1/2 left-1/6 w-32 h-32 bg-violet-200/20 dark:bg-violet-400/6 rounded-full blur-2xl" />
        <div className="absolute bottom-1/3 right-1/6 w-28 h-28 bg-rose-200/25 dark:bg-rose-400/8 rounded-full blur-xl" />
      </div>

      {/* Center overlay - adjusted for better light mode contrast */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-slate-200/15 to-gray-300/10 dark:from-transparent dark:via-slate-950/30 dark:to-slate-900/10 pointer-events-none" />

      {/* Subtle noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.02] bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20256%20256%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cfilter%20id%3D%22noiseFilter%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.9%22%20numOctaves%3D%224%22%20stitchTiles%3D%22stitch%22/%3E%3C/filter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23noiseFilter)%22/%3E%3C/svg%3E')] pointer-events-none" />

      {/* Content with proper z-index and full width */}
      <div className="relative z-10 w-full flex items-center justify-center p-4">{children}</div>
    </div>
  );
}
