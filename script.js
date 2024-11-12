const canvas = document.getElementById('fireworks');
const ctx = canvas.getContext('2d');

// 获取音效元素
const audioElements = [
    document.getElementById('boom1'),
    document.getElementById('boom2'),
    document.getElementById('boom3'),
    document.getElementById('boom4')
];

let currentAudioIndex = 0;

// 设置画布尺寸
function setCanvasSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
setCanvasSize();
window.addEventListener('resize', setCanvasSize);

// 颜色数组
const colors = [
    '#ff0000', '#ffa500', '#ffff00', '#00ff00', '#00ffff', '#ff00ff',
    '#ff1493', '#4169e1', '#9400d3', '#7fff00', '#ff4500', '#00ffff',
    '#ff69b4', '#00bfff', '#32cd32', '#ba55d3', '#ff6347', '#87ceeb'
];

// 烟花粒子类
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = '#B87333'; // 铜色
        this.velocity = {
            x: (Math.random() - 0.5) * 4,
            y: (Math.random() - 0.5) * 4
        };
        this.alpha = 1;
        this.friction = 0.995;
        this.gravity = 0.05;
        this.rotation = Math.random() * Math.PI * 2;
        this.size = 15;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // 绘制铜钱外圆
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        
        // 铜钱渐变色
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
        gradient.addColorStop(0, '#CD7F32');
        gradient.addColorStop(0.7, '#B87333');
        gradient.addColorStop(1, '#8B4513');
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // 绘制内方孔
        ctx.beginPath();
        const holeSize = this.size * 0.3;
        ctx.rect(-holeSize, -holeSize, holeSize * 2, holeSize * 2);
        ctx.fillStyle = '#000';
        ctx.fill();
        
        // 添加铜钱纹路
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.8, 0, Math.PI * 2);
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // 添加四个方向的古钱文字效果
        const textSize = this.size * 0.4;
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(-textSize/3, -this.size * 0.7, textSize/1.5, textSize/2);
        ctx.fillRect(-textSize/3, this.size * 0.7 - textSize/2, textSize/1.5, textSize/2);
        ctx.fillRect(-this.size * 0.7, -textSize/3, textSize/2, textSize/1.5);
        ctx.fillRect(this.size * 0.7 - textSize/2, -textSize/3, textSize/2, textSize/1.5);
        
        ctx.restore();
    }

    update() {
        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;
        this.velocity.y += this.gravity;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= 0.001;
        this.rotation += 0.005;
    }
}

// 发射物类
class Rocket {
    constructor(x, y, targetY) {
        this.x = x;
        this.y = y;
        this.targetY = targetY;
        this.speed = 3;
        this.trail = [];
        this.color = '#fff';
        this.timeToExplode = 3000;
        this.startTime = Date.now();
    }

    draw() {
        ctx.beginPath();
        for (let i = 0; i < this.trail.length; i++) {
            const point = this.trail[i];
            ctx.fillStyle = `rgba(255, 255, 255, ${i / this.trail.length})`;
            ctx.fillRect(point.x, point.y, 2, 2);
        }
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, 3, 8);
    }

    update() {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 20) this.trail.shift();
        this.y -= this.speed;
        return Date.now() - this.startTime >= this.timeToExplode;
    }
}

let particles = [];
let rockets = [];

function createFirework(x, y) {
    const particleCount = 25;
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(x, y));
    }
}

function animate() {
    requestAnimationFrame(animate);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    rockets = rockets.filter(rocket => {
        rocket.draw();
        const exploded = rocket.update();
        if (exploded) {
            createFirework(rocket.x, rocket.y);
            return false;
        }
        return true;
    });

    particles = particles.filter(particle => {
        if (particle.alpha <= 0) return false;
        particle.update();
        particle.draw();
        return true;
    });
}

// 添加背景音效循环播放函数
function playBackgroundMusic() {
    const audio = audioElements[currentAudioIndex];
    audio.currentTime = 0;
    audio.play()
        .then(() => {
            setTimeout(() => {
                currentAudioIndex = (currentAudioIndex + 1) % 4;
                playBackgroundMusic();
            }, 5000);
        })
        .catch(e => console.log('等待用户交互'));
}

// 自动发射函数
function autoLaunch() {
    const randomX = Math.random() * canvas.width;
    const targetY = 100 + Math.random() * 100;
    rockets.push(new Rocket(randomX, canvas.height, targetY));
    setTimeout(autoLaunch, 800);
}

// 添加开始按钮
const startButton = document.createElement('button');
startButton.textContent = '点击开始';
startButton.style.position = 'absolute';
startButton.style.top = '50%';
startButton.style.left = '50%';
startButton.style.transform = 'translate(-50%, -50%)';
startButton.style.padding = '10px 20px';
startButton.style.fontSize = '20px';
document.body.appendChild(startButton);

// 点击开始按钮时启动自动发射和音效
startButton.addEventListener('click', () => {
    startButton.remove();
    playBackgroundMusic();
    autoLaunch();
});

// 点击发射时播放额外的音效
canvas.addEventListener('click', (e) => {
    const targetY = 100 + Math.random() * 100;
    const randomAudio = audioElements[Math.floor(Math.random() * 4)].cloneNode();
    randomAudio.play();
    rockets.push(new Rocket(e.clientX, canvas.height, targetY));
});

animate();