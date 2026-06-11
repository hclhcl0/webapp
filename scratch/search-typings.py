import os
import re

typings_path = 'node_modules/@payloadcms/ui'
results = []

for root, dirs, files in os.walk(typings_path):
    for file in files:
        if file.endswith('.d.ts'):
            filepath = os.path.join(root, file)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                    if 'useForm' in content:
                        results.append(filepath)
            except Exception as e:
                pass

print("Files containing useForm:")
for r in results:
    print(r)
