"use client";

import { useEffect, useState } from "react";
import { 
  Accessibility, 
  Type, 
  Contrast, 
  Eye, 
  EyeOff, 
  BookOpen,
  Palette,
  RotateCcw,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import '@/styles/accessibility.css';

const contrastModes = [
  { value: "", label: "Normal" },
  { value: "contrast-black-white", label: "Black & White" },
  { value: "contrast-yellow-black", label: "Yellow on Black" },
  { value: "contrast-blue-yellow", label: "Blue on Yellow" },
];

const AccessibilityToolbar = () => {
  const [hasMounted, setHasMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [contrastIndex, setContrastIndex] = useState(0);
  const [dyslexia, setDyslexia] = useState(false);
  const [hideImages, setHideImages] = useState(false);
  const [fontSize, setFontSize] = useState(100); // 100, 125, 150
  const [reducedColor, setReducedColor] = useState(false);

  useEffect(() => {
    setHasMounted(true);

    // Load saved preferences
    const storedContrast = localStorage.getItem("contrast");
    const index = contrastModes.findIndex(mode => mode.value === storedContrast);
    if (index >= 0) {
      setContrastIndex(index);
      if (storedContrast) document.documentElement.classList.add(storedContrast);
    }

    const savedFontSize = parseInt(localStorage.getItem("fontSize") || "100");
    if (savedFontSize !== 100) {
      setFontSize(savedFontSize);
      document.documentElement.style.fontSize = `${savedFontSize}%`;
    }

    const savedDyslexia = localStorage.getItem("dyslexia") === "true";
    if (savedDyslexia) {
      setDyslexia(true);
      document.documentElement.classList.add("dyslexia-font");
    }

    const savedHideImages = localStorage.getItem("hideImages") === "true";
    if (savedHideImages) {
      setHideImages(true);
      document.documentElement.classList.add("hide-images");
    }

    const savedReducedColor = localStorage.getItem("reducedColor") === "true";
    if (savedReducedColor) {
      setReducedColor(true);
      document.documentElement.classList.add("reduced-color");
    }
  }, []);

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  if (!hasMounted) return null;

  const handleToggleContrast = () => {
    const current = contrastModes[contrastIndex].value;
    if (current) document.documentElement.classList.remove(current);

    const nextIndex = (contrastIndex + 1) % contrastModes.length;
    const nextClass = contrastModes[nextIndex].value;

    if (nextClass) document.documentElement.classList.add(nextClass);
    setContrastIndex(nextIndex);
    localStorage.setItem("contrast", nextClass);
  };

  const handleFontSizeToggle = () => {
    const sizes = [100, 125, 150];
    const currentIdx = sizes.indexOf(fontSize);
    const nextIdx = (currentIdx + 1) % sizes.length;
    const newSize = sizes[nextIdx];
    
    setFontSize(newSize);
    document.documentElement.style.fontSize = `${newSize}%`;
    localStorage.setItem("fontSize", newSize.toString());
  };

  const handleToggleDyslexiaFont = () => {
    const enabled = !dyslexia;
    setDyslexia(enabled);
    document.documentElement.classList.toggle("dyslexia-font", enabled);
    localStorage.setItem("dyslexia", enabled.toString());
  };

  const handleToggleImages = () => {
    const enabled = !hideImages;
    setHideImages(enabled);
    document.documentElement.classList.toggle("hide-images", enabled);
    localStorage.setItem("hideImages", enabled.toString());
  };

  const handleToggleReducedColor = () => {
    const enabled = !reducedColor;
    setReducedColor(enabled);
    document.documentElement.classList.toggle("reduced-color", enabled);
    localStorage.setItem("reducedColor", enabled.toString());
  };

  const handleReset = () => {
    localStorage.removeItem("contrast");
    localStorage.removeItem("fontSize");
    localStorage.removeItem("dyslexia");
    localStorage.removeItem("hideImages");
    localStorage.removeItem("reducedColor");
    
    setContrastIndex(0);
    setDyslexia(false);
    setHideImages(false);
    setFontSize(100);
    setReducedColor(false);

    document.documentElement.classList.remove(
      "contrast-black-white",
      "contrast-yellow-black",
      "contrast-blue-yellow",
      "dyslexia-font",
      "hide-images",
      "reduced-color"
    );
    document.documentElement.style.fontSize = "100%";
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 flex items-center justify-center group"
        aria-label={isOpen ? "Close accessibility menu" : "Open accessibility menu"}
        aria-expanded={isOpen}
      >
        <Accessibility className="w-6 h-6" />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div 
          className="absolute top-16 right-0 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden animate-in slide-in-from-top-2 duration-200"
          role="dialog"
          aria-label="Accessibility options"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Accessibility className="w-5 h-5" />
              <h2 className="font-semibold text-lg">Accessibility</h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-blue-500 rounded p-1 transition-colors"
              aria-label="Close menu"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
          </div>

          {/* Options */}
          <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
            {/* Text Size */}
            <button
              onClick={handleFontSizeToggle}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${
                fontSize !== 100
                  ? "border-blue-600 bg-blue-50 text-blue-900"
                  : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
              }`}
            >
              <Type className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1 text-left">
                <div className="font-medium">Text Size</div>
                <div className="text-sm text-gray-600">{fontSize}% {fontSize === 100 ? "(Normal)" : fontSize === 125 ? "(Large)" : "(Extra Large)"}</div>
              </div>
            </button>

            {/* Contrast */}
            <button
              onClick={handleToggleContrast}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${
                contrastIndex !== 0
                  ? "border-blue-600 bg-blue-50 text-blue-900"
                  : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
              }`}
            >
              <Contrast className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1 text-left">
                <div className="font-medium">Contrast Mode</div>
                <div className="text-sm text-gray-600">{contrastModes[contrastIndex].label}</div>
              </div>
            </button>

            {/* Dyslexia Font */}
            <button
              onClick={handleToggleDyslexiaFont}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${
                dyslexia
                  ? "border-blue-600 bg-blue-50 text-blue-900"
                  : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
              }`}
            >
              <BookOpen className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1 text-left">
                <div className="font-medium">Dyslexia-Friendly Font</div>
                <div className="text-sm text-gray-600">{dyslexia ? "Enabled" : "Disabled"}</div>
              </div>
            </button>

            {/* Hide Images */}
            <button
              onClick={handleToggleImages}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${
                hideImages
                  ? "border-blue-600 bg-blue-50 text-blue-900"
                  : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
              }`}
            >
              {hideImages ? (
                <EyeOff className="w-5 h-5 flex-shrink-0" />
              ) : (
                <Eye className="w-5 h-5 flex-shrink-0" />
              )}
              <div className="flex-1 text-left">
                <div className="font-medium">Images</div>
                <div className="text-sm text-gray-600">{hideImages ? "Hidden" : "Visible"}</div>
              </div>
            </button>

            {/* Reduced Color */}
            <button
              onClick={handleToggleReducedColor}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${
                reducedColor
                  ? "border-blue-600 bg-blue-50 text-blue-900"
                  : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
              }`}
            >
              <Palette className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1 text-left">
                <div className="font-medium">Reduce Colors</div>
                <div className="text-sm text-gray-600">{reducedColor ? "Enabled" : "Disabled"}</div>
              </div>
            </button>
          </div>

          {/* Footer - Reset Button */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <button
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset All Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessibilityToolbar;