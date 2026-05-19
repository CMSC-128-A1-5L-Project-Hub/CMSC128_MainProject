import React, { useState, useEffect, useCallback } from 'react';
import UBLELogo from '@/assets/UBLE_LOGO.png';

const UbleLoader: React.FC = () => {
  const [circles, setCircles] = useState<
    {
      id: number;
      x: number;
      y: number;
      size: number;
      delay: number;
      duration: number;
      popped: boolean;
      isGolden: boolean;
    }[]
  >([]);

  const [splashes, setSplashes] = useState<
    {
      id: number;
      x: number;
      y: number;
      particleSize: number;
      angle: number;
      color: string;
      isGolden: boolean;
    }[]
  >([]);

  const [funFact, setFunFact] = useState('');
  const [goldenPopped, setGoldenPopped] = useState(false);

  const funFacts = [
    "Bananas are berries, but strawberries aren't",
    'Octopuses have three hearts',
    'A day on Venus is longer than a year on Venus',
    'Honey never spoils — ever',
    'Sharks existed before trees did',
    'There are more stars in the universe than grains of sand on Earth',
    "Your brain uses 20% of your body's oxygen",
    'Wombat poop is cube-shaped',
    'A group of flamingos is called a "flamboyance"',
    'Hot water freezes faster than cold water sometimes',
    'Cows have best friends and get stressed when separated',
    'The Eiffel Tower grows 6 inches in summer',
    'Bubble wrap was originally meant to be wallpaper',
    'A single cloud can weigh over a million pounds',
    "Scotland's national animal is the unicorn",
    'Sloths can hold their breath longer than dolphins',
    'Humans share 60% of their DNA with bananas',
  ];

  const splashColors = [
    '#3D0718',
    '#6B0F2B',
    '#B5344F',
    '#C02942',
    '#E8A0AA',
    '#F9E8EC',
  ];

  const goldenSplashColors = [
    '#FFD700',
    '#FFC800',
    '#FFB800',
    '#FFE44D',
    '#FFF3B0',
    '#FFA000',
    '#FFCC00',
  ];

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
      default:
        x = 70 + Math.random() * 25;
        y = 10 + Math.random() * 80;
    }

    return { x, y };
  };

  useEffect(() => {
    const initial = Array.from({ length: 3 }, () => {
      const { x, y } = getPosition();
      const isGolden = Math.random() < 0.001;

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
    setFunFact(
      funFacts[Math.floor(Math.random() * funFacts.length)]
    );

    const interval = setInterval(() => {
      setFunFact(
        funFacts[Math.floor(Math.random() * funFacts.length)]
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const popCircle = useCallback(
    (id: number, x: number, y: number, isGolden: boolean) => {
      setCircles(prev =>
        prev.map(c =>
          c.id === id ? { ...c, popped: true } : c
        )
      );

      if (isGolden) {
        setGoldenPopped(true);
        setTimeout(() => setGoldenPopped(false), 2000);
      }

      const particleCount = isGolden ? 16 : 6;
      const colors = isGolden
        ? goldenSplashColors
        : splashColors;

      const newSplashes = Array.from(
        { length: particleCount },
        (_, i) => ({
          id: Date.now() + i,
          x,
          y,
          particleSize: isGolden
            ? 4 + Math.random() * 12
            : 3 + Math.random() * 7,
          angle:
            (i / particleCount) * 360 +
            Math.random() * 25,
          color:
            colors[
              Math.floor(Math.random() * colors.length)
            ],
          isGolden,
        })
      );

      setSplashes(prev => [...prev, ...newSplashes]);

      setTimeout(() => {
        setSplashes(prev =>
          prev.filter(s => !newSplashes.includes(s))
        );
      }, 700);

      setTimeout(() => {
        const { x: newX, y: newY } = getPosition();

        setCircles(prev =>
          prev.map(c =>
            c.id === id
              ? {
                  ...c,
                  x: newX,
                  y: newY,
                  size: 30 + Math.random() * 40,
                  delay: 0,
                  duration: 4 + Math.random() * 4,
                  popped: false,
                  isGolden:
                    Math.random() < 0.001,
                }
              : c
          )
        );
      }, 500);
    },
    []
  );

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white overflow-hidden">

      {/* Floating circles */}
      {circles.map(circle => (
        !circle.popped && (
          <button
            key={circle.id}
            onClick={() =>
              popCircle(
                circle.id,
                circle.x,
                circle.y,
                circle.isGolden
              )
            }
            className="absolute rounded-full hover:scale-110 active:scale-95 transition-transform"
            style={{
              left: `${circle.x}%`,
              top: `${circle.y}%`,
              width: `${circle.size}px`,
              height: `${circle.size}px`,
              background:
                circle.size > 45
                  ? 'radial-gradient(circle,#E8A0AA,#B5344F)'
                  : 'radial-gradient(circle,#B5344F,#6B0F2B)',
              opacity: .12,
              animation: `float ${circle.duration}s ease-in-out ${circle.delay}s infinite`,
            }}
          />
        )
      ))}

      {/* Splash particles */}
      {splashes.map(splash => (
        <div
          key={splash.id}
          className="absolute animate-splash-particle pointer-events-none"
          style={{
            left: `${splash.x}%`,
            top: `${splash.y}%`,
            width: `${splash.particleSize}px`,
            height: `${splash.particleSize}px`,
            borderRadius: '50%',
            background: splash.color,
            '--angle': `${splash.angle}deg`,
          } as React.CSSProperties}
        />
      ))}

      {/* Center logo */}
      <div className="relative z-10 flex flex-col items-center gap-6">

        <img
          src={UBLELogo}
          alt="UBLE Logo"
          className="animate-logo-pulse w-56 h-56 object-contain"
        />

        <p className="text-[#6B0F2B] font-medium text-sm">
          Pop the circles while you wait
        </p>

        <p className="text-[#B5344F] text-xs font-medium animate-fact-fade text-center max-w-xs">
          {funFact}
        </p>
      </div>

      {goldenPopped && (
        <div className="absolute top-1/4 animate-golden-message">
          <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
            You popped THE golden bubble!
          </span>
        </div>
      )}

      <style>{`
        @keyframes logo-pulse{
          0%,100%{
            transform:scale(1);
            opacity:.75;
          }

          50%{
            transform:scale(1.08);
            opacity:1;
          }
        }

        @keyframes float{
          0%,100%{
            transform:translateY(0) translateX(0);
          }

          25%{
            transform:translateY(-10px) translateX(8px);
          }

          50%{
            transform:translateY(-3px) translateX(-6px);
          }

          75%{
            transform:translateY(-15px) translateX(-5px);
          }
        }

        @keyframes splash-particle{
          from{
            transform:translate(0,0);
            opacity:1;
          }

          to{
            transform:
            translate(
              calc(cos(var(--angle))*45px),
              calc(sin(var(--angle))*45px)
            );
            opacity:0;
          }
        }

        @keyframes fact-fade{
          from{
            opacity:0;
            transform:translateY(5px);
          }

          to{
            opacity:1;
            transform:translateY(0);
          }
        }

        @keyframes golden-message{
          0%{
            opacity:0;
            transform:translateY(10px) scale(.5);
          }

          30%{
            opacity:1;
            transform:translateY(-20px) scale(1.2);
          }

          100%{
            opacity:0;
            transform:translateY(-60px);
          }
        }

        .animate-logo-pulse{
          animation:logo-pulse 3s ease-in-out infinite;
        }

        .animate-splash-particle{
          animation:splash-particle .6s ease-out forwards;
        }

        .animate-fact-fade{
          animation:fact-fade .4s ease-out;
        }

        .animate-golden-message{
          animation:golden-message 2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default UbleLoader;