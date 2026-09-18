"""Copy only public website files into dist; no dependencies required."""
from pathlib import Path
import shutil
root = Path(__file__).resolve().parents[1]
out = root / 'dist'
out.mkdir(exist_ok=True)
for name in ('index.html', 'invite.html'):
    shutil.copy2(root / name, out / name)
for name in ('assets', 'css', 'js'):
    shutil.copytree(root / name, out / name, dirs_exist_ok=True)
print('Static website ready in dist/')
