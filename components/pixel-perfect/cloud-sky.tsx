const FADE = "linear-gradient(to bottom, #000, rgb(0 0 0 / 0.2) 66%, transparent)";

export default function CloudSky({ className }: { className?: string }) {
  return (
    <div aria-hidden className={`relative overflow-hidden bg-white ${className ?? ""}`}>
      <div className="absolute inset-0" style={{ maskImage: FADE, WebkitMaskImage: FADE }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/clouds/sky.png"
          alt=""
          className="absolute -top-[5%] -left-[5%] h-[110%] w-[110%] max-w-none object-cover blur-[12.5px]"
        />
      </div>
      <div className="absolute inset-0 shadow-[inset_0_0_54px_0_rgba(255,255,255,0.6)]" />
    </div>
  );
}
