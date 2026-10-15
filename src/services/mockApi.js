// D:\STUDY\TAILIEUHOC_\TTTN\flappy-bird\src\services\mockApi.js
// Giả lập 5 API theo hợp đồng với Backend, lưu trữ vào localStorage

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

// Danh sách skin có trong cửa hàng
export const AVAILABLE_SKINS = [
  {
    id: 'default',
    name: 'Vàng Cổ Điển',
    price: 0,
    colors: { bird: '#ffb52e', wing: '#ffd77a', beak: '#ef5a3c' },
    description: 'Chú chim Flappy Bird nguyên bản',
  },
  {
    id: 'blue',
    name: 'Xanh Đại Dương',
    price: 15,
    colors: { bird: '#38bdf8', wing: '#bae6fd', beak: '#f97316' },
    description: 'Bộ lông xanh mát rượi của biển cả',
  },
  {
    id: 'red',
    name: 'Phượng Hoàng Đỏ',
    price: 30,
    colors: { bird: '#ef4444', wing: '#fca5a5', beak: '#fbbf24' },
    description: 'Mang ngọn lửa rực cháy xuyên qua các cột ống',
  },
  {
    id: 'gold',
    name: 'Hoàng Kim Vua',
    price: 50,
    colors: { bird: '#fbbf24', wing: '#fef08a', beak: '#ea580c' },
    description: 'Khoác lên mình bộ giáp vàng lấp lánh của nhà vô địch',
  },
  {
    id: 'shadow',
    name: 'Bóng Đêm',
    price: 80,
    colors: { bird: '#475569', wing: '#94a3b8', beak: '#cbd5e1' },
    description: 'Huyền bí và ẩn mình trong màn đêm',
  },
];

// Khởi tạo dữ liệu người dùng và leaderboard ban đầu trong localStorage
function initMockData() {
  if (!localStorage.getItem('flappy_users')) {
    const demoUsers = [
      { id: 'u1', username: 'pro_gamer', password: '123', bestScore: 48, coins: 150, ownedSkins: ['default', 'blue', 'gold'], activeSkin: 'gold' },
      { id: 'u2', username: 'flappy_king', password: '123', bestScore: 35, coins: 80, ownedSkins: ['default', 'red'], activeSkin: 'red' },
      { id: 'u3', username: 'shadow_ninja', password: '123', bestScore: 24, coins: 45, ownedSkins: ['default'], activeSkin: 'default' },
    ];
    localStorage.setItem('flappy_users', JSON.stringify(demoUsers));
  }
}
initMockData();

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem('flappy_users')) || [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem('flappy_users', JSON.stringify(users));
}

// 1. API Đăng Ký
export async function mockRegister({ username, password }) {
  await delay();
  const users = getUsers();
  if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
    throw new Error('Tên đăng nhập đã tồn tại! Vui lòng chọn tên khác.');
  }

  const newUser = {
    id: 'u_' + Date.now(),
    username,
    password,
    bestScore: 0,
    coins: 50, // Tặng 50 xu khi mở tài khoản mới
    ownedSkins: ['default'],
    activeSkin: 'default',
  };

  users.push(newUser);
  saveUsers(users);

  const token = 'mock_jwt_token_' + newUser.id;
  localStorage.setItem('flappy_token', token);
  localStorage.setItem('flappy_active_user', JSON.stringify(newUser));

  return { token, user: newUser };
}

