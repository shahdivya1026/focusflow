from pathlib import Path
import tinycss2

path = Path(r'D:\Project\focusflow\app\globals.css')
text = path.read_text(encoding='utf-8')
try:
    parsed = tinycss2.parse_stylesheet(text, skip_comments=True, skip_whitespace=True)
    print('PARSE_OK', len(parsed))
except Exception as e:
    print(type(e).__name__, e)
    raise
