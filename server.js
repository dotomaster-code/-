const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// 미들웨어 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// 로그인 계정 데이터 (실제로는 데이터베이스와 암호화 사용)
let accounts = [
    { id: 1, username: 'admin', password: 'admin123', role: 'Administrator' },
    { id: 2, username: 'user1', password: 'user123', role: 'User' }
];

// 샘플 사용자 데이터 (실제로는 데이터베이스 사용)
let users = [
    { id: 1, username: 'admin', email: 'admin@ibridge.com', role: 'Administrator', status: 'Active', createdAt: '2024-01-15' },
    { id: 2, username: 'user1', email: 'user1@ibridge.com', role: 'User', status: 'Active', createdAt: '2024-02-01' },
    { id: 3, username: 'user2', email: 'user2@ibridge.com', role: 'User', status: 'Inactive', createdAt: '2024-02-05' }
];

// 로그인 API
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const account = accounts.find(a => a.username === username && a.password === password);
    
    if (account) {
        res.json({
            success: true,
            user: {
                id: account.id,
                username: account.username,
                role: account.role
            }
        });
    } else {
        res.status(401).json({ success: false, message: '아이디 또는 비밀번호가 잘못되었습니다.' });
    }
});

// 세션 확인 API
app.get('/api/check-session', (req, res) => {
    // 실제로는 세션 또는 JWT 토큰을 사용
    res.json({ success: true });
});

// API 엔드포인트
app.get('/api/users', (req, res) => {
    res.json(users);
});

app.get('/api/users/:id', (req, res) => {
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

app.post('/api/users', (req, res) => {
    const newUser = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        username: req.body.username,
        email: req.body.email,
        role: req.body.role || 'User',
        status: req.body.status || 'Active',
        createdAt: new Date().toISOString().split('T')[0]
    };
    users.push(newUser);
    res.status(201).json(newUser);
});

app.put('/api/users/:id', (req, res) => {
    const index = users.findIndex(u => u.id === parseInt(req.params.id));
    if (index !== -1) {
        users[index] = { ...users[index], ...req.body };
        res.json(users[index]);
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

app.delete('/api/users/:id', (req, res) => {
    const index = users.findIndex(u => u.id === parseInt(req.params.id));
    if (index !== -1) {
        users.splice(index, 1);
        res.json({ message: 'User deleted successfully' });
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`I-BRIDGE server running on port ${PORT}`);
});
