import sys

path = 'D:/CDC/webcq/next-frontend/src/components/VaccinePackages/VaccinePackageUI.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# The exact wrapper is:
wrapper_start = '<div className={`${compact ? \'hidden lg:flex\' : \'flex\'} flex-1 flex-col lg:absolute lg:top-0 lg:bottom-0 lg:left-72 xl:left-80 lg:right-0 bg-white overflow-hidden`}>'

start_idx = content.find(wrapper_start)
if start_idx == -1:
    print("Cannot find wrapper start")
    sys.exit(1)

# Find the end of this div. We can just count braces/divs, or since it's the end of the file basically:
end_str = '</div>\n          </div>\n        </div>\n      )}\n    </div>'
end_idx = content.find(end_str)

inner_start = start_idx + len(wrapper_start)
inner_content = content[inner_start:end_idx]

render_func = """
  const renderDetailPanel = (isMobile: boolean = false) => {
    if (!selected) return null;
    return (
      <div className={`flex flex-col bg-white overflow-hidden ${isMobile ? 'lg:hidden mt-0 rounded-b-2xl border-x border-b border-[#00a4ff]/30 shadow-[0_10px_20px_-10px_rgba(0,164,255,0.15)] z-0 relative' : 'hidden lg:flex flex-1 lg:absolute lg:top-0 lg:bottom-0 lg:left-72 xl:left-80 lg:right-0'}`}>""" + inner_content + """
      </div>
    );
  };
"""

# Now we need to put render_func right before the return statement.
return_stmt = '  return (\n    <div className="w-full">'
return_idx = content.find(return_stmt)

new_content = content[:return_idx] + render_func + '\n' + content[return_idx:]

# Now replace the original detail panel with {renderDetailPanel(false)}
# We need to find where the original detail panel is in new_content.
detail_panel_marker = '{/* ── Detail Panel ── */}'
# The detail panel we want to replace is AFTER the render_func.
panel_start = new_content.find(detail_panel_marker, return_idx + len(render_func))
panel_end = new_content.find(end_str, panel_start)

new_content = new_content[:panel_start] + '{/* ── Detail Panel (Desktop) ── */}\n          {renderDetailPanel(false)}\n          ' + new_content[panel_end:]

# Now fix the map
map_original = """{packages.map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} />
              ))}"""
map_replacement = """{packages.map((pkg) => {
                const isActive = selected?.id === pkg.id;
                return (
                  <div key={pkg.id} className="flex flex-col relative z-10">
                    <PackageCard pkg={pkg} />
                    {isActive && renderDetailPanel(true)}
                  </div>
                );
              })}"""

new_content = new_content.replace(map_original, map_replacement)

# Fix border radius
border_orig = 'className={`w-full flex items-stretch pr-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative'
border_repl = 'className={`w-full flex items-stretch pr-3 border text-left transition-all duration-200 cursor-pointer relative ${isActive ? "rounded-t-2xl lg:rounded-2xl z-10" : "rounded-2xl z-10"}'
new_content = new_content.replace(border_orig, border_repl)

with open(path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Done")
