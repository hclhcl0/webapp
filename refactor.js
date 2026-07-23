const fs = require('fs');
const path = 'D:/CDC/webcq/next-frontend/src/components/VaccinePackages/VaccinePackageUI.tsx';
const lines = fs.readFileSync(path, 'utf8').split('\n');

let detailStartLine = -1;
let detailEndLine = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('{/* ── Detail Panel ── */}')) {
    detailStartLine = i;
  }
}

// Search backwards for the last '</div>' before the ')}' block that closes the main wrapper
let returnLine = -1;
for (let i = lines.length - 1; i >= 0; i--) {
  if (lines[i].includes('  return (')) {
    returnLine = i;
    break;
  }
}

for (let i = returnLine - 1; i > detailStartLine; i--) {
  if (lines[i].trim() === '</div>') {
    // Check if the lines before it are </div>
    if (lines[i-1].trim() === '</div>' && lines[i-2].trim() === '</div>') {
      detailEndLine = i - 2; // The end of the detail panel is the first of the three closing divs? No, the detail panel is just ONE div wrapper!
      break;
    }
  }
}

// Let's just find the closing tag of the Detail Panel manually.
// It starts with `<div className={\`\${compact ? 'hidden lg:flex' : 'flex'} flex-1 flex-col lg:absolute lg:top-0 lg:bottom-0 lg:left-72 xl:left-80 lg:right-0 bg-white overflow-hidden\`}>`
// It ends right before `</div>\n          </div>\n        </div>\n      )}\n    </div>`
// Wait, the easiest way is to use a block replacer since we know exactly what it is.

// Instead of automated script, I'll just write the EXACT replacement strings.
const content = fs.readFileSync(path, 'utf8');

const detailStart = content.indexOf('{/* ── Detail Panel ── */}');
const innerStart = content.indexOf('>', detailStart + 30) + 1; // start of inner content after the <div className=...>
const detailEnd = content.indexOf('</div>\n          </div>\n        </div>\n      )}\n    </div>');

const innerContent = content.substring(innerStart, detailEnd);

const renderFunc = `
  const renderDetailPanel = (isMobile: boolean = false) => {
    if (!selected) return null;
    return (
      <div className={\`flex flex-col bg-white overflow-hidden \${isMobile ? 'lg:hidden mt-0 rounded-b-2xl border-x border-b border-[#00a4ff]/30 shadow-[0_10px_20px_-10px_rgba(0,164,255,0.15)] z-0 relative' : 'hidden lg:flex flex-1 lg:absolute lg:top-0 lg:bottom-0 lg:left-72 xl:left-80 lg:right-0'}\`}>
${innerContent}
      </div>
    );
  };
`;

let newContent = content.substring(0, detailStart) + 
'{/* ── Detail Panel (Desktop) ── */}\n          {renderDetailPanel(false)}\n' + 
content.substring(detailEnd);

// Insert renderFunc before return
const returnIdx = newContent.lastIndexOf('  return (\n    <div className="w-full">');
newContent = newContent.substring(0, returnIdx) + renderFunc + '\n' + newContent.substring(returnIdx);

// Modify the map
const mapStr = '{packages.map((pkg) => (\n                <PackageCard key={pkg.id} pkg={pkg} />\n              ))}';
newContent = newContent.replace(mapStr, 
`{packages.map((pkg) => {
                const isActive = selected?.id === pkg.id;
                return (
                  <div key={pkg.id} className="flex flex-col relative z-10">
                    <PackageCard pkg={pkg} />
                    {isActive && renderDetailPanel(true)}
                  </div>
                );
              })}`);

// Modify the package card border radius
newContent = newContent.replace(
  'className={`w-full flex items-stretch pr-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative', 
  'className={`w-full flex items-stretch pr-3 border text-left transition-all duration-200 cursor-pointer relative ${isActive ? "rounded-t-2xl lg:rounded-2xl z-10" : "rounded-2xl z-10"}'
);

fs.writeFileSync(path, newContent, 'utf8');
console.log('Script completed');