// 2. API Đăng Nhập
export async function mockLogin({ username, password }) {
  await delay();
  const users = getUsers();
  const user = users.find(
    (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
  );

  if (!user) {
    throw new Error('Sai tên đăng nhập hoặc mật khẩu!');
  }

  const token = 'mock_jwt_token_' + user.id;
  localStorage.setItem('flappy_token', token);
  localStorage.setItem('flappy_active_user', JSON.stringify(user));

  return { token, user };
}

// Lấy thông tin tài khoản hiện tại
export async function mockGetCurrentUser() {
  await delay(100);
  const token = localStorage.getItem('flappy_token');
  if (!token) return null;
  const raw = localStorage.getItem('flappy_active_user');
  return raw ? JSON.parse(raw) : null;
}

// Đăng xuất
export async function mockLogout() {
  await delay(100);
  localStorage.removeItem('flappy_token');
  localStorage.removeItem('flappy_active_user');
}

// 3. API Lưu Điểm sau ván chơi (Lưu điểm + thưởng xu)
export async function mockSaveScore(score) {
  await delay(150);
  const raw = localStorage.getItem('flappy_active_user');
  if (!raw) return { message: 'Khách không lưu điểm lên máy chủ', score };

  const currentUser = JSON.parse(raw);
  const users = getUsers();
  const userIdx = users.findIndex((u) => u.id === currentUser.id);

  if (userIdx === -1) return { message: 'Không tìm thấy người dùng', score };

  const user = users[userIdx];
  const isNewRecord = score > user.bestScore;
  if (isNewRecord) {
    user.bestScore = score;
  }
  // Thưởng xu: mỗi điểm đạt được đổi thành 1 xu
  user.coins += score;

  users[userIdx] = user;
  saveUsers(users);
  localStorage.setItem('flappy_active_user', JSON.stringify(user));

  return {
    success: true,
    bestScore: user.bestScore,
    newRecord: isNewRecord,
    coinsEarned: score,
    totalCoins: user.coins,
  };
}

// 4. API Bảng Xếp Hạng (Leaderboard)
export async function mockGetLeaderboard() {
  await delay(200);
  const users = getUsers();
  // Sắp xếp người chơi theo điểm cao nhất giảm dần
  const sorted = [...users]
    .sort((a, b) => b.bestScore - a.bestScore)
    .slice(0, 10)
    .map((u, index) => ({
      rank: index + 1,
      id: u.id,
      username: u.username,
      bestScore: u.bestScore,
      skin: u.activeSkin,
    }));
  return sorted;
}

// 5. API Cửa Hàng: Mua Skin
export async function mockBuySkin(skinId) {
  await delay(200);
  const raw = localStorage.getItem('flappy_active_user');
  if (!raw) throw new Error('Vui lòng đăng nhập để mua trang phục!');

  const currentUser = JSON.parse(raw);
  const skin = AVAILABLE_SKINS.find((s) => s.id === skinId);
  if (!skin) throw new Error('Trang phục không tồn tại!');

  if (currentUser.ownedSkins.includes(skinId)) {
    throw new Error('Bạn đã sở hữu trang phục này rồi!');
  }

  if (currentUser.coins < skin.price) {
    throw new Error(`Bạn không đủ xu! Cần thêm ${skin.price - currentUser.coins} xu nữa.`);
  }

  const users = getUsers();
  const user = users.find((u) => u.id === currentUser.id);
  user.coins -= skin.price;
  user.ownedSkins.push(skinId);
  user.activeSkin = skinId; // Mua xong tự động trang bị luôn

  saveUsers(users);
  localStorage.setItem('flappy_active_user', JSON.stringify(user));

  return { success: true, user };
}

// 5. API Cửa Hàng: Trang Bị Skin
export async function mockEquipSkin(skinId) {
  await delay(150);
  const raw = localStorage.getItem('flappy_active_user');
  if (!raw) throw new Error('Vui lòng đăng nhập!');

  const currentUser = JSON.parse(raw);
  if (!currentUser.ownedSkins.includes(skinId)) {
    throw new Error('Bạn chưa mở khóa trang phục này!');
  }

  const users = getUsers();
  const user = users.find((u) => u.id === currentUser.id);
  user.activeSkin = skinId;

  saveUsers(users);
  localStorage.setItem('flappy_active_user', JSON.stringify(user));

  return { success: true, activeSkin: skinId, user };
}
