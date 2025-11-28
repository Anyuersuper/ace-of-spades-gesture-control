# 🃏 Magic Ace - 手势控制3D扑克牌

<div align="center">
  <img width="800" alt="Magic Ace Demo" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
  
  <p><em>通过手势控制一张3D黑桃A扑克牌的魔法体验</em></p>
  
  [![React](https://img.shields.io/badge/React-19.2.0-61dafb?logo=react)](https://reactjs.org/)
  [![Three.js](https://img.shields.io/badge/Three.js-0.181.2-000000?logo=three.js)](https://threejs.org/)
  [![MediaPipe](https://img.shields.io/badge/MediaPipe-0.10.22-4285f4?logo=google)](https://mediapipe.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178c6?logo=typescript)](https://www.typescriptlang.org/)
</div>

## ✨ 功能特色

- 🖐️ **实时手势识别** - 使用MediaPipe进行精准的手部追踪
- 🎴 **3D扑克牌渲染** - 基于Three.js的逼真3D卡片效果
- 📱 **响应式设计** - 支持各种屏幕尺寸
- 🎯 **直观交互** - 自然的手势控制体验
- ⚡ **高性能** - 60fps流畅动画效果

## 🎮 手势控制指南

| 手势 | 效果 | 描述 |
|------|------|------|
| 🖐️ **张开手掌** | 放大卡片 | 五指张开，卡片会变大 |
| ✊ **握拳** | 缩小卡片 | 握紧拳头，卡片会变小 |
| ☝️ **食指向上** | 旋转卡片 | 单独伸出食指，卡片会在手指上方旋转 |
| 💨 **快速滑动** | 扔掉/召回 | 奇数次滑动扔掉卡片，偶数次滑动召回卡片 |

## 🚀 快速开始

### 前置要求

- **Node.js** (推荐 16.0 或更高版本)
- **现代浏览器** (支持WebRTC和WebGL)
- **摄像头** (用于手势识别)

### 安装和运行

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd ace-of-spades-gesture-control
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

4. **打开浏览器**
   - 访问 `http://localhost:3000`
   - 允许摄像头权限
   - 开始体验手势控制！

### 其他命令

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 🏗️ 项目架构

```
ace-of-spades-gesture-control/
├── components/
│   └── CardScene.tsx          # 3D卡片场景组件
├── services/
│   └── gestureService.ts      # 手势识别服务
├── App.tsx                    # 主应用组件
├── types.ts                   # TypeScript类型定义
├── index.tsx                  # 应用入口
├── index.html                 # HTML模板
├── vite.config.ts            # Vite配置
└── package.json              # 项目依赖
```

## 🔧 技术栈

### 前端框架
- **React 19.2.0** - 用户界面框架
- **TypeScript 5.8.2** - 类型安全的JavaScript

### 3D渲染
- **Three.js 0.181.2** - 3D图形库
- **@react-three/fiber 9.4.0** - React的Three.js渲染器

### 计算机视觉
- **MediaPipe 0.10.22** - Google的机器学习框架
- **Hand Landmarker** - 手部关键点检测模型

### 构建工具
- **Vite 6.2.0** - 快速的前端构建工具
- **Tailwind CSS** - 实用优先的CSS框架

## 🎯 核心功能实现

### 手势识别算法

```typescript
// 手势分类逻辑
const isPointing = indexIsExtended && foldedFingersCount >= 3;
const isOpen = foldedFingersCount < 3;
```

### 3D动画系统

- **位置跟踪**: 卡片实时跟随手部位置
- **缩放控制**: 根据手势状态调整卡片大小
- **旋转效果**: 指向手势触发旋转动画
- **飞行动画**: 滑动手势实现卡片飞出/召回

### 性能优化

- 使用`useRef`避免不必要的重渲染
- 手势状态防抖处理，减少误触发
- GPU加速的MediaPipe模型
- 60fps流畅动画循环

## 🎨 视觉设计

- **经典扑克牌设计** - 传统黑桃A样式
- **镜像摄像头** - 提供自然的镜像体验
- **实时视频背景** - 增强沉浸感
- **优雅的UI覆盖** - 半透明控制面板

## 🔍 故障排除

### 常见问题

1. **摄像头无法访问**
   - 确保浏览器有摄像头权限
   - 检查其他应用是否占用摄像头

2. **手势识别不准确**
   - 确保光线充足
   - 保持手部在摄像头视野内
   - 避免复杂背景干扰

3. **性能问题**
   - 关闭其他占用GPU的应用
   - 使用支持硬件加速的浏览器

### 浏览器兼容性

- ✅ Chrome 88+
- ✅ Firefox 85+
- ✅ Safari 14+
- ✅ Edge 88+

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

1. Fork项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开Pull Request

## 📄 许可证

本项目采用MIT许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [MediaPipe](https://mediapipe.dev/) - 强大的机器学习框架
- [Three.js](https://threejs.org/) - 优秀的3D图形库
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) - React的Three.js集成

---

<div align="center">
  <p>用 ❤️ 和 ☕ 制作</p>
  <p><em>享受你的魔法扑克牌体验！</em></p>
</div>
