const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// 미들웨어 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// 로그인 계정 데이터
let accounts = [
    { id: 1, username: 'admin', password: 'admin123', role: 'Administrator', name: '관리자', level: 'Master' },
    { id: 2, username: 'teacher1', password: 'teacher123', role: 'Teacher', name: '김선생', level: 'Senior', students: [4, 5] },
    { id: 3, username: 'teacher2', password: 'teacher123', role: 'Teacher', name: '이선생', level: 'Junior', students: [] },
    { id: 4, username: 'student1', password: 'student123', role: 'Student', name: '박학생', level: 'Beginner', teacherId: 2, parentContact: { phone: '010-1234-5678', email: 'parent1@example.com' } },
    { id: 5, username: 'student2', password: 'student123', role: 'Student', name: '최학생', level: 'Intermediate', teacherId: 2, parentContact: { phone: '010-9876-5432', email: 'parent2@example.com' } }
];

// 사용자 데이터
let users = [
    { id: 1, username: 'admin', email: 'admin@aibridge.com', name: '관리자', role: 'Administrator', level: 'Master', status: 'Active', createdAt: '2024-01-15' },
    { id: 2, username: 'teacher1', email: 'teacher1@aibridge.com', name: '김선생', role: 'Teacher', level: 'Senior', status: 'Active', createdAt: '2024-02-01', students: [4, 5] },
    { id: 3, username: 'teacher2', email: 'teacher2@aibridge.com', name: '이선생', role: 'Teacher', level: 'Junior', status: 'Active', createdAt: '2024-02-02', students: [] },
    { id: 4, username: 'student1', email: 'student1@aibridge.com', name: '박학생', role: 'Student', level: 'Beginner', status: 'Active', createdAt: '2024-02-03', teacherId: 2, parentContact: { phone: '010-1234-5678', email: 'parent1@example.com' } },
    { id: 5, username: 'student2', email: 'student2@aibridge.com', name: '최학생', role: 'Student', level: 'Intermediate', status: 'Active', createdAt: '2024-02-04', teacherId: 2, parentContact: { phone: '010-9876-5432', email: 'parent2@example.com' } }
];

// 학습 진행 현황 데이터
let learningProgress = [
    { id: 1, studentId: 4, studentName: '박학생', course: 'Python 기초', progress: 75, completedLessons: 15, totalLessons: 20, lastAccess: '2024-02-08' },
    { id: 2, studentId: 4, studentName: '박학생', course: 'AI 입문', progress: 30, completedLessons: 6, totalLessons: 20, lastAccess: '2024-02-07' },
    { id: 3, studentId: 5, studentName: '최학생', course: 'Python 기초', progress: 90, completedLessons: 18, totalLessons: 20, lastAccess: '2024-02-08' },
    { id: 4, studentId: 5, studentName: '최학생', course: 'AI 입문', progress: 60, completedLessons: 12, totalLessons: 20, lastAccess: '2024-02-08' }
];

// 학습 리포트 데이터
let reports = [
    { 
        id: 1, 
        studentId: 4, 
        studentName: '박학생',
        course: 'Python 기초',
        date: '2024-02-08',
        score: 85,
        attendance: '출석',
        summary: 'Python 기초 문법을 잘 이해하고 있습니다. 반복문과 조건문 활용이 우수합니다.',
        teacherComment: '매우 좋은 진전을 보이고 있습니다. 계속 노력하세요!',
        teacherId: 2
    },
    { 
        id: 2, 
        studentId: 5, 
        studentName: '최학생',
        course: 'Python 기초',
        date: '2024-02-08',
        score: 92,
        attendance: '출석',
        summary: '뛰어난 이해력과 문제 해결 능력을 보여줍니다.',
        teacherComment: '훌륭합니다! 다음 단계로 진행할 준비가 되었습니다.',
        teacherId: 2
    }
];

// 포트폴리오 데이터
let portfolios = [
    {
        id: 1,
        studentId: 4,
        studentName: '박학생',
        title: '계산기 프로그램',
        course: 'Python 기초',
        description: '사칙연산을 수행하는 간단한 계산기',
        date: '2024-02-05',
        files: ['calculator.py'],
        image: 'https://via.placeholder.com/300x200?text=Calculator+Project'
    },
    {
        id: 2,
        studentId: 5,
        studentName: '최학생',
        title: '간단한 게임',
        course: 'Python 기초',
        description: '숫자 맞추기 게임',
        date: '2024-02-06',
        files: ['number_game.py'],
        image: 'https://via.placeholder.com/300x200?text=Number+Game'
    }
];

// ============ 인증 API ============
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const account = accounts.find(a => a.username === username && a.password === password);
    
    if (account) {
        res.json({
            success: true,
            user: {
                id: account.id,
                username: account.username,
                name: account.name,
                role: account.role,
                level: account.level,
                teacherId: account.teacherId,
                students: account.students
            }
        });
    } else {
        res.status(401).json({ success: false, message: '아이디 또는 비밀번호가 잘못되었습니다.' });
    }
});

