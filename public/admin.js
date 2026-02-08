// 페이지 로드 시 권한 확인
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadUsers();
    loadTeachers();
});

// 권한 확인
function checkAuth() {
    const userStr = sessionStorage.getItem('user');
    if (!userStr) {
        alert('로그인이 필요합니다.');
        window.location.href = 'login.html';
        return;
    }

    const user = JSON.parse(userStr);
    if (user.role !== 'Administrator') {
        alert('관리자만 접근할 수 있습니다.');
        window.location.href = 'dashboard.html';
        return;
    }

    // 사용자 정보 표시
    document.getElementById('userInfo').textContent = `👤 ${user.username} (관리자)`;
}

// 로그아웃
function logout() {
    sessionStorage.removeItem('user');
    window.location.href = 'login.html';
}

// 전역 변수
let users = [];
let teachers = [];

// 사용자 목록 로드
async function loadUsers() {
    try {
        const response = await fetch('/api/users');
        users = await response.json();
        displayUsers(users);
        updateStats();
    } catch (error) {
        console.error('사용자 로드 오류:', error);
        alert('사용자 목록을 불러오는데 실패했습니다.');
    }
}

// 선생님 목록 로드
async function loadTeachers() {
    try {
        const response = await fetch('/api/users');
        const allUsers = await response.json();
        teachers = allUsers.filter(u => u.role === 'Teacher');
        updateTeacherSelect();
    } catch (error) {
        console.error('선생님 로드 오류:', error);
    }
}

// 선생님 선택 박스 업데이트
function updateTeacherSelect() {
    const teacherSelect = document.getElementById('teacherId');
    teacherSelect.innerHTML = '<option value="">선택하세요</option>';
    teachers.forEach(teacher => {
        const option = document.createElement('option');
        option.value = teacher.id;
        option.textContent = `${teacher.name} (${teacher.username})`;
        teacherSelect.appendChild(option);
    });
}

// 사용자 목록 표시
function displayUsers(usersToDisplay) {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';

    usersToDisplay.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td>${user.name || '-'}</td>
            <td>${user.email}</td>
            <td><span class="role-badge role-${user.role.toLowerCase()}">${user.role}</span></td>
            <td><span class="level-badge">${user.level || '-'}</span></td>
            <td>
                <span class="status-badge status-${user.status.toLowerCase()}">
                    ${user.status}
                </span>
            </td>
            <td>${user.createdAt}</td>
            <td>
                <button class="btn btn-edit" onclick="editUser(${user.id})">✏️ 수정</button>
                <button class="btn btn-delete" onclick="deleteUser(${user.id})">🗑️ 삭제</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// 통계 업데이트
function updateStats() {
    const total = users.length;
    const active = users.filter(u => u.status === 'Active').length;
    const inactive = users.filter(u => u.status === 'Inactive').length;

    document.getElementById('totalUsers').textContent = total;
    document.getElementById('activeUsers').textContent = active;
    document.getElementById('inactiveUsers').textContent = inactive;
}

// 사용자 검색
function filterUsers() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filtered = users.filter(user => 
        user.username.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        (user.name && user.name.toLowerCase().includes(searchTerm))
    );
    displayUsers(filtered);
}

// 역할 변경 시 필드 표시/숨김
function handleRoleChange() {
    const role = document.getElementById('role').value;
    const teacherField = document.getElementById('teacherField');
    const parentPhoneField = document.getElementById('parentPhoneField');
    const parentEmailField = document.getElementById('parentEmailField');
    const levelSelect = document.getElementById('level');
    
    if (role === 'Student') {
        teacherField.style.display = 'block';
        parentPhoneField.style.display = 'block';
        parentEmailField.style.display = 'block';
        
        // 학생 레벨 옵션
        levelSelect.innerHTML = `
            <option value="Beginner">초급 (Beginner)</option>
            <option value="Intermediate">중급 (Intermediate)</option>
            <option value="Advanced">고급 (Advanced)</option>
        `;
    } else if (role === 'Teacher') {
        teacherField.style.display = 'none';
        parentPhoneField.style.display = 'none';
        parentEmailField.style.display = 'none';
        
        // 선생님 레벨 옵션
        levelSelect.innerHTML = `
            <option value="Junior">주니어 (Junior)</option>
            <option value="Senior">시니어 (Senior)</option>
        `;
    } else {
        teacherField.style.display = 'none';
        parentPhoneField.style.display = 'none';
        parentEmailField.style.display = 'none';
        
        // 관리자 레벨 옵션
        levelSelect.innerHTML = `
            <option value="Master">마스터 (Master)</option>
        `;
    }
}

