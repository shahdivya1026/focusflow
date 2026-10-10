from pathlib import Path

text = Path(r'D:\Project\focusflow\app\globals.css').read_text(encoding='utf-8')
positions = [14088, 18089, 20751, 32142, 38427]
for pos in positions:
    line = text.count('\n', 0, pos) + 1
    col = pos - text.rfind('\n', 0, pos)
    start = max(0, pos - 500)
    end = min(len(text), pos + 500)
    snippet = text[start:end]
    print('POS', pos, 'LINE', line, 'COL', col)
    print(snippet)
    print('\n---\n')
