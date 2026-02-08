// 페이지 로드 시 권한 확인
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});

let currentUser = null;
let currentReportId = null;
let currentStudentId = null;
let currentSendType = null;

// 권한 확인
function checkAuth() {
    const userStr = sessionStorage.getItem('user');
    if (!userStr) {
        alert('로그인이 필요합니다.');
        window.location.href = 'login.html';
        return;
    }

    currentUser = JSON.parse(userStr);
    
    // 선생님이 아닌 경우 접근 차단
    if (currentUser.role !== 'Teacher') {
        alert('선생님만 접근할 수 있습니다.');
        window.location.href = 'login.html';
        return;
    }

    // 사용자 정보 표시
    document.getElementById('userInfo').textContent = `👨‍🏫 ${currentUser.name || currentUser.username}`;
    document.getElementById('welcomeMessage').textContent = `환영합니다, ${currentUser.name || currentUser.username} 선생님!`;
    
    // 데이터 로드
    loadStudents();
    loadProgress();
    loadReports();
    loadPortfolios();
}

// 로그아웃
function logout() {
    sessionStorage.removeItem('user');
    window.location.href = 'login.html';
}

// 탭 전환
function showTab(tabName) {
    // 모든 탭 비활성화
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // 선택된 탭 활성화
    event.target.classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

// 담당 학생 로드
async function loadStudents() {
    try {
        const response = await fetch('/api/users');
        const allUsers = await response.json();
        
        // 내가 담당하는 학생들만 필터링
        const myStudents = allUsers.filter(u => 
            u.role === 'Student' && u.teacherId === currentUser.id
        );
        
        const container = document.getElementById('studentsList');
        container.innerHTML = '';
        
        if (myStudents.length === 0) {
            container.innerHTML = '<p class="no-data">담당 학생이 없습니다.</p>';
            return;
        }
        
        myStudents.forEach(student => {
            const card = document.createElement('div');
            card.className = 'dashboard-card';
            card.innerHTML = `
                <h4>🎓 ${student.name}</h4>
                <div class="info-item">
                    <strong>아이디:</strong> <span>${student.username}</span>
                </div>
                <div class="info-item">
                    <strong>레벨:</strong> <span class="level-badge">${student.level}</span>
                </div>
                <div class="info-item">
                    <strong>이메일:</strong> <span>${student.email}</span>
                </div>
                <div class="info-item">
                    <strong>학부모 연락처:</strong> <span>${student.parentContact?.phone || '-'}</span>
                </div>
                <div class="info-item">
                    <strong>학부모 이메일:</strong> <span>${student.parentContact?.email || '-'}</span>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error('학생 로드 오류:', error);
    }
}

// 학습 진행 현황 로드
async function loadProgress() {
    try {
        const response = await fetch(`/api/learning-progress?teacherId=${currentUser.id}`);
        const progressData = await response.json();
        
        const container = document.getElementById('progressList');
        container.innerHTML = '';
        
        if (progressData.length === 0) {
            container.innerHTML = '<p class="no-data">학습 진행 현황이 없습니다.</p>';
            return;
        }
        
        progressData.forEach(progress => {
            const card = document.createElement('div');
            card.className = 'progress-card';
            card.innerHTML = `
                <h4>${progress.studentName} - ${progress.course}</h4>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${progress.progress}%"></div>
                    <span class="progress-text">${progress.progress}%</span>
                </div>
                <div class="progress-details">
                    <span>✅ 완료: ${progress.completedLessons}/${progress.totalLessons} 레슨</span>
                    <span>🕒 최근 접속: ${progress.lastAccess}</span>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error('학습 현황 로드 오류:', error);
    }
}

// 리포트 로드
async function loadReports() {
    try {
        const response = await fetch(`/api/reports?teacherId=${currentUser.id}`);
        const reports = await response.json();
        
        const container = document.getElementById('reportsList');
        container.innerHTML = '';
        
        if (reports.length === 0) {
            container.innerHTML = '<p class="no-data">리포트가 없습니다.</p>';
            return;
        }
        
        reports.forEach(report => {
            const card = document.createElement('div');
            card.className = 'report-card';
            card.innerHTML = `
                <div class="report-header">
                    <h4>${report.studentName} - ${report.course}</h4>
                    <span class="report-date">${report.date}</span>
                </div>
                <div class="report-content">
                    <p><strong>점수:</strong> ${report.score}점</p>
                    <p><strong>출석:</strong> ${report.attendance}</p>
                    <p><strong>요약:</strong> ${report.summary}</p>
                    ${report.teacherComment ? `<p class="teacher-comment"><strong>선생님 코멘트:</strong> ${report.teacherComment}</p>` : ''}
                </div>
                <div class="report-actions">
                    <button class="btn btn-primary" onclick="openReportDetail(${report.id})">📝 상세보기/코멘트</button>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error('리포트 로드 오류:', error);
    }
}

// 포트폴리오 로드
async function loadPortfolios() {
    try {
        const response = await fetch(`/api/portfolios?teacherId=${currentUser.id}`);
        const portfolios = await response.json();
        
        const container = document.getElementById('portfoliosList');
        container.innerHTML = '';
        
        if (portfolios.length === 0) {
            container.innerHTML = '<p class="no-data">포트폴리오가 없습니다.</p>';
            return;
        }
        
        portfolios.forEach(portfolio => {
            const card = document.createElement('div');
            card.className = 'portfolio-card';
            card.innerHTML = `
                <img src="${portfolio.image}" alt="${portfolio.title}">
                <div class="portfolio-info">
                    <h4>${portfolio.title}</h4>
                    <p class="portfolio-student">${portfolio.studentName}</p>
                    <p class="portfolio-course">${portfolio.course}</p>
                    <p>${portfolio.description}</p>
                    <p class="portfolio-date">📅 ${portfolio.date}</p>
                    <button class="btn btn-success" onclick="sendPortfolioToParent(${portfolio.studentId}, '${portfolio.title}')">📧 학부모에게 전송</button>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error('포트폴리오 로드 오류:', error);
    }
}

// 리포트 상세 모달 열기
async function openReportDetail(reportId) {
    try {
        const response = await fetch(`/api/reports/${reportId}`);
        const report = await response.json();
        
        currentReportId = reportId;
        currentStudentId = report.studentId;
        
        const detailDiv = document.getElementById('reportDetail');
        detailDiv.innerHTML = `
            <div class="report-detail">
                <p><strong>학생:</strong> ${report.studentName}</p>
                <p><strong>과목:</strong> ${report.course}</p>
                <p><strong>날짜:</strong> ${report.date}</p>
                <p><strong>점수:</strong> ${report.score}점</p>
                <p><strong>출석:</strong> ${report.attendance}</p>
                <p><strong>요약:</strong> ${report.summary}</p>
            </div>
        `;
        
        document.getElementById('teacherComment').value = report.teacherComment || '';
        document.getElementById('reportModal').style.display = 'block';
    } catch (error) {
        console.error('리포트 상세 로드 오류:', error);
        alert('리포트를 불러오는데 실패했습니다.');
    }
}

// 리포트 모달 닫기
function closeReportModal() {
    document.getElementById('reportModal').style.display = 'none';
    currentReportId = null;
}

// 코멘트 저장
async function saveComment() {
    if (!currentReportId) return;
    
    const comment = document.getElementById('teacherComment').value;
    
    try {
        const response = await fetch(`/api/reports/${currentReportId}/comment`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ comment })
        });
        
        if (response.ok) {
            alert('코멘트가 저장되었습니다.');
            loadReports();
            closeReportModal();
        } else {
            throw new Error('저장 실패');
        }
    } catch (error) {
        console.error('코멘트 저장 오류:', error);
        alert('코멘트 저장에 실패했습니다.');
    }
}

// 학부모에게 전송 (리포트)
function sendToParent(type) {
    currentSendType = type;
    document.getElementById('sendResult').innerHTML = '';
    document.getElementById('sendModal').style.display = 'block';
}

// 포트폴리오 학부모 전송
function sendPortfolioToParent(studentId, title) {
    currentStudentId = studentId;
    currentSendType = 'portfolio';
    document.getElementById('sendResult').innerHTML = '';
    document.getElementById('sendModal').style.display = 'block';
}

// 전송 방법 선택
async function selectSendMethod(method) {
    if (!currentStudentId) {
        alert('학생 정보를 찾을 수 없습니다.');
        return;
    }
    
    const methodNames = {
        'email': '이메일',
        'sms': '문자메시지',
        'kakao': '카카오톡'
    };
    
    try {
        const response = await fetch('/api/send-to-parent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                studentId: currentStudentId,
                type: currentSendType,
                method: method,
                content: `학습 ${currentSendType === 'report' ? '리포트' : '포트폴리오'}가 업데이트되었습니다.`
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            document.getElementById('sendResult').innerHTML = `
                <div class="alert alert-success">
                    ✅ ${methodNames[method]}로 전송되었습니다!<br>
                    수신: ${result.recipient}
                </div>
            `;
        } else {
            throw new Error('전송 실패');
        }
    } catch (error) {
        console.error('전송 오류:', error);
        document.getElementById('sendResult').innerHTML = `
            <div class="alert alert-error">
                ❌ 전송에 실패했습니다.
            </div>
        `;
    }
}

// 전송 모달 닫기
function closeSendModal() {
    document.getElementById('sendModal').style.display = 'none';
    currentStudentId = null;
    currentSendType = null;
}

// 모달 외부 클릭 시 닫기
window.onclick = function(event) {
    if (event.target.id === 'reportModal') {
        closeReportModal();
    }
    if (event.target.id === 'sendModal') {
        closeSendModal();
    }
}
