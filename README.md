# CampusTech

面向大学生与初学者的技术学习与交流社区平台。

## 技术栈

- **前端**：React 18 + TypeScript + Vite + React Router + TanStack Query + Tailwind CSS
- **后端**：NestJS + Prisma + PostgreSQL + JWT

## 目录结构

```
CampusTech/
├── backend/     # NestJS API（端口 3000）
├── frontend/    # React SPA（端口 5173）
└── CampusTech-设计说明.md
```

## 环境要求

- Node.js 18+
- PostgreSQL 15+

## 快速开始

### 1. 数据库

确保 PostgreSQL 已运行，配置 `backend/.env`（从 `.env.example` 复制），然后执行：

```powershell
# 方式一：使用脚本（从 backend/.env 读取 DATABASE_URL）
scripts\setup-db.bat

# 方式二：手动
# 1. 在 psql 中 CREATE DATABASE campustech;
# 2. cd backend && npx prisma migrate dev --name init
```

### 2. 后端

```bash
cd backend
cp .env.example .env   # 编辑 DATABASE_URL 与 JWT_SECRET
npm install
npx prisma migrate dev
npm run start:dev
```

API 地址：http://localhost:3000/api

### 3. 前端

```bash
cd frontend
npm install
npm run dev
```

前端地址：http://localhost:5173

## 开发里程碑

| 周次 | 模块 |
|------|------|
| 第 1 周 | 用户系统（注册、登录、JWT） |
| 第 2 周 | 论坛帖子 CRUD |
| 第 3 周 | 评论与回复 |
| 第 4 周 | RSS 技术资讯 |

详细设计见 [CampusTech-设计说明.md](./CampusTech-设计说明.md)。
