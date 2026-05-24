# 心伴 - 情绪陪伴助手 - 技术说明文档

## 1. 项目概述

### 1.1 项目名称
心伴（XinBan）- 情绪陪伴助手

### 1.2 项目简介
「心伴」是一款温暖治愈的大学生情绪陪伴助手 Web 应用，旨在帮助用户记录心情、管理任务、保持专注，提供全方位的情绪陪伴服务。

### 1.3 技术栈

| 分类 | 技术 | 版本 | 选择理由 |
|------|------|------|----------|
| 前端框架 | Next.js | 14.2.5 | 支持 App Router，服务端渲染，性能优秀 |
| 语言 | TypeScript | 5.x | 类型安全，代码维护性好 |
| 样式 | Tailwind CSS | 3.4.x | 原子化 CSS，开发效率高 |
| UI 组件 | shadcn/ui | 4.8.x | 高质量组件库，可定制性强 |
| 图表 | Recharts | 3.8.x | React 生态最成熟的图表库 |
| 图标 | Lucide React | 1.16.x | 精美的开源图标库 |
| 日期处理 | date-fns | 4.2.x | 现代化日期处理库 |

---

## 2. 系统架构

### 2.1 架构设计
采用 Next.js 14 App Router 架构，实现服务端渲染与客户端交互的完美结合。

```
┌─────────────────────────────────────────────────────────────┐
│                     客户端 (Browser)                       │
├─────────────────────────────────────────────────────────────┤
│  Pages: calendar | chat | journal | profile | rant | tasks │
├─────────────────────────────────────────────────────────────┤
│  Components: Timer | ChatWindow | MoodCalendar | ...       │
├─────────────────────────────────────────────────────────────┤
│  State: localStorage (本地数据持久化)                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     服务端 (Next.js)                       │
├─────────────────────────────────────────────────────────────┤
│  App Router: app/* (页面路由)                              │
├─────────────────────────────────────────────────────────────┤
│  API: app/api/* (后端接口，可选扩展)                        │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 目录结构

```
src/
├── app/                    # 应用页面（App Router）
│   ├── calendar/           # 情绪日历页面
│   ├── chat/               # AI 树洞聊天页面
│   ├── journal/            # 点滴日志页面
│   ├── profile/            # 个人中心页面
│   ├── rant/               # 吐槽箱页面
│   ├── tasks/              # 任务规划页面
│   ├── layout.tsx          # 全局布局
│   ├── page.tsx            # 首页（专注计时器）
│   └── globals.css         # 全局样式
├── components/             # 可复用组件
│   ├── chat/               # 聊天相关组件
│   ├── mood/               # 情绪相关组件
│   ├── radio/              # 白噪音播放器组件
│   ├── timer/              # 计时器组件
│   └── ui/                 # 通用 UI 组件
├── lib/                    # 工具函数
│   └── utils.ts            # 工具方法集合
└── types/                  # TypeScript 类型定义
    └── index.ts            # 全局类型定义
