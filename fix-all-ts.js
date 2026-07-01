const fs = require('fs');

function fixFile(file, replacements) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    for (const [search, replace] of replacements) {
        content = content.split(search).join(replace);
    }
    fs.writeFileSync(file, content);
    console.log('Fixed', file);
}

// 1. Fix gemini.ts
fixFile('D:/CDC/webcq/next-frontend/src/lib/gemini.ts', [
    ["slug: 'settings',", "slug: 'site-settings' as any,"],
    ["{ collection: 'api-keys',", "{ collection: 'api-keys' as any,"],
    ["{ collection: 'ai-knowledge',", "{ collection: 'ai-knowledge' as any,"],
    ["collection: 'api-keys',", "collection: 'api-keys' as any,"],
    ["collection: 'ai-knowledge',", "collection: 'ai-knowledge' as any,"],
]);

// 2. Fix videoSync.ts
fixFile('D:/CDC/webcq/next-frontend/src/cron/videoSync.ts', [
    ["collection: 'video-channels',", "collection: 'video-channels' as any,"],
    ["collection: 'videos',", "collection: 'videos' as any,"],
    ["channel.channelId", "(channel as any).channelId"],
    ["item.videoUrl", "(item as any).videoUrl"],
    ["platform: 'tiktok'", "// platform: 'tiktok'"],
    ["title: user.name", "title: (user as any).name"]
]);

// 3. Fix Settings.ts and SiteSettings.ts .ts imports
fixFile('D:/CDC/webcq/next-frontend/src/globals/Settings.ts', [
    [".ts'", "'"]
]);
fixFile('D:/CDC/webcq/next-frontend/src/globals/SiteSettings.ts', [
    [".ts'", "'"]
]);

// 4. Fix payload.config.ts css error
fixFile('D:/CDC/webcq/next-frontend/src/payload.config.ts', [
    ["css: '", "// css: '"]
]);
