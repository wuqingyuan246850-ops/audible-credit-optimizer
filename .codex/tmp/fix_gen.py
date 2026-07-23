import sys
sys.path.insert(0, r'C:\Users\My Windows\Documents\亚马逊有声书\scripts')
import generate_site as gs

with open(gs.SCRIPT_DIR.parent / 'scripts' / 'generate_site.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find partner_tag = get_partner_tag() and add build_version after it
new_lines = []
bv_added = False
for line in lines:
    new_lines.append(line)
    if 'partner_tag = get_partner_tag()' in line and not bv_added:
        new_lines.append('    build_version = datetime.now().strftime("%Y%m%d%H%M")\n')
        bv_added = True

text = ''.join(new_lines)

# Add build_version to each template.render() call
import re
text = text.replace(
    'build_date=datetime.now().strftime("%B %d, %Y"),',
    'build_date=datetime.now().strftime("%B %d, %Y"),\n        build_version=build_version,'
)

with open(gs.SCRIPT_DIR.parent / 'scripts' / 'generate_site.py', 'w', encoding='utf-8') as f:
    f.write(text)
print('generate_site.py updated')
