import React from 'react';

export const PromoBanner: React.FC = () => {
  return (
    <section className="relative mt-4 mb-8 overflow-hidden rounded-3xl px-6 py-10 text-white shadow-2xl sm:px-10">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-[#150c2e] via-[#5b21b6] to-[#f472b6] opacity-95" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.35), transparent 45%), radial-gradient(circle at 80% 0%, rgba(249,168,212,0.4), transparent 40%)'
          }}
        />
      </div>
      <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur px-4 py-1.5 text-xs font-semibold rounded-full border border-white/20">
            <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" /> NEW ARRIVAL
          </span>
          <h2 className="text-3xl md:text-5xl font-black mt-5 leading-tight tracking-tight">
            OMG Fashion Weekend
          </h2>
          <p className="mt-4 text-sm md:text-base text-white/80 max-w-xl">
            Curated accessories, bold statements, and capsule outfits ready to ship worldwide. Save up to 70% on
            limited drops while stock lasts.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm font-semibold">
            <div className="bg-white/15 rounded-2xl px-5 py-3 border border-white/20">
              <p className="text-xs text-white/60 uppercase">Exclusive</p>
              <p className="text-lg">Limited Drops</p>
            </div>
            <div className="bg-white/15 rounded-2xl px-5 py-3 border border-white/20">
              <p className="text-xs text-white/60 uppercase">Up to</p>
              <p className="text-lg">70% OFF</p>
            </div>
            <div className="bg-white/15 rounded-2xl px-5 py-3 border border-white/20">
              <p className="text-xs text-white/60 uppercase">Ships</p>
              <p className="text-lg">48h Express</p>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-4">
            <button className="btn-order px-8 py-3 rounded-full font-bold shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
              Explore Collection
            </button>
            <button className="px-8 py-3 rounded-full font-bold border-2 border-white/60 text-white hover:bg-white/10">
              Watch Lookbook
            </button>
          </div>
        </div>
        <div className="hidden md:flex justify-center">
          <div className="relative w-72 h-72">
            <div className="absolute -inset-6 bg-theme-gradient opacity-40 blur-3xl" aria-hidden />
            <div className="relative bg-white/10 border border-white/20 rounded-[32px] h-full w-full backdrop-blur-md p-6 flex flex-col justify-between">
              <div>
                <p className="text-xs text-white/60">Feature Drop</p>
                <p className="text-2xl font-bold">Neon Bloom Set</p>
                <p className="text-sm text-white/70">Starting at ৳2,990</p>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div
                  className="w-40 h-40 rounded-full overflow-hidden border-4 border-white/30 shadow-2xl"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&q=80&w=960')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <div>
                  <p className="text-xs text-white/60">Colorways</p>
                  <p className="font-semibold">6 curated</p>
                </div>
                <div>
                  <p className="text-xs text-white/60">Sizes</p>
                  <p className="font-semibold">XS - XL</p>
                </div>
                <div>
                  <p className="text-xs text-white/60">Stock</p>
                  <p className="font-semibold text-emerald-300">In stock</p>
                </div>
              </div>
            </div>
            <div className="absolute -right-8 -bottom-6 bg-white/10 border border-white/20 backdrop-blur rounded-2xl px-4 py-3 text-sm font-semibold">
              <p className="text-xs text-white/60">Early Access</p>
              <p>500 VIP slots</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
