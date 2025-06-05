class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        this.player = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 50,
            width: 40,
            height: 30,
            speed: 5
        };
        
        this.bullets = [];
        this.enemyBullets = [];
        this.enemies = [];
        this.shields = [];
        this.score = 0;
        this.lives = 3;
        this.gameLoop = null;
        this.enemySpawnInterval = null;
        this.enemyMoveInterval = null;
        this.enemyShootInterval = null;
        
        this.enemyDirection = 1;
        this.baseEnemySpeed = 5;
        this.enemySpeed = this.baseEnemySpeed;
        this.enemyRows = 5;
        this.enemyCols = 11;
        this.enemyTypes = [
            { color: '#ff0000', points: 30, width: 30, height: 30 },
            { color: '#00ff00', points: 20, width: 30, height: 30 },
            { color: '#0000ff', points: 10, width: 30, height: 30 }
        ];
        
        this.keys = {};
        this.setupEventListeners();
        this.createShields();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.keys[e.key] = true);
        document.addEventListener('keyup', (e) => this.keys[e.key] = false);
        document.getElementById('startButton').addEventListener('click', () => this.start());
    }
    
    createShields() {
        const shieldPositions = [200, 400, 600];
        shieldPositions.forEach(x => {
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 4; j++) {
                    this.shields.push({
                        x: x + j * 10,
                        y: this.canvas.height - 150 + i * 10,
                        width: 8,
                        height: 8,
                        health: 3
                    });
                }
            }
        });
    }
    
    start() {
        if (this.gameLoop) return;
        
        this.score = 0;
        this.lives = 3;
        this.bullets = [];
        this.enemyBullets = [];
        this.enemies = [];
        this.updateScore();
        this.updateLives();
        
        this.createEnemies();
        this.enemyMoveInterval = setInterval(() => this.moveEnemies(), 1000);
        this.enemyShootInterval = setInterval(() => this.enemyShoot(), 2000);
        this.gameLoop = setInterval(() => this.update(), 1000 / 60);
    }
    
    createEnemies() {
        this.enemies = [
            {
                x: 350,
                y: 200,
                width: 30,
                height: 30,
                color: '#ff0000',
                points: 30
            },
            {
                x: 400,
                y: 200,
                width: 30,
                height: 30,
                color: '#00ff00',
                points: 20
            }
        ];
    }
    
    moveEnemies() {
        let shouldChangeDirection = false;
        
        const totalEnemies = this.enemyRows * this.enemyCols;
        const remainingEnemies = this.enemies.length;
        const speedMultiplier = 1 + (totalEnemies - remainingEnemies) / totalEnemies;
        this.enemySpeed = this.baseEnemySpeed * speedMultiplier;
        
        this.enemies.forEach(enemy => {
            enemy.x += this.enemySpeed * this.enemyDirection;
            if (enemy.x <= 0 || enemy.x + enemy.width >= this.canvas.width) {
                shouldChangeDirection = true;
            }
        });
        
        if (shouldChangeDirection) {
            this.enemyDirection *= -1;
            this.enemies.forEach(enemy => {
                enemy.y += 20;
            });
        }
    }
    
    enemyShoot() {
        if (this.enemies.length === 0) return;
        
        const randomEnemy = this.enemies[Math.floor(Math.random() * this.enemies.length)];
        this.enemyBullets.push({
            x: randomEnemy.x + randomEnemy.width / 2 - 2,
            y: randomEnemy.y + randomEnemy.height,
            width: 4,
            height: 10,
            speed: 3
        });
    }
    
    drawPlayer() {
        const { x, y, width, height } = this.player;
        const dotSize = 5;
        
        // プレイヤーのドットパターン
        const pattern = [
            [0,0,1,1,1,0,0],
            [0,1,1,1,1,1,0],
            [1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1],
            [0,1,1,1,1,1,0]
        ];
        
        this.ctx.fillStyle = '#0f0';
        for (let row = 0; row < pattern.length; row++) {
            for (let col = 0; col < pattern[row].length; col++) {
                if (pattern[row][col]) {
                    this.ctx.fillRect(
                        x + col * dotSize,
                        y + row * dotSize,
                        dotSize,
                        dotSize
                    );
                }
            }
        }
    }
    
    drawEnemy(enemy) {
        const { x, y, width, height, color } = enemy;
        const dotSize = 5;
        
        // 敵のドットパターン（種類によって少し異なる）
        const patterns = [
            // 赤い敵（上段）
            [
                [0,1,0,0,0,1,0],
                [0,0,1,0,1,0,0],
                [0,0,1,1,1,0,0],
                [0,1,1,1,1,1,0],
                [1,1,0,1,0,1,1],
                [1,1,1,1,1,1,1]
            ],
            // 緑の敵（中段）
            [
                [0,0,1,0,1,0,0],
                [0,1,1,1,1,1,0],
                [1,1,1,1,1,1,1],
                [1,1,0,1,0,1,1],
                [0,1,1,1,1,1,0],
                [0,0,1,0,1,0,0]
            ],
            // 青い敵（下段）
            [
                [0,0,0,1,0,0,0],
                [0,0,1,1,1,0,0],
                [0,1,1,1,1,1,0],
                [1,1,1,1,1,1,1],
                [0,1,0,1,0,1,0],
                [0,0,1,0,1,0,0]
            ]
        ];
        
        // 敵の種類に応じてパターンを選択
        const patternIndex = enemy.color === '#ff0000' ? 0 : 
                           enemy.color === '#00ff00' ? 1 : 2;
        const pattern = patterns[patternIndex];
        
        this.ctx.fillStyle = color;
        for (let row = 0; row < pattern.length; row++) {
            for (let col = 0; col < pattern[row].length; col++) {
                if (pattern[row][col]) {
                    this.ctx.fillRect(
                        x + col * dotSize,
                        y + row * dotSize,
                        dotSize,
                        dotSize
                    );
                }
            }
        }
    }
    
    update() {
        console.log('update', performance.now());
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // プレイヤーの移動
        if (this.keys['ArrowLeft'] && this.player.x > 0) {
            this.player.x -= this.player.speed;
        }
        if (this.keys['ArrowRight'] && this.player.x < this.canvas.width - this.player.width) {
            this.player.x += this.player.speed;
        }
        
        // 弾の発射
        if (this.keys[' '] && this.bullets.length < 3) {
            this.bullets.push({
                x: this.player.x + this.player.width / 2 - 2,
                y: this.player.y,
                width: 4,
                height: 8,
                speed: 7
            });
        }
        
        // 1. 弾の移動
        this.bullets.forEach(bullet => {
            bullet.y -= bullet.speed;
        });

        // 2. 弾と敵の衝突判定（最初に当たったペアのみ記録）
        let hitBulletIndex = null;
        let hitEnemyIndex = null;
        for (let b = 0; b < this.bullets.length; b++) {
            for (let e = 0; e < this.enemies.length; e++) {
                if (this.checkCollision(this.bullets[b], this.enemies[e])) {
                    hitBulletIndex = b;
                    hitEnemyIndex = e;
                    break;
                }
            }
            if (hitBulletIndex !== null) break;
        }
        // 3. 衝突した弾・敵を削除
        if (hitBulletIndex !== null && hitEnemyIndex !== null) {
            this.score += this.enemies[hitEnemyIndex].points;
            this.updateScore();
            this.bullets.splice(hitBulletIndex, 1);
            this.enemies.splice(hitEnemyIndex, 1);
        }
        // 4. 残りの弾を描画
        this.bullets = this.bullets.filter(bullet => {
            this.ctx.fillStyle = '#0f0';
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
            return bullet.y > 0;
        });
        
        // 敵の描画とプレイヤー衝突・画面下到達判定
        for (const enemy of this.enemies) {
            this.drawEnemy(enemy);
            if (this.checkCollision(enemy, this.player)) {
                this.lives--;
                this.updateLives();
                if (this.lives <= 0) {
                    this.gameOver();
                }
                this.enemies = this.enemies.filter(e => e !== enemy);
                break;
            }
            if (enemy.y + enemy.height >= this.canvas.height) {
                this.gameOver();
                this.enemies = [];
                break;
            }
        }
        
        // 敵の弾の移動
        this.enemyBullets = this.enemyBullets.filter(bullet => {
            bullet.y += bullet.speed;
            this.ctx.fillStyle = '#f00';
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
            return bullet.y < this.canvas.height;
        });
        
        // シールドの描画と衝突判定
        this.shields.forEach(shield => {
            if (shield.health > 0) {
                this.ctx.fillStyle = '#0f0';
                // シールドをドットパターンで描画
                for (let i = 0; i < shield.width; i += 5) {
                    for (let j = 0; j < shield.height; j += 5) {
                        if ((i + j) % 10 === 0) {
                            this.ctx.fillRect(shield.x + i, shield.y + j, 5, 5);
                        }
                    }
                }
            }
        });
        
        // シールドと弾の衝突判定
        this.shields.forEach(shield => {
            if (shield.health <= 0) return;
            
            this.bullets = this.bullets.filter(bullet => {
                if (this.checkCollision(bullet, shield)) {
                    shield.health--;
                    return false;
                }
                return true;
            });
            
            this.enemyBullets = this.enemyBullets.filter(bullet => {
                if (this.checkCollision(bullet, shield)) {
                    shield.health--;
                    return false;
                }
                return true;
            });
        });
        
        // 敵の弾とプレイヤーの衝突判定
        this.enemyBullets = this.enemyBullets.filter(bullet => {
            if (this.checkCollision(bullet, this.player)) {
                this.lives--;
                this.updateLives();
                if (this.lives <= 0) {
                    this.gameOver();
                }
                return false;
            }
            return true;
        });
        
        // プレイヤーの描画
        this.drawPlayer();
        
        // クリア判定
        if (this.enemies.length === 0) {
            this.gameClear();
        }
    }
    
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    updateScore() {
        document.getElementById('score').textContent = this.score;
    }
    
    updateLives() {
        document.getElementById('lives').textContent = this.lives;
    }
    
    gameOver() {
        clearInterval(this.gameLoop);
        clearInterval(this.enemyMoveInterval);
        clearInterval(this.enemyShootInterval);
        this.gameLoop = null;
        this.enemyMoveInterval = null;
        this.enemyShootInterval = null;
        alert(`ゲームオーバー！スコア: ${this.score}`);
    }
    
    gameClear() {
        clearInterval(this.gameLoop);
        clearInterval(this.enemyMoveInterval);
        clearInterval(this.enemyShootInterval);
        this.gameLoop = null;
        this.enemyMoveInterval = null;
        this.enemyShootInterval = null;
        alert(`ステージクリア！スコア: ${this.score}`);
    }
}

// ゲームのインスタンスを作成
const game = new Game(); 