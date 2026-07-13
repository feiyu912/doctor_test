# Data import notes

## Source

- Source JSON: `C:\Users\薛开成\Documents\Codex\2026-07-10\https-pdyb-shanghaihengzan-com-exam-mytraining-2\work\fifth_set\questions.json`
- Training ID: `106205`
- Imported set: `第五篇习题集`
- Question count: `1328`
- Type distribution in the source:
  - `typeId=1` A1 型题: 971
  - `typeId=2` X 型题: 177
  - `typeId=4` 读片题: 30
  - `typeId=10` A3 型题: 150

Run the importer from the project root:

```powershell
npm run import:questions
```

The script also accepts an explicit source file:

```powershell
node scripts/import-questions.mjs C:\path\to\questions.json
```

## Image findings

The source `questions.json` does not contain image fields for the 30 `typeId=4` read-image questions.

The 30 `typeId=4` read-image questions were re-crawled after resetting the training type. Each page was saved under:

```text
C:\Users\薛开成\Documents\Codex\2026-07-10\https-pdyb-shanghaihengzan-com-exam-mytraining-2\work\fifth_read_images\
```

The full mapping is stored in:

```text
work\fifth_read_images\read_image_map.json
```

The current site maps the 30 read-image questions by source order to these remote paths:

```text
01 /Areas/Exam/Content/20260319040903530/XD15.png
02 /Areas/Exam/Content/20260319040621731/p056.jpg
03 /Areas/Exam/Content/20260319040621731/p020.jpg
04 /Areas/Exam/Content/20260319040621731/p006.jpg
05 /Areas/Exam/Content/20260319040903530/XD8.png
06 /Areas/Exam/Content/20260319040903530/XD2.png
07 /Areas/Exam/Content/20260319040621731/p026.jpg
08 /Areas/Exam/Content/20260319040621731/p001.jpg
09 /Areas/Exam/Content/20260319040903530/XD89.png
10 /Areas/Exam/Content/20260319040903530/XD1.png
11 /Areas/Exam/Content/20260319040621731/p060.jpg
12 /Areas/Exam/Content/20260319040903530/XD3.png
13 /Areas/Exam/Content/20260319040621731/p019.jpg
14 /Areas/Exam/Content/20260319040621731/p007.jpg
15 /Areas/Exam/Content/20260319040621731/p025.jpg
16 /Areas/Exam/Content/20260319040621731/p016.jpg
17 /Areas/Exam/Content/20260319040621731/p008.jpg
18 /Areas/Exam/Content/20260319040903530/XD91.png
19 /Areas/Exam/Content/20260319040621731/p014.jpg
20 /Areas/Exam/Content/20260319040903530/XD5.png
21 /Areas/Exam/Content/20260319040903530/XD12.png
22 /Areas/Exam/Content/20260319040903530/XD6.png
23 /Areas/Exam/Content/20260319040903530/XD82.png
24 /Areas/Exam/Content/20260319040903530/XD84.png
25 /Areas/Exam/Content/20260319040903530/XD88.png
26 /Areas/Exam/Content/20260319040621731/p005.jpg
27 /Areas/Exam/Content/20260319040903530/XD7.png
28 /Areas/Exam/Content/20260319040621731/p055.jpg
29 /Areas/Exam/Content/20260319040621731/p009.jpg
30 /Areas/Exam/Content/20260319040621731/p022.jpg
```

All 30 images are downloaded into `public/images/questions/` and referenced from `src/data/questions.json`.

## How to fill the remaining read-image images

1. Re-crawl each `typeId=4` question page while preserving the question HTML after each answer submission.
2. Extract every `/Areas/Exam/Content/...` image URL and the corresponding `doAnswer(<original question id>, this, ...)` ID from the same page.
3. Put the downloaded files under `public/images/questions/`.
4. Re-run `npm run import:questions`; the importer automatically scans `last_106205_*.html` files in the source work directory and attaches any discoverable images to matching original question IDs.

Remote image URLs can be used directly in JSON, but this project stores local copies for GitHub Pages stability. Local files avoid broken images if the source site changes paths, blocks hotlinking, requires a session cookie, or deletes the asset later.

## Import shape

Each imported record uses:

- `id`: `<trainingId>-<originalQuestionId>`
- `originalId`: source question ID
- `subject`: `西医医师` for training `106205`
- `chapter`: source chapter name
- `type`: normalized site type (`single-choice`, `multiple-choice`, or `case`)
- `question`, `options`, `answer`, `explanation`
- `image`, `imageAlt`
- `tags`
- `source`: source training URL
