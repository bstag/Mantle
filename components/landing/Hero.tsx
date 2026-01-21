import React from 'react';

const Hero: React.FC = () => {
  return (
    <div className="text-center mb-16 space-y-4 animate-fade-in-up">
      <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-main via-accent to-muted font-serif pb-2 leading-tight">
        Weave Your Mantle.
      </h1>
      <p className="text-xl text-muted max-w-2xl mx-auto font-light leading-relaxed">
        Your code is the muscle; your brand is the Mantle. 
        Establish the regal "coat" your application wears for every season.
      </p>
    </div>
  );
};

export default Hero;
