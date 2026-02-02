import React, { useState, useEffect } from 'react';
import { X, Coffee, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import donateQrCode from '@/assets/images/donate-qr.jpg';

interface DonationPopupProps {
  onClose: () => void;
}

export const DonationPopup: React.FC<DonationPopupProps> = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isVisible ? 'bg-black/60 backdrop-blur-sm' : 'bg-transparent'
      }`}
      onClick={handleClose}
    >
      <div 
        className={`relative bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          data-testid="button-close-donate"
        >
          <X size={18} className="text-gray-600" />
        </button>

        <div className="bg-gradient-to-br from-amber-100 to-orange-100 p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Coffee className="text-amber-600" size={24} />
            <Heart className="text-red-500 animate-pulse" size={20} />
          </div>
          <h2 className="text-2xl font-bold text-amber-800 font-display">គាំទ្រពួកយើង</h2>
          <p className="text-amber-700 text-sm mt-1">Support Our Work</p>
        </div>

        <div className="p-6 flex flex-col items-center">
          <div className="bg-white p-3 rounded-2xl shadow-lg border border-gray-100 mb-4">
            <img 
              src={donateQrCode} 
              alt="Donation QR Code" 
              className="w-48 h-48 object-contain"
              data-testid="img-donate-qr"
            />
          </div>
          
          <div className="text-center">
            <p className="text-lg font-bold text-gray-800 flex items-center gap-2 justify-center">
              <Coffee size={20} className="text-amber-600" />
              Donate me a coffee
              <Coffee size={20} className="text-amber-600" />
            </p>
            <p className="text-sm text-gray-500 mt-2">
              ស្កេន QR code ដើម្បីបរិច្ចាគ
            </p>
          </div>

          <Button 
            variant="outline" 
            className="mt-6 w-full border-gray-300 text-gray-600 hover:bg-gray-50"
            onClick={handleClose}
            data-testid="button-skip-donate"
          >
            រំលង / Skip
          </Button>
        </div>
      </div>
    </div>
  );
};
