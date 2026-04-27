import Link from "next/link";
import { CheckCircle, MessageCircle, ArrowLeft } from "lucide-react";

export default function ThanksPage() {
  return (
    <main className="min-h-screen bg-pink-50 flex items-center justify-center px-6">

      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center space-y-6">

        {/* Icon */}
        <div className="flex justify-center">
          <div className="bg-green-100 text-green-600 p-4 rounded-full">
            <CheckCircle size={40} />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-semibold text-gray-800">
          Order Received 
        </h1>

        {/* Text */}
        <p className="text-gray-600 text-sm">
          Thank you for your order. Our team will contact you shortly on WhatsApp to confirm details.
        </p>

        {/* WhatsApp CTA */}
        <a
          href="https://wa.me/2126XXXXXXXX"
          target="_blank"
          className="group relative flex items-center justify-center gap-2 w-full bg-green-500 text-white py-3 rounded-lg font-medium transition-all duration-300 hover:bg-green-600 hover:shadow-lg"
        >
          <MessageCircle size={18} />
          Contact us on WhatsApp

          {/* shine effect */}
          <span className="absolute top-0 left-[-75%] h-full w-1/2 bg-white/30 skew-x-[-20deg] transition-all duration-700 group-hover:left-[125%]"></span>
        </a>

        {/* Back home */}
        <Link
          href="/"
          className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-pink-500 transition"
        >
          <ArrowLeft size={16} />
          Back to home
        </Link>

      </div>

    </main>
  );
}