// ============ 사용자 관리 API (관리자) ============
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
    const maxId = users.length > 0 ? Math.max(...users.map(u => u.id)) : 0;
    const newUser = {
        id: maxId + 1,
        username: req.body.username,
        email: req.body.email,
        name: req.body.name,
        password: req.body.password || 'default123',
        role: req.body.role || 'Student',
        level: req.body.level || 'Beginner',
        status: 'Active',
        createdAt: new Date().toISOString().split('T')[0],
        teacherId: req.body.teacherId || null,
        students: req.body.role === 'Teacher' ? [] : undefined,
        parentContact: req.body.parentContact || { phone: '', email: '' }
    };
    
    users.push(newUser);
    
    // accounts에도 추가
    accounts.push({
        id: newUser.id,
        username: newUser.username,
        password: newUser.password,
        name: newUser.name,
        role: newUser.role,
        level: newUser.level,
        teacherId: newUser.teacherId,
        students: newUser.students,
        parentContact: newUser.parentContact
    });
    
    res.status(201).json(newUser);
});

app.put('/api/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const userIndex = users.findIndex(u => u.id === userId);
    const accountIndex = accounts.findIndex(a => a.id === userId);
    
    if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...req.body };
        if (accountIndex !== -1) {
            accounts[accountIndex] = { ...accounts[accountIndex], ...req.body };
        }
        res.json(users[userIndex]);
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

app.delete('/api/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const userIndex = users.findIndex(u => u.id === userId);
    const accountIndex = accounts.findIndex(a => a.id === userId);
    
    if (userIndex !== -1) {
        users.splice(userIndex, 1);
        if (accountIndex !== -1) {
            accounts.splice(accountIndex, 1);
        }
        res.json({ message: 'User deleted successfully' });
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

// ============ 학습 진행 현황 API ============
app.get('/api/learning-progress', (req, res) => {
    const { teacherId, studentId } = req.query;
    
    let filtered = learningProgress;
    
    if (studentId) {
        filtered = filtered.filter(p => p.studentId === parseInt(studentId));
    } else if (teacherId) {
        const teacher = users.find(u => u.id === parseInt(teacherId));
        if (teacher && teacher.students) {
            filtered = filtered.filter(p => teacher.students.includes(p.studentId));
        }
    }
    
    res.json(filtered);
});

// ============ 리포트 API ============
app.get('/api/reports', (req, res) => {
    const { teacherId, studentId } = req.query;
    
    let filtered = reports;
    
    if (studentId) {
        filtered = filtered.filter(r => r.studentId === parseInt(studentId));
    } else if (teacherId) {
        const teacher = users.find(u => u.id === parseInt(teacherId));
        if (teacher && teacher.students) {
            filtered = filtered.filter(r => teacher.students.includes(r.studentId));
        }
    }
    
    res.json(filtered);
});

app.get('/api/reports/:id', (req, res) => {
    const report = reports.find(r => r.id === parseInt(req.params.id));
    if (report) {
        res.json(report);
    } else {
        res.status(404).json({ error: 'Report not found' });
    }
});

app.put('/api/reports/:id/comment', (req, res) => {
    const reportIndex = reports.findIndex(r => r.id === parseInt(req.params.id));
    if (reportIndex !== -1) {
        reports[reportIndex].teacherComment = req.body.comment;
        res.json(reports[reportIndex]);
    } else {
        res.status(404).json({ error: 'Report not found' });
    }
});

// ============ 포트폴리오 API ============
app.get('/api/portfolios', (req, res) => {
    const { teacherId, studentId } = req.query;
    
    let filtered = portfolios;
    
    if (studentId) {
        filtered = filtered.filter(p => p.studentId === parseInt(studentId));
    } else if (teacherId) {
        const teacher = users.find(u => u.id === parseInt(teacherId));
        if (teacher && teacher.students) {
            filtered = filtered.filter(p => teacher.students.includes(p.studentId));
        }
    }
    
    res.json(filtered);
});

app.get('/api/portfolios/:id', (req, res) => {
    const portfolio = portfolios.find(p => p.id === parseInt(req.params.id));
    if (portfolio) {
        res.json(portfolio);
    } else {
        res.status(404).json({ error: 'Portfolio not found' });
    }
});

// ============ 학부모 전송 API ============
app.post('/api/send-to-parent', (req, res) => {
    const { studentId, type, method, content } = req.body;
    const student = users.find(u => u.id === parseInt(studentId));
    
    if (!student || !student.parentContact) {
        return res.status(404).json({ error: 'Student or parent contact not found' });
    }
    
    // 실제로는 여기서 카카오톡, 문자, 이메일 API 호출
    console.log(`Sending ${type} to parent via ${method}:`);
    console.log(`Student: ${student.name}`);
    console.log(`Parent Contact: ${JSON.stringify(student.parentContact)}`);
    console.log(`Content: ${content}`);
    
    res.json({ 
        success: true, 
        message: `${method}로 전송되었습니다.`,
        recipient: method === 'email' ? student.parentContact.email : student.parentContact.phone
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI-BRIDGE server running on port ${PORT}`);
});
