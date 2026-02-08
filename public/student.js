// 페이지 로드 시 권한 확인
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});

let currentUser = null;

// 권한 확인
function checkAuth() {
    const userStr = sessionStorage.getItem('user');
    if (!userStr) {
        alert('로그인이 필요합니다.');
        window.location.href = 'login.html';
        return;
    }

    currentUser = JSON.parse(userStr);
    
    // 학생이 아닌 경우 접근 차단
    if (currentUser.role !== 'Student') {
        alert('학생만 접근할 수 있습니다.');
        window.location.href = 'login.html';
        return;
    }

    // 사용자 정보 표시
    document.getElementById('userInfo').textContent = `🎓 ${currentUser.name || currentUser.username}`;
    document.getElementById('welcomeMessage').textContent = `환영합니다, ${currentUser.name || currentUser.username}님!`;
    
    // 데이터 로드
    loadMyProgress();
    loadMyReports();
    loadMyPortfolios();
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

// 학습 시작
function startLearning(course) {
    const courseNames = {
        'python': 'Python 기초',
        'ai': 'AI 입문',
        'web': '웹 개발'
    };
    
    alert(`${courseNames[course]} 학습을 시작합니다!\n\n(실제 학습 플랫폼으로 연결됩니다)`);
    // 실제로는 학습 플랫폼으로 이동
}

// 나의 학습 진행 현황 로드
async function loadMyProgress() {
    try {
        const response = await fetch(`/api/learning-progress?studentId=${currentUser.id}`);
        const progressData = await response.json();
        
        const container = document.getElementById('myProgressList');
        container.innerHTML = '';
        
        if (progressData.length === 0) {
            container.innerHTML = '<p class="no-data">학습 진행 현황이 없습니다. 학습을 시작해보세요!</p>';
            return;
        }
        
        progressData.forEach(progress => {
            const card = document.createElement('div');
            card.className = 'progress-card';
            card.innerHTML = `
                <h4>${progress.course}</h4>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${progress.progress}%"></div>
                    <span class="progress-text">${progress.progress}%</span>
                </div>
                <div class="progress-details">
                    <span>✅ 완료: ${progress.completedLessons}/${progress.totalLessons} 레슨</span>
                    <span>🕒 최근 접속: ${progress.lastAccess}</span>
                </div>
                <button class="btn btn-primary" onclick="startLearning('continue')">이어서 학습하기</button>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error('학습 현황 로드 오류:', error);
    }
}

// 나의 리포트 로드
async function loadMyReports() {
    try {
        const response = await fetch(`/api/reports?studentId=${currentUser.id}`);
        const reports = await response.json();
        
        const container = document.getElementById('myReportsList');
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
                    <h4>${report.course}</h4>
                    <span class="report-date">${report.date}</span>
                </div>
                <div class="report-content">
                    <p><strong>점수:</strong> <span class="score-badge">${report.score}점</span></p>
                    <p><strong>출석:</strong> ${report.attendance}</p>
                    <p><strong>요약:</strong> ${report.summary}</p>
                    ${report.teacherComment ? `
                        <div class="teacher-comment-box">
                            <p class="comment-label">💬 선생님 코멘트:</p>
                            <p class="teacher-comment">${report.teacherComment}</p>
                        </div>
                    ` : ''}
                </div>
                <div class="report-actions">
                    <button class="btn btn-primary" onclick="openReportDetail(${report.id})">📝 상세보기</button>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error('리포트 로드 오류:', error);
    }
}

// 나의 포트폴리오 로드
async function loadMyPortfolios() {
    try {
        const response = await fetch(`/api/portfolios?studentId=${currentUser.id}`);
        const portfolios = await response.json();
        
        const container = document.getElementById('myPortfoliosList');
        container.innerHTML = '';
        
        if (portfolios.length === 0) {
            container.innerHTML = '<p class="no-data">포트폴리오가 없습니다. 프로젝트를 완성하고 포트폴리오를 만들어보세요!</p>';
            return;
        }
        
        portfolios.forEach(portfolio => {
            const card = document.createElement('div');
            card.className = 'portfolio-card';
            card.innerHTML = `
                <img src="${portfolio.image}" alt="${portfolio.title}">
                <div class="portfolio-info">
                    <h4>${portfolio.title}</h4>
                    <p class="portfolio-course">${portfolio.course}</p>
                    <p>${portfolio.description}</p>
                    <p class="portfolio-date">📅 ${portfolio.date}</p>
                    <div class="portfolio-files">
                        <strong>파일:</strong> ${portfolio.files.join(', ')}
                    </div>
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
        
        const detailDiv = document.getElementById('reportDetail');
        detailDiv.innerHTML = `
            <div class="report-detail">
                <p><strong>과목:</strong> ${report.course}</p>
                <p><strong>날짜:</strong> ${report.date}</p>
                <p><strong>점수:</strong> <span class="score-badge">${report.score}점</span></p>
                <p><strong>출석:</strong> ${report.attendance}</p>
                <p><strong>학습 요약:</strong></p>
                <p>${report.summary}</p>
                ${report.teacherComment ? `
                    <div class="teacher-comment-box" style="margin-top: 20px;">
                        <p class="comment-label">💬 선생님의 피드백:</p>
                        <p class="teacher-comment">${report.teacherComment}</p>
                    </div>
                ` : '<p class="no-comment">선생님 코멘트가 아직 없습니다.</p>'}
            </div>
        `;
        
        document.getElementById('reportModal').style.display = 'block';
    } catch (error) {
        console.error('리포트 상세 로드 오류:', error);
        alert('리포트를 불러오는데 실패했습니다.');
    }
}

// 리포트 모달 닫기
function closeReportModal() {
    document.getElementById('reportModal').style.display = 'none';
}

// 모달 외부 클릭 시 닫기
window.onclick = function(event) {
    if (event.target.id === 'reportModal') {
        closeReportModal();
    }
}
