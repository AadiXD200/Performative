import React, { useRef, useEffect, useState, useCallback } from 'react';

interface MatchaGameProps {
  onBack: () => void;
}

type GameState = 'START' | 'TUB_OPEN' | 'SCOOPING' | 'SIFTING' | 'POURING_WATER' | 'WHISKING' | 'POURING_CUP' | 'DONE';

interface GameObjects {
  tub: { x: number; y: number; radius: number; open: boolean; lid: { x: number; y: number; radius: number } };
  spoon: { x: number; y: number; width: number; height: number; holding: boolean; matchaAmount: number };
  bowl: { x: number; y: number; radius: number; frothLevel: number };
  strainer: { x: number; y: number; radius: number };
  scale: { x: number; y: number; width: number; height: number; reading: number; isPouring: boolean };
  kettle: { x: number; y: number; width: number; height: number; holding: boolean; rotation: number; pourProgress: number };
  whisk: { x: number; y: number; width: number; height: number; holding: boolean };
  starbucksCup: { x: number; y: number; width: number; height: number; filled: boolean };
}

const TARGET_MATCHA = 3.0;
const SIFT_THRESHOLD = 50;

export default function MatchaGame({ onBack }: MatchaGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [instruction, setInstruction] = useState('Click the matcha tub to open it.');
  const [showStopButton, setShowStopButton] = useState(false);
  const [gameState, setGameState] = useState<GameState>('START');
  
  const mouseRef = useRef({ x: 0, y: 0, down: false });
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const siftProgressRef = useRef(0);
  
  const imagesRef = useRef<{
    logo: HTMLImageElement | null;
    kettle: HTMLImageElement | null;
    whisk: HTMLImageElement | null;
    imagesLoaded: number;
  }>({
    logo: null,
    kettle: null,
    whisk: null,
    imagesLoaded: 0,
  });

  const gameObjectsRef = useRef<GameObjects>({
    tub: { x: 100, y: 150, radius: 40, open: false, lid: { x: 100, y: 230, radius: 42 } },
    spoon: { x: 120, y: 300, width: 20, height: 100, holding: false, matchaAmount: 0 },
    bowl: { x: 400, y: 200, radius: 80, frothLevel: 0 },
    strainer: { x: 400, y: 200, radius: 50 },
    scale: { x: 650, y: 200, width: 120, height: 60, reading: 0.0, isPouring: false },
    kettle: { x: 650, y: 450, width: 150, height: 120, holding: false, rotation: 0, pourProgress: 0 },
    whisk: { x: 250, y: 450, width: 90, height: 110, holding: false },
    starbucksCup: { x: 400, y: 450, width: 80, height: 120, filled: false },
  });

  // Load images
  useEffect(() => {
    const logoImg = new Image();
    const kettleImg = new Image();
    const whiskImg = new Image();

    logoImg.src = '/assets/starbucks_logo.svg';
    kettleImg.src = '/assets/kettle.png';
    whiskImg.src = '/assets/whisk.png';

    const onImageLoad = () => {
      imagesRef.current.imagesLoaded++;
      if (imagesRef.current.imagesLoaded >= 3) {
        imagesRef.current.logo = logoImg;
        imagesRef.current.kettle = kettleImg;
        imagesRef.current.whisk = whiskImg;
      }
    };

    logoImg.onload = onImageLoad;
    kettleImg.onload = onImageLoad;
    whiskImg.onload = onImageLoad;
    logoImg.onerror = onImageLoad;
    kettleImg.onerror = onImageLoad;
    whiskImg.onerror = onImageLoad;

    if (logoImg.complete) onImageLoad();
    if (kettleImg.complete) onImageLoad();
    if (whiskImg.complete) onImageLoad();
  }, []);

  const isMouseIn = useCallback((obj: { x: number; y: number; radius?: number; width?: number; height?: number }) => {
    const mouse = mouseRef.current;
    if (obj.radius) {
      const dist = Math.sqrt((mouse.x - obj.x) ** 2 + (mouse.y - obj.y) ** 2);
      return dist < obj.radius;
    } else if (obj.width && obj.height) {
      return mouse.x > obj.x && mouse.x < obj.x + obj.width &&
             mouse.y > obj.y && mouse.y < obj.y + obj.height;
    }
    return false;
  }, []);

  const getMatchaColor = useCallback((amount: number) => {
    const tasteless = { light: { r: 200, g: 220, b: 150 }, dark: { r: 150, g: 170, b: 100 } };
    const delicious = { light: { r: 107, g: 191, b: 89 }, dark: { r: 74, g: 124, b: 58 } };
    const strong = { light: { r: 80, g: 140, b: 70 }, dark: { r: 46, g: 125, b: 50 } };

    const lerp = (start: number, end: number, t: number) => start + t * (end - start);

    let lightColor, darkColor;

    if (amount < 2.0) {
      const t = Math.max(0, amount / 2.0);
      lightColor = { r: lerp(tasteless.light.r, delicious.light.r, t), g: lerp(tasteless.light.g, delicious.light.g, t), b: lerp(tasteless.light.b, delicious.light.b, t) };
      darkColor = { r: lerp(tasteless.dark.r, delicious.dark.r, t), g: lerp(tasteless.dark.g, delicious.dark.g, t), b: lerp(tasteless.dark.b, delicious.dark.b, t) };
    } else if (amount > 4.0) {
      const t = Math.min(1, (amount - 4.0) / 2.0);
      lightColor = { r: lerp(delicious.light.r, strong.light.r, t), g: lerp(delicious.light.g, strong.light.g, t), b: lerp(delicious.light.b, strong.light.b, t) };
      darkColor = { r: lerp(delicious.dark.r, strong.dark.r, t), g: lerp(delicious.dark.g, strong.dark.g, t), b: lerp(delicious.dark.b, strong.dark.b, t) };
    } else {
      lightColor = delicious.light;
      darkColor = delicious.dark;
    }

    const toRgb = (c: { r: number; g: number; b: number }) => `rgb(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)})`;
    return { light: toRgb(lightColor), dark: toRgb(darkColor) };
  }, []);

  const handleMouseDown = useCallback(() => {
    const state = gameState;
    const objs = gameObjectsRef.current;

    mouseRef.current.down = true;

    if (['TUB_OPEN', 'SCOOPING', 'SIFTING'].includes(state) && isMouseIn(objs.spoon)) {
      objs.spoon.holding = true;
      if (state === 'TUB_OPEN') {
        setGameState('SCOOPING');
        setInstruction('Move the spoon into the tub to scoop some matcha.');
      }
      return;
    }

    if (['POURING_WATER', 'WHISKING'].includes(state) && isMouseIn(objs.kettle)) {
      objs.kettle.holding = true;
      return;
    }

    if (state === 'WHISKING' && isMouseIn(objs.whisk)) {
      objs.whisk.holding = true;
      return;
    }

    if (state === 'START' && isMouseIn(objs.tub)) {
      objs.tub.open = true;
      setGameState('TUB_OPEN');
      setInstruction('Now, pick up the bamboo spoon (chashaku).');
    } else if (state === 'SIFTING' && objs.scale.reading > TARGET_MATCHA + 0.05 && isMouseIn(objs.tub)) {
      objs.scale.reading = 0;
      setInstruction(`Good, you emptied the excess. Now get exactly ${TARGET_MATCHA.toFixed(2)}g.`);
    }
  }, [gameState, isMouseIn]);

  const handleMouseUp = useCallback(() => {
    const state = gameState;
    const objs = gameObjectsRef.current;

    mouseRef.current.down = false;

    if (objs.spoon.holding) {
      objs.spoon.holding = false;
      if (state === 'SCOOPING' && objs.spoon.matchaAmount > 0) {
        setGameState('SIFTING');
        setShowStopButton(true);
        setInstruction(`Sift the matcha onto the scale. Click 'Done Measuring' when you're ready.`);
      } else if (state === 'SCOOPING') {
        setGameState('TUB_OPEN');
        setInstruction('Pick up the bamboo spoon (chashaku).');
      }
    }

    if (objs.kettle.holding) {
      objs.kettle.holding = false;
      objs.kettle.isPouring = false;
      objs.kettle.rotation = 0;
      objs.kettle.pourProgress = 0;
    }

    if (objs.whisk.holding) {
      objs.whisk.holding = false;
    }
  }, [gameState]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    mouseRef.current.x = e.clientX - rect.left;
    mouseRef.current.y = e.clientY - rect.top;

    const state = gameState;
    const objs = gameObjectsRef.current;
    const mouse = mouseRef.current;
    const lastMouse = lastMouseRef.current;

    if (objs.spoon.holding) {
      objs.spoon.x = mouse.x - objs.spoon.width / 2;
      objs.spoon.y = mouse.y - objs.spoon.height / 2;

      if ((state === 'SCOOPING' || state === 'SIFTING') && isMouseIn(objs.tub)) {
        objs.spoon.matchaAmount = Math.random() * (2.5 - 1) + 1;
      }

      if (state === 'SIFTING' && objs.spoon.matchaAmount > 0 && isMouseIn(objs.strainer)) {
        const moveDistance = Math.sqrt((mouse.x - lastMouse.x) ** 2 + (mouse.y - lastMouse.y) ** 2);
        siftProgressRef.current += moveDistance;

        if (siftProgressRef.current > SIFT_THRESHOLD) {
          const amountToSift = 0.05;
          const actualSiftAmount = Math.min(objs.spoon.matchaAmount, amountToSift);
          objs.scale.reading += actualSiftAmount;
          objs.spoon.matchaAmount -= actualSiftAmount;
          siftProgressRef.current = 0;
        }
      }
    }

    if (objs.kettle.holding) {
      objs.kettle.x = mouse.x - objs.kettle.width / 2;
      objs.kettle.y = mouse.y - objs.kettle.height / 2;

      if (state === 'POURING_WATER' && isMouseIn(objs.bowl)) {
        objs.kettle.isPouring = true;
        objs.kettle.rotation = Math.max(objs.kettle.rotation - 0.02, -0.35);
        objs.kettle.pourProgress = Math.min(objs.kettle.pourProgress + 0.02, 1);

        if (objs.kettle.pourProgress >= 1 && state === 'POURING_WATER') {
          setTimeout(() => {
            if (gameState === 'POURING_WATER') {
              setGameState('WHISKING');
              setInstruction('Pick up the whisk and move your mouse over the bowl to whisk.');
            }
          }, 500);
        }
      } else {
        objs.kettle.isPouring = false;
        objs.kettle.rotation = Math.min(objs.kettle.rotation + 0.05, 0);
        objs.kettle.pourProgress = Math.max(objs.kettle.pourProgress - 0.05, 0);
      }
    }

    if (objs.whisk.holding && state === 'WHISKING') {
      const moveDistance = Math.sqrt((mouse.x - lastMouse.x) ** 2 + (mouse.y - lastMouse.y) ** 2);
      if (moveDistance > 0 && isMouseIn(objs.bowl)) {
        objs.bowl.frothLevel = Math.min(100, objs.bowl.frothLevel + moveDistance * 0.1);
      }
      objs.whisk.x = mouse.x - objs.whisk.width / 2;
      objs.whisk.y = mouse.y - objs.whisk.height / 2;

      if (objs.bowl.frothLevel >= 100) {
        setGameState('POURING_CUP');
        setInstruction('Whisking complete! Time for the final step.');
      }
    }

    lastMouseRef.current = { x: mouse.x, y: mouse.y };
  }, [gameState, isMouseIn]);

  const handleStopMeasuring = useCallback(() => {
    setGameState('POURING_WATER');
    setInstruction('Great! Now, pick up the kettle and pour hot water into the bowl.');
    setShowStopButton(false);
  }, []);

  // Drawing functions
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const state = gameState;
    const objs = gameObjectsRef.current;
    const images = imagesRef.current;

    drawTub(ctx, objs.tub);
    drawScale(ctx, objs.scale);
    drawBowl(ctx, objs.bowl, objs.scale.reading, state, getMatchaColor);

    if (state === 'SIFTING' || state === 'SCOOPING') {
      drawStrainer(ctx, objs.strainer);
    }

    drawSpoon(ctx, objs.spoon);

    if (state === 'POURING_WATER' || state === 'WHISKING') {
      drawKettle(ctx, objs.kettle, images.kettle);
      if (objs.kettle.isPouring) {
        drawWaterStream(ctx, objs.kettle, objs.bowl);
      }
    }

    if (state === 'WHISKING') {
      drawWhisk(ctx, objs.whisk, images.whisk);
    }

    if (state === 'POURING_CUP' || state === 'DONE') {
      drawStarbucksCup(ctx, objs.starbucksCup, objs.scale.reading, images.logo, state, getMatchaColor);
      
      if (state === 'POURING_CUP' && mouseRef.current.down && isMouseIn(objs.bowl)) {
        objs.starbucksCup.filled = true;
        setGameState('DONE');

        let finalMessage = '';
        if (objs.scale.reading < 2.0) {
          finalMessage = `You used ${objs.scale.reading.toFixed(2)}g. It's a bit tasteless, maybe add more next time!`;
        } else if (objs.scale.reading > 4.0) {
          finalMessage = `You used ${objs.scale.reading.toFixed(2)}g. Whoa, that's a lot of matcha! A bit too strong.`;
        } else {
          finalMessage = `You used ${objs.scale.reading.toFixed(2)}g. Delicious! You've made a perfect matcha latte.`;
        }
        setInstruction(finalMessage);
      }
    }
    // Note: Animation loop is handled in useEffect, don't call requestAnimationFrame here
  }, [gameState, getMatchaColor, isMouseIn]);

  // Game loop
  useEffect(() => {
    if (imagesRef.current.imagesLoaded < 3) return;
    
    let animationId: number;
    const loop = () => {
      draw();
      animationId = requestAnimationFrame(loop);
    };
    
    animationId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationId);
  }, [draw]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9DDE5] via-[#E6D8FF] to-[#DFF3FF] pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-6">
        <button
          onClick={onBack}
          className="mb-6 text-[#2A2A34] hover:text-[#7AD39B] transition-colors font-semibold flex items-center gap-2"
        >
          ← Back to Games
        </button>
        
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-green-700 mb-6">🍵 Make Your Matcha</h1>
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              className="bg-gradient-to-br from-amber-200 to-amber-300 rounded-xl cursor-pointer shadow-lg mx-auto"
              style={{ 
                display: 'block',
                backgroundImage: 'repeating-linear-gradient(90deg, #d2b48c 0px, #d2b48c 100px, #bca98f 100px, #bca98f 102px)'
              }}
            />
            {showStopButton && (
              <button
                onClick={handleStopMeasuring}
                className="mt-4 px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Done Measuring
              </button>
            )}
            <p className="mt-4 text-lg text-[#2A2A34]">{instruction}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Drawing helper functions
function drawTub(ctx: CanvasRenderingContext2D, tub: GameObjects['tub']) {
  if (tub.open) {
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.ellipse(tub.lid.x, tub.lid.y, tub.lid.radius, tub.lid.radius / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    const lidTopGradient = ctx.createLinearGradient(tub.lid.x - tub.lid.radius, tub.lid.y, tub.lid.x + tub.lid.radius, tub.lid.y);
    lidTopGradient.addColorStop(0, '#333');
    lidTopGradient.addColorStop(0.5, '#111');
    lidTopGradient.addColorStop(1, '#333');
    ctx.fillStyle = lidTopGradient;
    ctx.beginPath();
    ctx.ellipse(tub.lid.x, tub.lid.y - 5, tub.lid.radius, tub.lid.radius / 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  const tubGradient = ctx.createRadialGradient(tub.x - 10, tub.y - 10, 5, tub.x, tub.y, tub.radius);
  tubGradient.addColorStop(0, '#444');
  tubGradient.addColorStop(1, '#1a1a1a');
  ctx.fillStyle = tubGradient;
  ctx.beginPath();
  ctx.arc(tub.x, tub.y, tub.radius, 0, Math.PI * 2);
  ctx.fill();

  if (tub.open) {
    ctx.fillStyle = '#3a5a40';
    ctx.beginPath();
    ctx.arc(tub.x, tub.y, tub.radius - 8, 0, Math.PI * 2);
    ctx.fill();
  } else {
    const lidTopGradient = ctx.createLinearGradient(tub.x - tub.radius, tub.y, tub.x + tub.radius, tub.y);
    lidTopGradient.addColorStop(0, '#333');
    lidTopGradient.addColorStop(0.5, '#111');
    lidTopGradient.addColorStop(1, '#333');
    ctx.fillStyle = lidTopGradient;
    ctx.beginPath();
    ctx.ellipse(tub.x, tub.y - 5, tub.radius, tub.radius / 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSpoon(ctx: CanvasRenderingContext2D, spoon: GameObjects['spoon']) {
  const handleGradient = ctx.createLinearGradient(spoon.x, spoon.y, spoon.x + spoon.width, spoon.y);
  handleGradient.addColorStop(0, '#c19a6b');
  handleGradient.addColorStop(0.5, '#e0b98a');
  handleGradient.addColorStop(1, '#c19a6b');
  ctx.fillStyle = handleGradient;
  ctx.fillRect(spoon.x, spoon.y, spoon.width, spoon.height);

  ctx.beginPath();
  ctx.ellipse(spoon.x + spoon.width / 2, spoon.y + 10, spoon.width * 0.8, 15, 0, 0, Math.PI * 2);
  ctx.fill();

  if (spoon.matchaAmount > 0) {
    ctx.fillStyle = '#55a630';
    ctx.beginPath();
    ctx.arc(spoon.x + spoon.width / 2, spoon.y + 10, spoon.width * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBowl(ctx: CanvasRenderingContext2D, bowl: GameObjects['bowl'], scaleReading: number, state: GameState, getMatchaColor: (amount: number) => { light: string; dark: string }) {
  ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
  ctx.shadowBlur = 15;
  ctx.shadowOffsetX = 5;
  ctx.shadowOffsetY = 10;

  const bowlGradient = ctx.createRadialGradient(bowl.x - 20, bowl.y - 20, 10, bowl.x, bowl.y, bowl.radius);
  bowlGradient.addColorStop(0, '#ffffff');
  bowlGradient.addColorStop(1, '#e0e0e0');
  ctx.fillStyle = bowlGradient;
  ctx.beginPath();
  ctx.arc(bowl.x, bowl.y, bowl.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  ctx.strokeStyle = '#d0d0d0';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(bowl.x, bowl.y, bowl.radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#f5f5f5';
  ctx.beginPath();
  ctx.arc(bowl.x, bowl.y, bowl.radius - 5, 0, Math.PI * 2);
  ctx.fill();

  if (scaleReading > 0 && state !== 'SCOOPING' && state !== 'SIFTING') {
    const powderAmount = Math.min(scaleReading / TARGET_MATCHA, 1);
    ctx.fillStyle = '#55a630';
    ctx.beginPath();
    ctx.arc(bowl.x, bowl.y, bowl.radius * 0.3 * powderAmount, 0, Math.PI * 2);
    ctx.fill();
  }

  if (state === 'WHISKING' || state === 'POURING_CUP' || (state === 'DONE' && true)) {
    const { light, dark } = getMatchaColor(scaleReading);
    const liquidGradient = ctx.createRadialGradient(bowl.x, bowl.y, 5, bowl.x, bowl.y, bowl.radius * 0.8);
    liquidGradient.addColorStop(0, light);
    liquidGradient.addColorStop(1, dark);
    ctx.fillStyle = liquidGradient;
    ctx.beginPath();
    ctx.arc(bowl.x, bowl.y, bowl.radius * 0.8, 0, Math.PI * 2);
    ctx.fill();

    if (bowl.frothLevel > 0) {
      const frothRadius = bowl.radius * 0.8 * (bowl.frothLevel / 100);
      const frothGradient = ctx.createRadialGradient(bowl.x, bowl.y, 5, bowl.x, bowl.y, frothRadius);
      frothGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      frothGradient.addColorStop(0.5, 'rgba(170, 255, 170, 0.6)');
      frothGradient.addColorStop(1, 'rgba(107, 191, 89, 0.4)');
      ctx.fillStyle = frothGradient;
      ctx.beginPath();
      ctx.arc(bowl.x, bowl.y, frothRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawStrainer(ctx: CanvasRenderingContext2D, strainer: GameObjects['strainer']) {
  const rimGradient = ctx.createLinearGradient(strainer.x - strainer.radius, strainer.y, strainer.x + strainer.radius, strainer.y);
  rimGradient.addColorStop(0, '#d4d4d4');
  rimGradient.addColorStop(0.5, '#f0f0f0');
  rimGradient.addColorStop(1, '#d4d4d4');
  ctx.strokeStyle = rimGradient;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(strainer.x, strainer.y, strainer.radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(180, 180, 180, 0.5)';
  ctx.lineWidth = 0.5;
  for (let i = 1; i < 5; i++) {
    const offset = i * strainer.radius * 2 / 5;
    ctx.beginPath();
    ctx.moveTo(strainer.x - strainer.radius, strainer.y - strainer.radius + offset);
    ctx.lineTo(strainer.x + strainer.radius, strainer.y - strainer.radius + offset);
    ctx.moveTo(strainer.x - strainer.radius + offset, strainer.y - strainer.radius);
    ctx.lineTo(strainer.x - strainer.radius + offset, strainer.y + strainer.radius);
    ctx.stroke();
  }
}

function drawScale(ctx: CanvasRenderingContext2D, scale: GameObjects['scale']) {
  ctx.fillStyle = '#f0f0f0';
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 1;
  ctx.fillRect(scale.x, scale.y, scale.width, scale.height);
  ctx.strokeRect(scale.x, scale.y, scale.width, scale.height);

  ctx.fillStyle = '#c1d1c6';
  ctx.fillRect(scale.x + 10, scale.y + 10, scale.width - 20, scale.height - 20);

  ctx.fillStyle = '#3a3f3b';
  ctx.font = '24px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`${scale.reading.toFixed(2)}g`, scale.x + scale.width / 2, scale.y + 40);
}

function drawKettle(ctx: CanvasRenderingContext2D, kettle: GameObjects['kettle'], kettleImage: HTMLImageElement | null) {
  ctx.save();
  const pivotX = kettle.x + kettle.width / 2;
  const pivotY = kettle.y + kettle.height;
  ctx.translate(pivotX, pivotY);
  ctx.rotate(kettle.rotation);
  ctx.translate(-pivotX, -pivotY);

  if (kettleImage && kettleImage.complete) {
    ctx.drawImage(kettleImage, kettle.x, kettle.y, kettle.width, kettle.height);
  } else {
    ctx.fillStyle = '#c0c0c0';
    ctx.fillRect(kettle.x, kettle.y, kettle.width, kettle.height);
  }
  ctx.restore();
}

function drawWhisk(ctx: CanvasRenderingContext2D, whisk: GameObjects['whisk'], whiskImage: HTMLImageElement | null) {
  if (whiskImage && whiskImage.complete) {
    ctx.drawImage(whiskImage, whisk.x, whisk.y, whisk.width, whisk.height);
  } else {
    ctx.fillStyle = '#a0522d';
    ctx.fillRect(whisk.x, whisk.y, whisk.width, whisk.height);
  }
}

function drawStarbucksCup(ctx: CanvasRenderingContext2D, cup: GameObjects['starbucksCup'], scaleReading: number, logoImage: HTMLImageElement | null, state: GameState, getMatchaColor: (amount: number) => { light: string; dark: string }) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.strokeStyle = 'rgba(200, 200, 200, 0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cup.x - cup.width / 2, cup.y);
  ctx.lineTo(cup.x - cup.width / 2 + 10, cup.y + cup.height);
  ctx.lineTo(cup.x + cup.width / 2 - 10, cup.y + cup.height);
  ctx.lineTo(cup.x + cup.width / 2, cup.y);
  ctx.closePath();
  ctx.stroke();
  ctx.fill();

  if (cup.filled) {
    const { light, dark } = getMatchaColor(scaleReading);
    const liquidGradient = ctx.createLinearGradient(cup.x, cup.y + 20, cup.x, cup.y + cup.height);
    liquidGradient.addColorStop(0, light);
    liquidGradient.addColorStop(1, dark);
    ctx.fillStyle = liquidGradient;
    ctx.beginPath();
    ctx.moveTo(cup.x - cup.width / 2 + 5, cup.y + 20);
    ctx.lineTo(cup.x - cup.width / 2 + 10, cup.y + cup.height);
    ctx.lineTo(cup.x + cup.width / 2 - 10, cup.y + cup.height);
    ctx.lineTo(cup.x + cup.width / 2 - 5, cup.y + 20);
    ctx.closePath();
    ctx.fill();

    if (logoImage && logoImage.complete) {
      const logoCenterX = cup.x;
      const logoCenterY = cup.y + cup.height / 2;
      const logoRadius = 25;
      ctx.drawImage(logoImage, logoCenterX - logoRadius, logoCenterY - logoRadius, logoRadius * 2, logoRadius * 2);
    }

    if (state === 'DONE') {
      const lidY = cup.y;
      const lidWidth = cup.width / 2 + 5;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.strokeStyle = 'rgba(200, 200, 200, 0.8)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(cup.x, lidY, lidWidth, 15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#007042';
      ctx.save();
      ctx.translate(cup.x + 15, lidY - 60);
      ctx.rotate(-0.25);
      ctx.fillRect(0, 0, 8, 120);
      ctx.restore();
    }
  }
}

function drawWaterStream(ctx: CanvasRenderingContext2D, kettle: GameObjects['kettle'], bowl: GameObjects['bowl']) {
  if (kettle.pourProgress <= 0) return;

  const spoutOriginX = kettle.x + kettle.width * 0.05;
  const spoutOriginY = kettle.y + kettle.height * 0.4;
  const endX = spoutOriginX + (bowl.x - spoutOriginX) * kettle.pourProgress;
  const endY = spoutOriginY + (bowl.y - spoutOriginY) * kettle.pourProgress;

  ctx.strokeStyle = 'rgba(173, 216, 230, 0.7)';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(spoutOriginX, spoutOriginY);
  ctx.lineTo(endX, endY);
  ctx.stroke();
}

