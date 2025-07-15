import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

const Index = () => {
  const [multiplier, setMultiplier] = useState(1.00);
  const [isFlying, setIsFlying] = useState(false);
  const [betAmount, setBetAmount] = useState(100);
  const [gameState, setGameState] = useState<'waiting' | 'flying' | 'crashed'>('waiting');
  const [cashoutAt, setCashoutAt] = useState<number | null>(null);
  const [balance, setBalance] = useState(10000);
  const [planePosition, setPlanePosition] = useState({ x: 0, y: 0 });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startGame = () => {
    if (gameState !== 'waiting') return;
    
    setGameState('flying');
    setIsFlying(true);
    setMultiplier(1.00);
    setPlanePosition({ x: 0, y: 0 });
    
    intervalRef.current = setInterval(() => {
      setMultiplier(prev => {
        const newMultiplier = prev + 0.01;
        
        // Случайный краш между 1.2x и 10x
        const crashPoint = 1.2 + Math.random() * 8.8;
        if (newMultiplier >= crashPoint) {
          setGameState('crashed');
          setIsFlying(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          
          // Автоматический restart через 3 секунды
          setTimeout(() => {
            setGameState('waiting');
            setMultiplier(1.00);
            setPlanePosition({ x: 0, y: 0 });
          }, 3000);
        }
        
        return Math.min(newMultiplier, crashPoint);
      });
      
      // Движение самолёта
      setPlanePosition(prev => ({
        x: Math.min(prev.x + 2, 400),
        y: Math.max(prev.y - 1, -200)
      }));
    }, 100);
  };

  const cashOut = () => {
    if (gameState !== 'flying') return;
    
    setCashoutAt(multiplier);
    setBalance(prev => prev + (betAmount * multiplier - betAmount));
    setGameState('crashed');
    setIsFlying(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    setTimeout(() => {
      setGameState('waiting');
      setMultiplier(1.00);
      setCashoutAt(null);
      setPlanePosition({ x: 0, y: 0 });
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-slate-700 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Icon name="Plane" size={32} className="text-blue-400" />
            <h1 className="text-2xl font-bold text-white">AVIAMASTERS</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-white">
              <span className="text-sm opacity-75">Баланс:</span>
              <span className="ml-2 font-mono text-lg">{balance.toLocaleString()} ₽</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Игровое поле */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
              <div className="relative h-96 bg-gradient-to-t from-slate-900 to-blue-900">
                
                {/* Сетка */}
                <svg className="absolute inset-0 w-full h-full opacity-20">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#3b82f6" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>

                {/* Множитель в центре */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`text-center transition-all duration-300 ${
                    gameState === 'flying' ? 'scale-110' : 'scale-100'
                  }`}>
                    <div className={`text-6xl font-bold mb-2 ${
                      gameState === 'crashed' ? 'text-red-400' : 'text-white'
                    }`}>
                      {multiplier.toFixed(2)}×
                    </div>
                    {cashoutAt && (
                      <div className="text-green-400 text-xl">
                        Выигрыш: {(betAmount * cashoutAt).toLocaleString()} ₽
                      </div>
                    )}
                    {gameState === 'crashed' && !cashoutAt && (
                      <div className="text-red-400 text-xl">КРАХ!</div>
                    )}
                  </div>
                </div>

                {/* Самолёт */}
                <div 
                  className={`absolute bottom-8 left-8 transition-all duration-100 ease-linear ${
                    isFlying ? 'opacity-100' : 'opacity-70'
                  }`}
                  style={{
                    transform: `translate(${planePosition.x}px, ${planePosition.y}px) rotate(-15deg)`,
                  }}
                >
                  <img 
                    src="/img/3bc03378-0dd9-41fa-aba3-b13ad85182f1.jpg" 
                    alt="Самолёт"
                    className="w-16 h-16 object-contain filter drop-shadow-lg"
                  />
                  {isFlying && (
                    <div className="absolute -right-2 top-1/2 w-12 h-1 bg-gradient-to-r from-orange-500 to-transparent rounded-full opacity-80"></div>
                  )}
                </div>

                {/* График траектории */}
                {gameState === 'flying' && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <path
                      d={`M 32 ${384 - 32} Q ${planePosition.x + 32} ${384 - 32 + planePosition.y} ${planePosition.x + 32} ${384 - 32 + planePosition.y}`}
                      stroke="#3b82f6"
                      strokeWidth="3"
                      fill="none"
                      className="opacity-60"
                    />
                  </svg>
                )}
              </div>
            </Card>
          </div>

          {/* Панель управления */}
          <div className="space-y-4">
            
            {/* Ставка */}
            <Card className="bg-slate-800/50 border-slate-700 p-4">
              <h3 className="text-white font-semibold mb-3">Ставка</h3>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(Number(e.target.value))}
                    className="bg-slate-700 border-slate-600 text-white"
                    disabled={gameState === 'flying'}
                  />
                  <span className="text-white flex items-center px-2">₽</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  {[100, 500, 1000].map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      size="sm"
                      onClick={() => setBetAmount(amount)}
                      disabled={gameState === 'flying'}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      {amount}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Кнопки управления */}
            <Card className="bg-slate-800/50 border-slate-700 p-4">
              <div className="space-y-3">
                {gameState === 'waiting' && (
                  <Button
                    onClick={startGame}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                    disabled={betAmount > balance}
                  >
                    <Icon name="Play" className="mr-2" size={18} />
                    СТАРТ ({betAmount} ₽)
                  </Button>
                )}
                
                {gameState === 'flying' && (
                  <Button
                    onClick={cashOut}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 animate-pulse"
                  >
                    <Icon name="DollarSign" className="mr-2" size={18} />
                    ЗАБРАТЬ {(betAmount * multiplier).toFixed(0)} ₽
                  </Button>
                )}
                
                {gameState === 'crashed' && (
                  <Button
                    disabled
                    className="w-full bg-slate-600 text-slate-400 font-semibold py-3"
                  >
                    <Icon name="RotateCcw" className="mr-2" size={18} />
                    Следующий раунд...
                  </Button>
                )}
              </div>
            </Card>

            {/* Статистика */}
            <Card className="bg-slate-800/50 border-slate-700 p-4">
              <h3 className="text-white font-semibold mb-3">Последние раунды</h3>
              <div className="space-y-2">
                {[2.45, 1.89, 5.67, 1.23, 3.45].map((mult, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">#{String(i + 1).padStart(2, '0')}</span>
                    <span className={`font-mono ${mult > 2 ? 'text-green-400' : 'text-red-400'}`}>
                      {mult.toFixed(2)}×
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Нижняя панель с информацией */}
        <Card className="mt-6 bg-slate-800/50 border-slate-700 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-400">2.47×</div>
              <div className="text-sm text-slate-400">Средний множитель</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">67%</div>
              <div className="text-sm text-slate-400">Успешные выводы</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-400">1,247</div>
              <div className="text-sm text-slate-400">Всего игр</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">+15,640</div>
              <div className="text-sm text-slate-400">Общий выигрыш</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;