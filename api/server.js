// server.js - 成长追踪器后端API服务
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// PostgreSQL 连接池
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'growth_tracker',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

// 测试数据库连接
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('数据库连接失败:', err.stack);
  } else {
    console.log('数据库连接成功');
  }
});

// 确保数据库表存在
async function initializeDatabase() {
  try {
    // 创建 profiles 表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL DEFAULT '我的成长之路',
        bio TEXT,
        avatar_url TEXT,
        email VARCHAR(255),
        location VARCHAR(255),
        website VARCHAR(255),
        is_public BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // 创建 skills 表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS skills (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        level INTEGER CHECK (level >= 0 AND level <= 100) DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // 创建 goals 表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS goals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        deadline DATE NOT NULL,
        priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
        completed BOOLEAN DEFAULT FALSE,
        completed_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // 创建 achievements 表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS achievements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        icon VARCHAR(10) DEFAULT '🏆',
        category VARCHAR(100) NOT NULL
      )
    `);

    // 创建更新时间触发器函数
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // 为 profiles 表添加更新时间触发器
    await pool.query(`
      DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
      CREATE TRIGGER update_profiles_updated_at 
          BEFORE UPDATE ON profiles 
          FOR EACH ROW 
          EXECUTE FUNCTION update_updated_at_column();
    `);

    // 为 skills 表添加更新时间触发器
    await pool.query(`
      DROP TRIGGER IF EXISTS update_skills_updated_at ON skills;
      CREATE TRIGGER update_skills_updated_at 
          BEFORE UPDATE ON skills 
          FOR EACH ROW 
          EXECUTE FUNCTION update_updated_at_column();
    `);

    console.log('数据库表初始化完成');
  } catch (err) {
    console.error('数据库初始化错误:', err.stack);
  }
}

// 初始化数据库
initializeDatabase();

// API 路由

// Profiles API
app.get('/profiles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM profiles WHERE id = $1',
      [id]
    );
    res.json(result.rows[0] || null);
  } catch (error) {
    console.error('获取用户资料错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

app.post('/profiles', async (req, res) => {
  try {
    const { id, name, bio, avatar_url, email, location, website, is_public } = req.body;
    const result = await pool.query(
      `INSERT INTO profiles (id, name, bio, avatar_url, email, location, website, is_public)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         bio = EXCLUDED.bio,
         avatar_url = EXCLUDED.avatar_url,
         email = EXCLUDED.email,
         location = EXCLUDED.location,
         website = EXCLUDED.website,
         is_public = EXCLUDED.is_public,
         updated_at = NOW()
       RETURNING *`,
      [id, name, bio, avatar_url, email, location, website, is_public]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('保存用户资料错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// Skills API
app.get('/skills', async (req, res) => {
  try {
    const { user_id } = req.query;
    const result = await pool.query(
      'SELECT * FROM skills WHERE user_id = $1 ORDER BY created_at DESC',
      [user_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('获取技能错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

app.post('/skills', async (req, res) => {
  try {
    const { user_id, name, category, level } = req.body;
    const result = await pool.query(
      `INSERT INTO skills (user_id, name, category, level)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [user_id, name, category, level]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('保存技能错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

app.put('/skills/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, level } = req.body;
    const result = await pool.query(
      `UPDATE skills SET name = $1, category = $2, level = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [name, category, level, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('更新技能错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

app.delete('/skills/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM skills WHERE id = $1', [id]);
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除技能错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// Goals API
app.get('/goals', async (req, res) => {
  try {
    const { user_id } = req.query;
    const result = await pool.query(
      'SELECT * FROM goals WHERE user_id = $1 ORDER BY created_at DESC',
      [user_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('获取目标错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

app.post('/goals', async (req, res) => {
  try {
    const { user_id, title, description, deadline, priority } = req.body;
    const result = await pool.query(
      `INSERT INTO goals (user_id, title, description, deadline, priority)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [user_id, title, description, deadline, priority]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('保存目标错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

app.put('/goals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    
    if (fields.length === 0) {
      return res.status(400).json({ error: '没有提供更新字段' });
    }
    
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    const query = `UPDATE goals SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`;
    
    values.push(id);
    
    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('更新目标错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

app.delete('/goals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM goals WHERE id = $1', [id]);
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除目标错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// Achievements API
app.get('/achievements', async (req, res) => {
  try {
    const { user_id } = req.query;
    const result = await pool.query(
      'SELECT * FROM achievements WHERE user_id = $1 ORDER BY date DESC',
      [user_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('获取成就错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

app.post('/achievements', async (req, res) => {
  try {
    const { user_id, title, description, date, icon, category } = req.body;
    const result = await pool.query(
      `INSERT INTO achievements (user_id, title, description, date, icon, category)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [user_id, title, description, date, icon, category]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('保存成就错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

app.delete('/achievements/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM achievements WHERE id = $1', [id]);
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除成就错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 根路径健康检查
app.get('/', (req, res) => {
  res.json({ message: '成长追踪器 API 服务运行中' });
});

app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});