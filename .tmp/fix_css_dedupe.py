from pathlib import Path
from collections import OrderedDict

PATH = Path(r'D:\Project\focusflow\app\globals.css')


def split_selectors(raw):
    return [s.strip() for s in raw.split(',') if s.strip()]


def parse_declarations(body):
    pairs = OrderedDict()
    i = 0
    while i < len(body):
        while i < len(body) and body[i].isspace():
            i += 1
        if i >= len(body):
            break
        colon = body.find(':', i)
        if colon == -1:
            break
        prop = body[i:colon].strip()
        end = body.find(';', colon + 1)
        if end == -1:
            end = len(body)
        value = body[colon + 1:end].strip()
        if prop:
            pairs[prop] = value
        i = end + 1
    return pairs


def parse_blocks(src):
    items = []
    i = 0
    n = len(src)
    while i < n:
        if src.startswith('/*', i):
            end = src.find('*/', i + 2)
            if end == -1:
                break
            i = end + 2
            continue
        while i < n and src[i].isspace():
            i += 1
        if i >= n:
            break
        brace = src.find('{', i)
        if brace == -1:
            tail = src[i:].strip()
            if tail:
                items.append(('raw', tail))
            break
        selector = src[i:brace].strip()
        depth = 1
        j = brace + 1
        while j < n and depth > 0:
            if src[j] == '{':
                depth += 1
            elif src[j] == '}':
                depth -= 1
            j += 1
        body = src[brace + 1:j - 1]
        if selector.startswith('@'):
            items.append(('at', selector, parse_blocks(body)))
        else:
            items.append(('rule', selector, body))
        i = j
    return items


def render_scope(items):
    pending = OrderedDict()
    output = []

    def flush_pending():
        for sel, props in list(pending.items()):
            if not props:
                continue
            declarations = '\n'.join(f'  {prop}: {value};' for prop, value in props.items())
            output.append(f'{sel} {{\n{declarations}\n}}')
        pending.clear()

    for item in items:
        kind = item[0]
        if kind == 'raw':
            continue
        elif kind == 'at':
            flush_pending()
            output.append(f"{item[1]} {{\n{render_scope(item[2])}\n}}")
        elif kind == 'rule':
            selector = item[1].strip()
            for sel in split_selectors(selector):
                if sel not in pending:
                    pending[sel] = OrderedDict()
                for prop, value in parse_declarations(item[2]).items():
                    pending[sel][prop] = value

    flush_pending()
    return '\n\n'.join(output)


def main():
    content = PATH.read_text(encoding='utf-8')
    result = render_scope(parse_blocks(content))
    PATH.write_text(result + '\n', encoding='utf-8')
    print(f'Cleaned and saved: {PATH}')


if __name__ == '__main__':
    main()
