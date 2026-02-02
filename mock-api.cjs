// mock-api.cjs - 用于本地测试的模拟API服务器
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 模拟数据存储
let mockData = {
  profiles: {},
  skills: {},
  goals: {},
  achievements: {}
};

// 尝试从文件加载现有数据
const dataFile = path.join(__dirname, 'mock-data.json');
if (fs.existsSync(dataFile)) {
  try {
    mockData = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  } catch (e) {
    console.log('无法加载现有数据文件，使用默认数据');
  }
}

// 保存数据到文件
function saveData() {
  fs.writeFileSync(dataFile, JSON.stringify(mockData, null, 2));
}

// Profiles API
app.get('/api/profiles/:id', (req, res) => {
  const { id } = req.params;
  const profile = mockData.profiles[id] || {
    id,
    name: "我的成长之路",
    bio: "记录每一步成长",
    is_public: false,
    created_at: new Date().toISOString()
  };
  res.json(profile);
});

app.post('/api/profiles', (req, res) => {
  const { id, ...profileData } = req.body;
  mockData.profiles[id] = {
    ...mockData.profiles[id],
    ...profileData,
    id,
    updated_at: new Date().toISOString()
  };
  saveData();
  res.json(mockData.profiles[id]);
});

// Skills API
app.get('/api/skills', (req, res) => {
  const { user_id } = req.query;
  const skills = Object.values(mockData.skills).filter(skill => skill.user_id === user_id) || [];
  res.json(skills);
});

app.post('/api/skills', (req, res) => {
  const { user_id, name, category, level } = req.body;
  const id = Date.now().toString(); // 简单的ID生成
  
  mockData.skills[id] = {
    id,
    user_id,
    name,
    category,
    level: level || 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  saveData();
  res.json(mockData.skills[id]);
});

app.put('/api/skills/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  if (mockData.skills[id]) {
    mockData.skills[id] = {
      ...mockData.skills[id],
      ...updates,
      updated_at: new Date().toISOString()
    };
    saveData();
    res.json(mockData.skills[id]);
  } else {
    res.status(404).json({ error: '技能未找到' });
  }
});

app.delete('/api/skills/:id', (req, res) => {
  const { id } = req.params;
  if (mockData.skills[id]) {
    delete mockData.skills[id];
    saveData();
    res.json({ message: '删除成功' });
  } else {
    res.status(404).json({ error: '技能未找到' });
  }
});

// Goals API
app.get('/api/goals', (req, res) => {
  const { user_id } = req.query;
  const goals = Object.values(mockData.goals).filter(goal => goal.user_id === user_id) || [];
  res.json(goals);
});

app.post('/api/goals', (req, res) => {
  const { user_id, title, description, deadline, priority } = req.body;
  const id = Date.now().toString();
  
  mockData.goals[id] = {
    id,
    user_id,
    title,
    description: description || '',
    deadline,
    priority: priority || 'medium',
    completed: false,
    created_at: new Date().toISOString()
  };
  
  saveData();
  res.json(mockData.goals[id]);
});

app.put('/api/goals/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  if (mockData.goals[id]) {
    mockData.goals[id] = {
      ...mockData.goals[id],
      ...updates
    };
    saveData();
    res.json(mockData.goals[id]);
  } else {
    res.status(404).json({ error: '目标未找到' });
  }
});

app.delete('/api/goals/:id', (req, res) => {
  const { id } = req.params;
  if (mockData.goals[id]) {
    delete mockData.goals[id];
    saveData();
    res.json({ message: '删除成功' });
  } else {
    res.status(404).json({ error: '目标未找到' });
  }
});

// Achievements API
app.get('/api/achievements', (req, res) => {
  const { user_id } = req.query;
  const achievements = Object.values(mockData.achievements).filter(ach => ach.user_id === user_id) || [];
  res.json(achievements);
});

app.post('/api/achievements', (req, res) => {
  const { user_id, title, description, date, icon, category } = req.body;
  const id = Date.now().toString();
  
  mockData.achievements[id] = {
    id,
    user_id,
    title,
    description: description || '',
    date,
    icon: icon || '🏆',
    category
  };
  
  saveData();
  res.json(mockData.achievements[id]);
});

app.delete('/api/achievements/:id', (req, res) => {
  const { id } = req.params;
  if (mockData.achievements[id]) {
    delete mockData.achievements[id];
    saveData();
    res.json({ message: '删除成功' });
  } else {
    res.status(404).json({ error: '成就未找到' });
  }
});

// 根路径健康检查
app.get('/api/', (req, res) => {
  res.json({ message: 'Mock API 服务运行中' });
});

app.listen(PORT, () => {
  console.log(`.Mock API 服务器运行在端口 ${PORT}`);
  console.log(`.API端点: http://localhost:${PORT}/api/`);
});

module.exports = app;