export default function Logo({ className = "h-[22px]" }: { className?: string }) {
  return <img src="/logo.png" alt="SDING" className={`${className} w-auto`} />;
}
