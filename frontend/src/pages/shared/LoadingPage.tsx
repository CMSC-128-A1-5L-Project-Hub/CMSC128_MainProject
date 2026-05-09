import React, { useState, useEffect, useCallback } from 'react';

const UbleLoader: React.FC = () => {
  const [circles, setCircles] = useState<
    { id: number; x: number; y: number; size: number; delay: number; duration: number; popped: boolean; isGolden: boolean }[]
  >([]);
  const [splashes, setSplashes] = useState<{ id: number; x: number; y: number; particleSize: number; angle: number; color: string; isGolden: boolean }[]>([]);
  const [funFact, setFunFact] = useState('');
  const [goldenPopped, setGoldenPopped] = useState(false);

  const funFacts = [
    'Bananas are berries, but strawberries aren\'t',
    'Octopuses have three hearts',
    'A day on Venus is longer than a year on Venus',
    'Honey never spoils — ever',
    'Sharks existed before trees did',
    'There are more stars in the universe than grains of sand on Earth',
    'Your brain uses 20% of your body\'s oxygen',
    'Wombat poop is cube-shaped',
    'A group of flamingos is called a "flamboyance"',
    'Hot water freezes faster than cold water sometimes',
    'Cows have best friends and get stressed when separated',
    'The Eiffel Tower grows 6 inches in summer',
    'Bubble wrap was originally meant to be wallpaper',
    'A single cloud can weigh over a million pounds',
    'Scotland\'s national animal is the unicorn',
    'Sloths can hold their breath longer than dolphins',
    'Humans share 60% of their DNA with bananas',
  ];

  const splashColors = ['#3D0718', '#6B0F2B', '#B5344F', '#C02942', '#E8A0AA', '#F9E8EC'];
  const goldenSplashColors = ['#FFD700', '#FFC800', '#FFB800', '#FFE44D', '#FFF3B0', '#FFA000', '#FFCC00'];

  const getPosition = () => {
    const side = Math.floor(Math.random() * 4);
    let x: number, y: number;

    switch (side) {
      case 0:
        x = 10 + Math.random() * 80;
        y = 5 + Math.random() * 25;
        break;
      case 1:
        x = 10 + Math.random() * 80;
        y = 70 + Math.random() * 25;
        break;
      case 2:
        x = 5 + Math.random() * 25;
        y = 10 + Math.random() * 80;
        break;
      case 3:
        x = 70 + Math.random() * 25;
        y = 10 + Math.random() * 80;
        break;
      default:
        x = 10 + Math.random() * 80;
        y = 10 + Math.random() * 35;
    }

    return { x, y };
  };

  useEffect(() => {
    const initial = Array.from({ length: 3 }, () => {
      const { x, y } = getPosition();
      const isGolden = Math.random() < 0.001; // 1 in 1000 chance
      return {
        id: Date.now() + Math.random(),
        x,
        y,
        size: isGolden ? 45 + Math.random() * 20 : 30 + Math.random() * 40,
        delay: Math.random() * 5,
        duration: 4 + Math.random() * 4,
        popped: false,
        isGolden,
      };
    });
    setCircles(initial);
  }, []);

  useEffect(() => {
    const randomFact = funFacts[Math.floor(Math.random() * funFacts.length)];
    setFunFact(randomFact);
    const interval = setInterval(() => {
      const newFact = funFacts[Math.floor(Math.random() * funFacts.length)];
      setFunFact(newFact);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const popCircle = useCallback((id: number, x: number, y: number, isGolden: boolean) => {
    setCircles(prev => prev.map(c => c.id === id ? { ...c, popped: true } : c));

    if (isGolden) {
      setGoldenPopped(true);
      setTimeout(() => setGoldenPopped(false), 2000);
    }

    // Golden circles get more particles + sparkle
    const particleCount = isGolden ? 16 : 6;
    const colors = isGolden ? goldenSplashColors : splashColors;
    
    const newSplashes = Array.from({ length: particleCount }, (_, i) => ({
      id: Date.now() + i,
      x,
      y,
      particleSize: isGolden ? 4 + Math.random() * 12 : 3 + Math.random() * 7,
      angle: (i / particleCount) * 360 + Math.random() * (isGolden ? 10 : 25),
      color: colors[Math.floor(Math.random() * colors.length)],
      isGolden,
    }));
    setSplashes(prev => [...prev, ...newSplashes]);

    const cleanupDelay = isGolden ? 1200 : 700;
    setTimeout(() => {
      setSplashes(prev => prev.filter(s => !newSplashes.includes(s)));
    }, cleanupDelay);

    const respawnDelay = isGolden ? 800 : 500;
    setTimeout(() => {
      const { x: newX, y: newY } = getPosition();
      const newIsGolden = Math.random() < 0.001;
      setCircles(prev =>
        prev.map(c =>
          c.id === id
            ? {
                ...c,
                x: newX,
                y: newY,
                size: newIsGolden ? 45 + Math.random() * 20 : 30 + Math.random() * 40,
                delay: 0,
                duration: 4 + Math.random() * 4,
                popped: false,
                isGolden: newIsGolden,
              }
            : c
        )
      );
    }, respawnDelay);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-8 min-h-screen bg-white relative overflow-hidden">
      {/* Floating circles */}
      {circles.map(circle => (
        <React.Fragment key={circle.id}>
          {!circle.popped && (
            <button
              onClick={() => popCircle(circle.id, circle.x, circle.y, circle.isGolden)}
              className={`absolute rounded-full cursor-pointer hover:scale-110 active:scale-95 transition-transform ${
                circle.isGolden ? 'animate-golden-glow' : ''
              }`}
              style={{
                left: `${circle.x}%`,
                top: `${circle.y}%`,
                width: `${circle.size}px`,
                height: `${circle.size}px`,
                background: circle.isGolden
                  ? 'radial-gradient(circle, #FFF3B0, #FFD700, #FFA000)'
                  : circle.size > 45
                  ? 'radial-gradient(circle, #E8A0AA, #B5344F)'
                  : 'radial-gradient(circle, #B5344F, #6B0F2B)',
                opacity: circle.isGolden ? 0.3 : 0.12,
                animation: circle.isGolden
                  ? `golden-float ${circle.duration}s ease-in-out ${circle.delay}s infinite`
                  : `float ${circle.duration}s ease-in-out ${circle.delay}s infinite`,
                filter: circle.isGolden ? 'blur(0px)' : 'blur(0.5px)',
                boxShadow: circle.isGolden ? '0 0 20px rgba(255, 215, 0, 0.4), 0 0 40px rgba(255, 215, 0, 0.2)' : 'none',
              }}
              aria-label={circle.isGolden ? 'Pop golden circle!' : 'Pop circle'}
            />
          )}
        </React.Fragment>
      ))}

      {/* Splash particles */}
      {splashes.map(splash => (
        <div
          key={splash.id}
          className={`absolute animate-splash-particle pointer-events-none ${
            splash.isGolden ? 'animate-golden-sparkle' : ''
          }`}
          style={{
            left: `${splash.x}%`,
            top: `${splash.y}%`,
            width: `${splash.particleSize}px`,
            height: `${splash.particleSize}px`,
            borderRadius: splash.isGolden ? '50%' : '50%',
            background: splash.color,
            '--angle': `${splash.angle}deg`,
            boxShadow: splash.isGolden ? '0 0 6px rgba(255, 215, 0, 0.8)' : 'none',
          } as React.CSSProperties}
        />
      ))}

      {/* Golden pop message */}
      {goldenPopped && (
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 z-20 animate-golden-message">
          <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent drop-shadow-lg">
            You popped THE golden bubble!
          </span>
        </div>
      )}

      {/* Main loader */}
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="relative h-20 w-20 p-2.5 rounded-[20px] [mask:conic-gradient(#000_0_0)_content-box_exclude,conic-gradient(#000_0_0)]">
          <div 
            className="absolute inset-0 animate-uble-spin"
            style={{
              background: `repeating-conic-gradient(#0000 0 5%, #C02942, #0000 20% 50%)`
            }}
          />
        </div>

        <p 
          className="text-2xl font-bold tracking-wider"
          style={{
            background: 'linear-gradient(135deg, #3D0718, #B5344F, #E8A0AA)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          uble
        </p>
      </div>

      {/* Text */}
      <div className="text-center max-w-xs relative z-10 space-y-2">
        <p className="text-[#6B0F2B] font-medium text-sm">
          Pop the circles while you wait
        </p>
        <p className="text-[#B5344F] text-xs font-medium animate-fact-fade">
          {funFact}
        </p>
      </div>

      <style>{`
        @keyframes uble-spin {
          to { transform: rotate(1turn); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-10px) translateX(8px); }
          50% { transform: translateY(-3px) translateX(-6px); }
          75% { transform: translateY(-15px) translateX(-5px); }
        }
        @keyframes golden-float {
          0%, 100% { transform: translateY(0) translateX(0) scale(1); }
          25% { transform: translateY(-8px) translateX(6px) scale(1.05); }
          50% { transform: translateY(-2px) translateX(-4px) scale(1); }
          75% { transform: translateY(-12px) translateX(-3px) scale(1.08); }
        }
        @keyframes golden-glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.45; }
        }
        @keyframes splash-particle {
          0% { 
            transform: translate(0, 0) scale(1); 
            opacity: 0.8; 
          }
          100% { 
            transform: translate(
              calc(cos(var(--angle)) * 45px), 
              calc(sin(var(--angle)) * 45px)
            ) scale(0); 
            opacity: 0; 
          }
        }
        @keyframes golden-splash-particle {
          0% { 
            transform: translate(0, 0) scale(1); 
            opacity: 1; 
          }
          50% {
            opacity: 1;
            transform: translate(
              calc(cos(var(--angle)) * 30px), 
              calc(sin(var(--angle)) * 30px)
            ) scale(1.3);
          }
          100% { 
            transform: translate(
              calc(cos(var(--angle)) * 70px), 
              calc(sin(var(--angle)) * 70px)
            ) scale(0); 
            opacity: 0; 
          }
        }
        @keyframes golden-message {
          0% { opacity: 0; transform: translate(-50%, 10px) scale(0.5); }
          30% { opacity: 1; transform: translate(-50%, -20px) scale(1.3); }
          100% { opacity: 0; transform: translate(-50%, -60px) scale(0.8); }
        }
        @keyframes fact-fade {
          0% { opacity: 0; transform: translateY(5px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-uble-spin {
          animation: uble-spin 1.5s linear infinite;
        }
        .animate-splash-particle {
          animation: splash-particle 0.6s ease-out forwards;
        }
        .animate-golden-sparkle {
          animation: golden-splash-particle 1s ease-out forwards !important;
        }
        .animate-golden-glow {
          animation: golden-glow 2s ease-in-out infinite;
        }
        .animate-golden-message {
          animation: golden-message 2s ease-out forwards;
        }
        .animate-fact-fade {
          animation: fact-fade 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default UbleLoader;