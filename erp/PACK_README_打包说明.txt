Ocean Noir VMS — 便携包说明（ON-VMS-2.0-PORTABLE）
====================================================

【本包内有什么】
- 运行 ERP 所需的 Python 源码：Home.py、core/、logic/、pages/
- 前端资源：assets/images、assets/styles，以及小体积的 assets 子目录（organized、reclustered 等）
- 配置：.streamlit/config.toml、requirements.txt、VERSION、.python-version、.gitignore
- 说明文档：README.md、CHANGELOG.md
- 营业数据（若原机存在）：on_vms.db、uploads/（技师媒体等）
- Git 历史（若存在）：.git/ — 便于在 Mac 上继续 git push 到 GitHub

【本包刻意未包含】（减小体积、避免跨平台冲突）
- .venv / .venv311：请在 Mac 上新建虚拟环境后 pip install -r requirements.txt
- 各目录下的 __pycache__
- 以下大型图片目录（与日常开单/展示屏无关，如需请从原电脑整个文件夹拷回 assets/）：
    assets/merged_flat
    assets/merged_portraits_only
    assets/reclustered_50

【在 Mac 上运行】
1. 把整个 ON-VMS-2.0-PORTABLE 文件夹拷到苹果电脑任意位置
2. 终端进入该文件夹
3. python3 -m venv .venv
4. source .venv/bin/activate
5. pip install --upgrade pip
6. pip install -r requirements.txt
7. streamlit run Home.py
8. 浏览器访问终端里提示的地址（本机或局域网 IP:8501，视防火墙而定）

【上传到 GitHub】
- 勿将含真实客户数据的 on_vms.db、uploads/ 推送到「公开」仓库；当前 .gitignore 已忽略它们。
- 若保留 .git，可直接：git remote add origin <你的仓库地址> 后 push。
- 若没有 .git，可在该目录 git init 后按 GitHub 新建仓库说明操作。

生成时间：请在本机查看文件夹属性。有问题可在 Agent 模式下让 Cursor 协助调整 .gitignore 或部署配置。