```

---

## 3. 核心功能模块

### 3.1 专注计时器模块

**功能描述**：番茄钟专注计时，支持自定义时长，记录专注状态和心情

**核心流程**：
1. 用户选择专注时长（15/25/45/60分钟）
2. 选择当前心情标签
3. 开始计时，显示倒计时进度环
4. 计时结束，记录专注记录到 localStorage

**关键文件**：
- `src/components/timer/Timer.tsx` - 计时器核心组件
- `src/components/timer/TimerStats.tsx` - 统计展示组件

### 3.2 AI 树洞模块

**功能描述**：情绪倾诉聊天界面，智能共情回复

**核心流程**：
1. 用户输入消息或选择快捷情绪标签
2. 系统分析情绪关键词
3. 返回对应风格的共情回复
4. 聊天记录保存到 localStorage

**关键文件**：
- `src/components/chat/ChatWindow.tsx` - 聊天窗口组件
- `src/components/chat/MessageBubble.tsx` - 消息气泡组件

### 3.3 任务规划模块

**功能描述**：主线任务（长期目标）和支线任务（单日目标）管理

**核心流程**：
1. 创建主线任务（长期目标）
2. 创建支线任务（关联主线）
3. 设置截止日期和提醒时间
4. 完成任务时记录心情

**关键文件**：
- `src/app/tasks/page.tsx` - 任务规划页面

### 3.4 情绪日历模块

**功能描述**：可视化情绪趋势，月历视图展示每日心情

**核心流程**：
1. 读取历史情绪记录
2. 月历视图渲染（不同颜色表示不同心情）
3. 点击日期查看详情
4. 显示情绪趋势图表

**关键文件**：
- `src/app/calendar/page.tsx` - 情绪日历页面
- `src/components/mood/MoodCalendar.tsx` - 日历组件

### 3.5 治愈电台模块

**功能描述**：白噪音播放器，支持多种环境音效

**核心流程**：
1. 选择白噪音类型（雨声/森林/咖啡馆等）
2. 调节音量
3. 播放/暂停控制
4. 与番茄钟联动（可选）

**关键文件**：
- `src/components/radio/WhiteNoisePlayer.tsx` - 播放器组件

---

## 4. 数据存储设计

### 4.1 localStorage 数据结构

**情绪记录**（mood_records）：
```typescript
interface MoodRecord {
  date: string;        // 日期 "YYYY-MM-DD"
  score: number;       // 心情分数 1-10
  tags: string[];      // 情绪标签
  note: string;        // 心情笔记
}
```

**专注记录**（focus_records）：
```typescript
interface FocusRecord {
  id: string;          // 唯一标识
  date: string;        // 日期
  duration: number;    // 专注时长（分钟）
  moodTag: string;     // 心情标签
  rating: number;      // 质量评分 1-5
  goal: string;        // 今日目标
}
```

**任务记录**（tasks）：
```typescript
interface MainTask {
  id: string;
  title: string;
  deadline: string;
  progress: number;
  color: string;
  createdAt: string;
}

interface SubTask {
  id: string;
  title: string;
  deadline: string;
  completed: boolean;
  parentId?: string;
  remindTime?: string;
}
```

### 4.2 数据持久化策略
- 使用 localStorage 进行本地数据存储
- 所有数据采用 JSON 序列化存储
- 支持数据导入导出（可扩展）

---

## 5. UI/UX 设计

### 5.1 设计风格
- **主色调**：温暖治愈的粉橙色系（#FFE4E1 - #FFB6C1）
- **辅助色**：柔和的蓝绿色（#E0FFEE - #B8E0D2）
- **风格**：玻璃拟态（Glassmorphism）效果

### 5.2 响应式设计
- 移动端优先（Mobile-first）
- 支持桌面端自适应布局
- 底部导航栏（移动端）

### 5.3 交互动画
- 页面切换淡入效果
- 按钮悬停动画
- 进度环旋转动画
- 庆祝彩屑效果

---

## 6. 安全与隐私

### 6.1 数据安全
- 所有数据存储在用户本地（localStorage）
- 不向服务器传输用户隐私数据
- 支持浏览器加密存储

### 6.2 隐私保护
- 不收集用户个人信息
- 不进行数据追踪
- 紧急求助功能提供官方热线

---

## 7. 部署与运行

### 7.1 本地开发
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 7.2 部署方式
- 支持 Vercel 一键部署
- 支持 Cloudflare Pages 部署
- 支持 Netlify 部署

---

## 8. 技术亮点

1. **Next.js 14 App Router**：采用最新的应用路由架构，性能优秀
2. **TypeScript 类型安全**：全项目使用 TypeScript，代码健壮性强
3. **组件化架构**：高度模块化的组件设计，易于维护和扩展
4. **本地数据持久化**：无需后端服务，用户数据安全存储在本地
5. **响应式设计**：完美适配移动端和桌面端
6. **温暖治愈的 UI**：精心设计的视觉风格，提供舒适的使用体验

---

**文档版本**：v1.0  
**创建日期**：2026年5月  
**开发者**：CapQ18