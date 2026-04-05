import Link from "next/link";

export default function Header() {
  return (
    <>
      <header className="flex fixed gap-12 top-8 left-1/2 -translate-1/2 h-16 items-center justify-between px-6 text-white font-host z-20">
        <div className="text-xl font-bold">AI Companion</div>
        <nav className="flex gap-4">
          <a
            href="#"
            className="hover:text-gray-300 transition-colors duration-300"
          >
            Home
          </a>
          <a
            href="#"
            className="hover:text-gray-300 transition-colors duration-300"
          >
            Features
          </a>
          <a
            href="#"
            className="hover:text-gray-300 transition-colors duration-300"
          >
            Contact
          </a>
        </nav>
        <Link href="/login" className="text-white cursor-pointer font-medium">
          Get Started
        </Link>
      </header>
    </>
  );
}
