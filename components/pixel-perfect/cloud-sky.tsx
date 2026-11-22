export interface CloudSkyProps {
  className?: string;
  src?: string;
  fade?: boolean;
  blur?: boolean;
}

export default function CloudSky({
  className,
  src = "/clouds/sky.png",
  fade = false,
  blur = false,
}: CloudSkyProps) {
  const FADE = "linear-gradient(to bottom, #000, rgb(0 0 0 / 0.2) 66%, transparent)";

  return (
    <div aria-hidden className={`overflow-hidden ${className ?? "relative"}`}>
      <div
        className="absolute inset-0 h-full w-full"
        style={fade ? { maskImage: FADE, WebkitMaskImage: FADE } : undefined}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover object-center ${blur ? "blur-[12.5px]" : ""}`}
        />
      </div>
      {fade && (
        <div className="absolute inset-0 shadow-[inset_0_0_54px_0_rgba(255,255,255,0.6)]" />
      )}
    </div>
  );
}
