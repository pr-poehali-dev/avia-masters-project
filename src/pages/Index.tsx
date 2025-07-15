import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const Index = () => {
  const [height, setHeight] = useState(0);
  const [distance, setDistance] = useState(0);
  const [multiplier, setMultiplier] = useState(1.0);
  const [isFlying, setIsFlying] = useState(false);
  const [betAmount, setBetAmount] = useState(50);
  const [gameState, setGameState] = useState<'waiting' | 'flying' | 'crashed'>('waiting');
  const [balance, setBalance] = useState(100000);
  const [planePosition, setPlanePosition] = useState({ x: 0, y: 0 });
  const [winAmount, setWinAmount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startGame = () => {
    if (gameState !== 'waiting' || betAmount > balance) return;
    
    setGameState('flying');
    setIsFlying(true);
    setHeight(0);
    setDistance(0);
    setMultiplier(1.0);
    setPlanePosition({ x: 0, y: 0 });
    setBalance(prev => prev - betAmount);
    
    intervalRef.current = setInterval(() => {
      setHeight(prev => prev + 0.1);
      setDistance(prev => prev + 0.1);
      setMultiplier(prev => {
        const newMultiplier = prev + 0.1;
        
        // Случайный краш между 1.2x и 15x
        const crashPoint = 1.2 + Math.random() * 13.8;
        if (newMultiplier >= crashPoint) {
          setGameState('crashed');
          setIsFlying(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          
          // Автоматический restart через 4 секунды
          setTimeout(() => {
            setGameState('waiting');
            setHeight(0);
            setDistance(0);
            setMultiplier(1.0);
            setPlanePosition({ x: 0, y: 0 });
            setWinAmount(0);
          }, 4000);
        }
        
        return Math.min(newMultiplier, crashPoint);
      });
      
      // Движение самолёта
      setPlanePosition(prev => ({
        x: Math.min(prev.x + 3, 500),
        y: Math.max(prev.y - 2, -150)
      }));
    }, 150);
  };

  const cashOut = () => {
    if (gameState !== 'flying') return;
    
    const win = Math.floor(betAmount * multiplier);
    setWinAmount(win);
    setBalance(prev => prev + win);
    setGameState('crashed');
    setIsFlying(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    setTimeout(() => {
      setGameState('waiting');
      setHeight(0);
      setDistance(0);
      setMultiplier(1.0);
      setPlanePosition({ x: 0, y: 0 });
      setWinAmount(0);
    }, 4000);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-800 via-blue-700 to-blue-900 relative overflow-hidden">
      
      {/* Header */}
      <div className="relative z-20 p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-500 rounded flex items-center justify-center">
            <span className="text-black font-bold text-xl">B</span>
          </div>
          <div className="text-white">
            <div className="font-bold text-lg">AVIAMASTERS</div>
            <div className="text-sm opacity-75">06:33</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Icon name="Volume2" size={24} className="text-white" />
          <Icon name="Menu" size={24} className="text-white" />
        </div>
      </div>

      {/* Облака фон */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <img
            key={i}
            src="/img/31bfec08-01cc-47e5-bc15-ea883e77ba7b.jpg"
            alt="cloud"
            className="absolute opacity-30 w-32 h-20 object-cover"
            style={{
              left: `${20 + i * 15}%`,
              top: `${10 + (i % 3) * 20}%`,
              transform: `scale(${0.8 + (i % 3) * 0.3})`,
            }}
          />
        ))}
      </div>

      {/* Основная игровая область */}
      <div className="relative z-10 px-4 pt-8">
        <div className="relative h-96">
          
          {/* Авианосцы */}
          <img
            src="/img/8bbc76c0-0c5e-4400-8cb4-dbc8eedf9fbe.jpg"
            alt="aircraft carrier"
            className="absolute bottom-0 left-16 w-48 h-16 object-cover opacity-80"
          />
          <img
            src="/img/8bbc76c0-0c5e-4400-8cb4-dbc8eedf9fbe.jpg"
            alt="aircraft carrier"
            className="absolute bottom-0 right-16 w-32 h-12 object-cover opacity-60"
          />

          {/* Самолёт с анимацией */}
          <div 
            className={`absolute transition-all duration-150 ease-linear ${
              isFlying ? 'opacity-100' : 'opacity-90'
            }`}
            style={{
              left: `${120 + planePosition.x}px`,
              bottom: `${80 + Math.abs(planePosition.y)}px`,
              transform: `rotate(${planePosition.y < 0 ? -15 : 5}deg)`,
            }}
          >
            <img 
              src="/img/bc1d7714-3a1d-4f68-b07b-62d82e016175.jpg" 
              alt="Красный биплан"
              className="w-16 h-12 object-contain filter drop-shadow-lg"
            />
          </div>

          {/* Информация о полёте над самолётом */}
          {isFlying && (
            <div 
              className="absolute text-yellow-400 font-bold text-sm"
              style={{
                left: `${140 + planePosition.x}px`,
                bottom: `${120 + Math.abs(planePosition.y)}px`,
              }}
            >
              {winAmount > 0 ? `${winAmount.toLocaleString()} RUB` : `${(betAmount * multiplier).toFixed(0)} RUB`}
            </div>
          )}

          {/* Центральные показатели */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white">
            {gameState === 'crashed' && !winAmount && (
              <div className="text-red-400 text-4xl font-bold mb-4">CRASHED!</div>
            )}
            {winAmount > 0 && gameState === 'crashed' && (
              <div className="text-green-400 text-2xl font-bold">
                ВЫ ВЫИГРАЛИ: {winAmount.toLocaleString()} RUB
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Нижняя панель */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm p-4">
        
        {/* Показатели полёта */}
        <div className="flex justify-center gap-8 mb-4 text-white text-sm">
          <div className="text-center">
            <div className="opacity-75">ВЫСОТА</div>
            <div className="font-mono text-lg">{height.toFixed(1)}m</div>
          </div>
          <div className="text-center">
            <div className="opacity-75">ДИСТАНЦИЯ</div>
            <div className="font-mono text-lg">{distance.toFixed(1)}m</div>
          </div>
          <div className="text-center">
            <div className="opacity-75">МНОЖИТЕЛЬ</div>
            <div className="font-mono text-xl font-bold text-yellow-400">×{multiplier.toFixed(1)}</div>
          </div>
        </div>

        {/* Иконки особенностей */}
        <div className="flex justify-center gap-6 mb-4">
          <Icon name="Turtle" size={20} className="text-white opacity-60" />
          <Icon name="User" size={20} className="text-white opacity-60" />
          <Icon name="Waves" size={20} className="text-white opacity-60" />
          <Icon name="Zap" size={20} className="text-white opacity-60" />
        </div>

        {/* Управление */}
        <div className="flex justify-between items-end">
          
          {/* Баланс */}
          <div className="text-white">
            <div className="text-sm opacity-75">БАЛАНС</div>
            <div className="font-bold text-lg">{balance.toLocaleString('ru-RU')} RUB</div>
          </div>

          {/* Кнопки управления */}
          <div className="flex items-center gap-4">
            {gameState === 'waiting' && (
              <Button
                onClick={startGame}
                disabled={betAmount > balance}
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-black px-8 py-6 text-lg font-bold"
              >
                СТАРТ
              </Button>
            )}
            
            {gameState === 'flying' && (
              <Button
                onClick={cashOut}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg font-bold animate-pulse"
              >
                ЗАБРАТЬ
              </Button>
            )}
            
            {gameState === 'crashed' && (
              <Button
                disabled
                className="bg-gray-600 text-gray-400 px-8 py-6 text-lg font-bold"
              >
                ОЖИДАНИЕ...
              </Button>
            )}

            <Icon name="RotateCcw" size={24} className="text-white" />
          </div>

          {/* Ставка */}
          <div className="text-white text-right">
            <div className="text-sm opacity-75">СТАВКА</div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setBetAmount(Math.max(10, betAmount - 10))}
                disabled={gameState === 'flying'}
                className="text-white text-xl"
              >
                ▼
              </button>
              <div className="font-bold text-lg">{betAmount.toFixed(2)} RUB</div>
              <button 
                onClick={() => setBetAmount(Math.min(1000, betAmount + 10))}
                disabled={gameState === 'flying'}
                className="text-white text-xl"
              >
                ▲
              </button>
            </div>
          </div>
        </div>

        {/* Большая кнопка Play */}
        {gameState === 'waiting' && (
          <div className="absolute -top-16 right-8">
            <button
              onClick={startGame}
              disabled={betAmount > balance}
              className="w-20 h-20 rounded-full border-4 border-white bg-transparent flex items-center justify-center hover:bg-white hover:text-black transition-colors group"
            >
              <Icon name="Play" size={32} className="text-white group-hover:text-black ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;