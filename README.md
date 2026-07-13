# 医学题库

这是一个可部署到 GitHub Pages 的静态医学题库网站，当前数据范围为“私有题库 / 2026年更新题库 / 西医医师 / 第五篇习题集”。

## 功能

- Astro + TypeScript 静态站点
- 题目列表、分页、筛选、单题详情
- Pagefind 中文全文搜索
- 全局答案显示/隐藏偏好
- 单题答案展开、选项临时选择、清除选择
- 深色模式
- 读片题图片懒加载与大图预览
- GitHub Actions 自动部署 GitHub Pages

## 本地运行

```bash
npm install
npm run dev
```

## 构建

```bash
npm run check
npm run build
```

`npm run build` 会先执行 Astro 构建，再生成 Pagefind 索引。

## 题目数据

网站读取：

```text
src/data/questions.json
```

题目格式：

```json
{
  "id": "106205-65565868",
  "subject": "西医医师",
  "chapter": "第五篇习题集",
  "type": "single-choice",
  "typeLabel": "A1型题",
  "question": "题干",
  "options": { "A": "选项A", "B": "选项B" },
  "answer": ["B"],
  "explanation": "解析",
  "image": "/images/questions/example.jpg",
  "imageAlt": "读片题图片",
  "tags": ["第五篇习题集", "A1型题"],
  "source": "https://pdyb.shanghaihengzan.com/..."
}
```

批量导入脚本：

```bash
npm run import:questions
```

更多说明见 [DATA_IMPORT.md](DATA_IMPORT.md)。

## 图片

题目图片放在：

```text
public/images/questions/
```

要求：

- 不要把图片转成 Base64 塞进 JSON
- 每张图片都要有 `imageAlt`
- 医学影像不要裁切，页面使用 `object-fit: contain`

当前 30 道读片题已全部接入图片，图片来自重置题型后逐题抓取页面 DOM 得到的真实路径：

```text
public/images/questions/106205-65569322-XD15.png
...
public/images/questions/106205-65569387-XD91.png
public/images/questions/106205-65569420-p022.jpg
```

原始远程图片位于 `https://pdyb.shanghaihengzan.com/Areas/Exam/Content/...`。项目保留本地副本，避免 GitHub Pages 部署后因源站路径变动、登录态、防盗链或限速导致图片失效。

## GitHub Pages

当前仓库名为 `doctor_test`，默认构建子路径为：

```text
/doctor_test/
```

GitHub Actions 已配置：

```text
.github/workflows/deploy.yml
```

仓库设置步骤：

1. 推送代码到 GitHub。
2. 打开仓库 Settings。
3. 进入 Pages。
4. Source 选择 GitHub Actions。
5. 等待 Deploy to GitHub Pages 工作流完成。

如果仓库名变化，设置环境变量：

```bash
BASE_PATH=/新仓库名/
SITE_URL=https://用户名.github.io
```

## 排错

- 图片 404：检查 JSON 的 `image` 是否以 `/images/questions/` 开头，文件是否在 `public/images/questions/`。
- 子路径资源 404：检查 `BASE_PATH` 是否等于 GitHub 仓库名。
- 搜索失效：确认 `npm run build` 已运行 Pagefind，且 `dist/pagefind/` 存在。
- 单题刷新失败：确认使用 GitHub Pages 生成的静态目录结构，不要手动移动 `dist` 内文件。

## 隐私和版权提醒

维护者不要上传患者姓名、病历号、未脱敏照片或无授权的付费题库内容。使用前请确认题目和医学图片具备授权。
