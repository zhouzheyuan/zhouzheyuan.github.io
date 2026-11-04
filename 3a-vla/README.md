# 3A-VLA project website

Official project website: https://zhouzheyuan.github.io/3a-vla/

- Paper: https://arxiv.org/abs/2602.02212
- Code: https://github.com/zhouzheyuan/3a-vla
- Model: https://huggingface.co/AceAction/3A-VLA_Qwen3.5-4B_GameForPeace
- Dataset: https://huggingface.co/datasets/AceAction/AceAction-5M_GameForPeace

## Editing and preview

This is a static website. Edit `index.html`, CSS, JavaScript and the files in `assets/` directly. Video assets retain their original delivery quality and stream through the bundled HLS player.

Run `python3 -m http.server 8039` from this directory to preview the site.

## GitHub Pages

Publish from the `main` branch and the repository root (`/`). `.nojekyll` keeps the site and media files as plain static assets. No build step is required.
