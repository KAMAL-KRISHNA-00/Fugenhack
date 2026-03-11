import re

with open('src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Add toggle button
c = c.replace(
    '<div className="flex items-center gap-4">',
    '''<div className="flex items-center gap-4">
                        <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-700 flex items-center justify-center bg-gray-100 dark:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300">
                            {theme === 'light' ? '☾' : '☀'}
                        </button>'''
)

# 2. Add theme state
c = c.replace(
    'const [activeTab, setActiveTab] = useState("overview")',
    '''const [activeTab, setActiveTab] = useState("overview")
    const [theme, setTheme] = useState<'light'|'dark'>('light')'''
)

# 3. Add dark class to root
c = c.replace(
    '<div className="h-screen bg-gray-50 font-sans flex flex-col md:flex-row overflow-hidden relative">',
    '<div className={`h-screen bg-gray-50 dark:bg-black font-sans flex flex-col md:flex-row overflow-hidden relative ${theme === \'light\' ? \'\' : \'dark\'}`}>'
)

# Add custom variant map
cmap = {
    'bg-white': 'bg-white dark:bg-black',
    'bg-gray-50': 'bg-gray-50 dark:bg-black',
    'bg-gray-50/50': 'bg-gray-50/50 dark:bg-black',
    'bg-gray-50/30': 'bg-gray-50/30 dark:bg-black',
    'bg-gray-100': 'bg-gray-100 dark:bg-gray-800',
    'bg-gray-200': 'bg-gray-200 dark:bg-gray-800',
    'bg-gray-900': 'bg-gray-900 dark:bg-white',
    'text-gray-900': 'text-gray-900 dark:text-gray-100',
    'text-white': 'text-white dark:text-black',
    'text-gray-500': 'text-gray-500 dark:text-gray-400',
    'text-gray-600': 'text-gray-600 dark:text-gray-300',
    'text-gray-700': 'text-gray-700 dark:text-gray-200',
    'text-gray-400': 'text-gray-400 dark:text-gray-500',
    'text-gray-300': 'text-gray-300 dark:text-gray-700',
    'border-gray-200': 'border-gray-200 dark:border-gray-800',
    'border-gray-300': 'border-gray-300 dark:border-gray-600',
    'border-gray-800': 'border-gray-800 dark:border-gray-200',
    'bg-gray-900/60': 'bg-gray-900/60 dark:bg-white/60',
    'border-white': 'border-white dark:border-black',
    'bg-black': 'bg-black dark:bg-white'
}

for k, v in cmap.items():
    # Only replace if not followed by dark:
    pat = r'(?<![-a-zA-Z0-9/])' + re.escape(k) + r'(?![-a-zA-Z0-9/])(?![ \t]*dark:)'
    c = re.sub(pat, v, c)

with open('src/app/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print("Success")
