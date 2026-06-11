with open('node_modules/@payloadcms/ui/dist/forms/Form/types.d.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for line in lines:
    if 'FormFieldsContextType' in line or 'FormState' in line:
        print(line.strip())