// 추가 모달 열기
function openAddModal() {
    document.getElementById('modalTitle').textContent = '새 계정 추가';
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
    document.getElementById('password').disabled = false;
    document.getElementById('password').required = true;
    handleRoleChange(); // 역할에 따른 필드 설정
    document.getElementById('userModal').style.display = 'block';
}

// 수정 모달 열기
async function editUser(id) {
    try {
        const response = await fetch(`/api/users/${id}`);
        const user = await response.json();

        document.getElementById('modalTitle').textContent = '계정 수정';
        document.getElementById('userId').value = user.id;
        document.getElementById('username').value = user.username;
        document.getElementById('name').value = user.name || '';
        document.getElementById('email').value = user.email;
        document.getElementById('role').value = user.role;
        document.getElementById('level').value = user.level || 'Beginner';
        document.getElementById('status').value = user.status;
        
        // 비밀번호 필드는 수정 시 선택사항
        document.getElementById('password').value = '';
        document.getElementById('password').disabled = true;
        document.getElementById('password').required = false;
        
        handleRoleChange();
        
        if (user.role === 'Student') {
            document.getElementById('teacherId').value = user.teacherId || '';
            document.getElementById('parentPhone').value = user.parentContact?.phone || '';
            document.getElementById('parentEmail').value = user.parentContact?.email || '';
        }
        
        document.getElementById('userModal').style.display = 'block';
    } catch (error) {
        console.error('사용자 정보 로드 오류:', error);
        alert('사용자 정보를 불러오는데 실패했습니다.');
    }
}

// 모달 닫기
function closeModal() {
    document.getElementById('userModal').style.display = 'none';
    document.getElementById('userForm').reset();
}

// 사용자 저장 (추가/수정)
async function saveUser(event) {
    event.preventDefault();

    const userId = document.getElementById('userId').value;
    const role = document.getElementById('role').value;
    
    const userData = {
        username: document.getElementById('username').value,
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        role: role,
        level: document.getElementById('level').value,
        status: document.getElementById('status').value
    };
    
    // 새 계정인 경우 비밀번호 포함
    if (!userId) {
        userData.password = document.getElementById('password').value;
    }
    
    // 학생인 경우 추가 정보
    if (role === 'Student') {
        userData.teacherId = parseInt(document.getElementById('teacherId').value) || null;
        userData.parentContact = {
            phone: document.getElementById('parentPhone').value,
            email: document.getElementById('parentEmail').value
        };
    }

    try {
        let response;
        if (userId) {
            // 수정
            response = await fetch(`/api/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
        } else {
            // 추가
            response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
        }

        if (response.ok) {
            closeModal();
            loadUsers();
            loadTeachers();
            alert(userId ? '계정이 수정되었습니다.' : '새 계정이 추가되었습니다.');
        } else {
            throw new Error('저장 실패');
        }
    } catch (error) {
        console.error('저장 오류:', error);
        alert('계정 저장에 실패했습니다.');
    }
}

// 사용자 삭제
async function deleteUser(id) {
    if (!confirm('정말로 이 계정을 삭제하시겠습니까?')) {
        return;
    }

    try {
        const response = await fetch(`/api/users/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadUsers();
            loadTeachers();
            alert('계정이 삭제되었습니다.');
        } else {
            throw new Error('삭제 실패');
        }
    } catch (error) {
        console.error('삭제 오류:', error);
        alert('계정 삭제에 실패했습니다.');
    }
}

// 모달 외부 클릭 시 닫기
window.onclick = function(event) {
    const modal = document.getElementById('userModal');
    if (event.target === modal) {
        closeModal();
    }
}
