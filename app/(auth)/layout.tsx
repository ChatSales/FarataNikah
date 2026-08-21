import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-primary-50/60 px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2 font-semibold text-primary-800"
        >
          <Image src="/farata-icon.png" alt="" width={40} height={40} className="h-9 w-9" priority />
          <span className="text-xl tracking-tight">FarataNikah</span>
        </Link>
        <div className="rounded-2xl border border-primary-100 bg-cream-50 p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
