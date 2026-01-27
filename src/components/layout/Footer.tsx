export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="text-gray-400 bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Single line on desktop, stacked on mobile */}
        <div className="flex flex-col md:flex-row md:justify-center md:items-center md:space-x-8 space-y-2 md:space-y-0 text-center">
          <p className="text-xs md:text-sm">
            © {currentYear} RoadTech. All rights reserved.
          </p>
          <p className="text-sm text-gray-500 font-nunito">
            Made with <span className="text-red-500 heart-soft">❤</span>  to keep you moving safely
          </p>
        </div>
      </div>
    </footer>
  );
}