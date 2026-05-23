import React, { useState } from 'react';

const SnapCookJoin = () => {
  const [adventurousLevel, setAdventurousLevel] = useState('Surprise Me');

  return (
    <div className="min-h-screen bg-[#ecebe4] flex items-center justify-center p-4 font-sans">
      {/* Main Container */}
      <div className="w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[650px]">
        
        {/* Left Panel: Brand & Illustration */}
        <div className="w-full md:w-1/2 bg-[#2d4038] p-12 flex flex-col justify-between text-[#d1dcd4]">
          {/* Top: Brand Section */}
          <div className="flex flex-col items-start gap-4">
            <div className="w-12 h-12">
              {/* Minimalist Spatula Icon */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full text-[#6b8e76]">
                <path d="M7 2h10v4H7V2zM12 6v16M9 22h6" strokeLinecap="round" />
                <path d="M10 6c0 4 0 4-2 6" strokeLinecap="round" />
              </svg>
            </div>
            <h1 className="text-3xl font-serif tracking-tight text-white">SnapCook</h1>
          </div>

          {/* Bottom: Rustic Line Art */}
          <div className="relative h-48 mt-12 opacity-40">
            <svg viewBox="0 0 200 100" className="w-full h-full text-[#6b8e76]">
              {/* Minimalist Rosemary Plant */}
              <path d="M160 80c0-20 5-30 15-40M160 80c-10-15-10-35 0-50M160 60c5-5 15-5 20-2" stroke="currentColor" strokeWidth="1" fill="none" />
              {/* Plates and Cutlery */}
              <circle cx="50" cy="70" r="25" stroke="currentColor" strokeWidth="1" fill="none" />
              <circle cx="50" cy="70" r="18" stroke="currentColor" strokeWidth="0.5" fill="none" />
              <path d="M85 50v40M92 50v40M15 50v40M8 50v40" stroke="currentColor" strokeWidth="1" />
            </svg>
          </div>
        </div>

        {/* Right Panel: Form & Details */}
        <div className="w-full md:w-1/2 bg-[#F9F8F3] p-10 md:p-16 flex flex-col justify-center">
          
          {/* Header Section */}
          <div className="mb-10 flex justify-between items-start">
            <div>
              <h2 className="text-[#2d4038] text-xs font-bold tracking-widest uppercase mb-2">Welcome to SnapCook.</h2>
              <p className="text-[#5c6b63] text-sm italic">A Community for Foodies and Adventurous Cooks.</p>
            </div>
            <div className="text-right text-[10px] text-[#8a968e] font-medium leading-tight uppercase tracking-tighter">
              <p>March 12 • 8 PM</p>
              <p>A Cozy Local Bistro</p>
            </div>
          </div>

          {/* Form */}
          <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
            <div className="relative">
              <label className="text-[10px] font-bold text-[#8a968e] uppercase absolute -top-5">Full Name</label>
              <input 
                type="text" 
                className="w-full bg-transparent border-b border-[#d1dcd4] py-2 outline-none focus:border-[#2d4038] transition-colors text-[#2d4038]" 
                placeholder="e.g. Julian Casablancas"
              />
            </div>

            <div className="relative">
              <label className="text-[10px] font-bold text-[#8a968e] uppercase absolute -top-5">Email adress</label>
              <input 
                type="email" 
                className="w-full bg-transparent border-b border-[#d1dcd4] py-2 outline-none focus:border-[#2d4038] transition-colors text-[#2d4038]" 
                placeholder="hello@snapcook.com"
              />
            </div>

            {/* Interactive Segment */}
            <div className="py-4">
              <h3 className="text-xs font-bold text-[#2d4038] uppercase mb-6 tracking-wide">How adventurous are you with food?</h3>
              <div className="flex justify-between items-center px-2">
                
                {/* Curious */}
                <button 
                  type="button"
                  onClick={() => setAdventurousLevel('Curious')}
                  className={`flex flex-col items-center gap-2 group transition-opacity ${adventurousLevel === 'Curious' ? 'opacity-100' : 'opacity-40'}`}
                >
                  <svg className="w-6 h-6 text-[#2d4038]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 2v10m0 0a4 4 0 100 8 4 4 0 000-8zM8 10h8" />
                  </svg>
                  <span className={`text-[10px] font-bold uppercase ${adventurousLevel === 'Curious' ? 'border-b-2 border-[#2d4038]' : ''}`}>Curious</span>
                </button>

                {/* Adventurous */}
                <button 
                  type="button"
                  onClick={() => setAdventurousLevel('Adventurous')}
                  className={`flex flex-col items-center gap-2 transition-opacity ${adventurousLevel === 'Adventurous' ? 'opacity-100' : 'opacity-40'}`}
                >
                  <svg className="w-6 h-6 text-[#2d4038]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zM12 8v8M8 12h8" />
                  </svg>
                  <span className={`text-[10px] font-bold uppercase ${adventurousLevel === 'Adventurous' ? 'border-b-2 border-[#2d4038]' : ''}`}>Adventurous</span>
                </button>

                {/* Surprise Me */}
                <button 
                  type="button"
                  onClick={() => setAdventurousLevel('Surprise Me')}
                  className={`flex flex-col items-center gap-2 transition-opacity ${adventurousLevel === 'Surprise Me' ? 'opacity-100' : 'opacity-40'}`}
                >
                  <svg className="w-6 h-6 text-[#2d4038]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="4" y="4" width="16" height="16" rx="2" strokeWidth="1.5" />
                    <circle cx="8.5" cy="8.5" r="1" fill="currentColor" />
                    <circle cx="15.5" cy="15.5" r="1" fill="currentColor" />
                    <circle cx="12" cy="12" r="1" fill="currentColor" />
                  </svg>
                  <span className={`text-[10px] font-bold uppercase ${adventurousLevel === 'Surprise Me' ? 'border-b-2 border-[#2d4038]' : ''}`}>Surprise Me</span>
                </button>

              </div>
            </div>

            {/* Call to Action */}
            <div className="flex flex-col items-center pt-6">
              <button className="bg-[#6b8e76] hover:bg-[#5a7a64] text-white px-10 py-3 rounded-full text-sm font-semibold tracking-wide transition-all shadow-lg hover:shadow-xl active:scale-95">
                Join the Cook-off
              </button>
              <p className="mt-4 text-[10px] text-[#8a968e] font-medium uppercase tracking-widest">
                Only 12 spots available
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Styles for font consistency if Inter isn't loaded elsewhere */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&display=swap');
        .font-serif {
          font-family: 'Playfair Display', serif;
        }
      `}</style>
    </div>
  );
};

export default SnapCookJoin;