from pathlib import Path

path = Path(r'D:\Project\focusflow\app\globals.css')
text = path.read_text(encoding='utf-8')
stack = []
errors = []
for i, ch in enumerate(text, 1):
    if ch == '{':
        stack.append(i)
    elif ch == '}':
        if not stack:
            errors.append(('extra_close', i))
        else:
            stack.pop()
print('extra_close', errors[:20])
print('unclosed_count', len(stack))
print('last_unclosed', stack[-20:])
print('brace_total_open', text.count('{'))
print('brace_total_close', text.count('}'))
