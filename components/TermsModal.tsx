import React, { useState } from "react";
import { X } from "lucide-react";

interface TermsModalProps {
  title: string;
  content: string;
  onAccept: () => void;
  onClose: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({
  title,
  content,
  onAccept,
  onClose,
}) => {
  const [checked, setChecked] = useState(false);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col border border-white/10">

        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <h2 className="text-white font-black text-lg">{title}</h2>
          <button
            onClick={onClose}
            disabled={!checked}
            className="text-gray-400 hover:text-white disabled:opacity-40"
          >
            <X />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="p-6 overflow-y-auto text-sm text-gray-300 space-y-4">
          {content.split("\n").map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 space-y-4">
          <label className="flex items-start space-x-3 text-xs text-gray-300">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
            />
            <span>
              Ich habe den Inhalt gelesen und stimme zu.
            </span>
          </label>

          <button
            disabled={!checked}
            onClick={() => {
              onAccept();
              onClose();
            }}
            className="w-full bg-hey-church-orange-500 text-white font-black py-4 rounded-2xl disabled:opacity-50"
          >
            Akzeptieren & schließen
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;