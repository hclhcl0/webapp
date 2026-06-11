with open('node_modules/@payloadcms/ui/dist/exports/client/index.d.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for line in lines:
    if 'useForm' in line or 'useField' in line:
        print(line.strip())
