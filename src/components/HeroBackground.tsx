export default function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-[-5rem] top-10 h-32 w-32 rounded-[2rem] bg-blue-500 opacity-18 md:h-44 md:w-44" />
      <div className="absolute right-[10%] top-16 h-24 w-24 rounded-full bg-pink-500 opacity-16 md:h-36 md:w-36" />
      <div className="absolute bottom-20 left-[12%] h-20 w-20 rounded-full bg-yellow-300 opacity-28 md:h-28 md:w-28" />
      <div className="absolute bottom-[-2rem] right-[-2rem] h-40 w-40 rounded-[3rem] bg-green-500 opacity-16 md:h-56 md:w-56" />
    </div>
  );
}
