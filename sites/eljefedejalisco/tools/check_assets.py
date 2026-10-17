"""Check local image/icon references for the source site or its dist upload."""
import argparse
from pathlib import Path
import re
from PIL import Image


def check_assets(root):
    references = set()
    for name in ('index.html', 'menu.html', 'content.js', 'css.css',
                 'site.webmanifest', 'site.config.json'):
        path = root / name
        if path.exists():
            references.update(re.findall(r'''assets/[^\s"'()<>\\]+''', path.read_text()))
    missing = sorted(reference for reference in references
                     if not (root / reference.split('?')[0]).is_file())
    if missing:
        raise ValueError('Missing local assets:\n' + '\n'.join(missing))
    images = list((root / 'assets').rglob('*'))
    checked = 0
    for path in images:
        if path.suffix.lower() in ('.jpg', '.jpeg', '.png', '.webp', '.ico'):
            with Image.open(path) as image:
                image.verify()
            checked += 1
    if not checked:
        raise ValueError('No image assets found')
    print(f'{root.name}: {len(references)} asset references resolved; {checked} images decoded.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('directory', nargs='?', type=Path,
                        default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    check_assets(args.directory.resolve())
