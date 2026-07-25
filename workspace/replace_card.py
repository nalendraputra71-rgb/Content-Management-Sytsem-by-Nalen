import re

with open('src/LandingPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Enlarge the main mockup parent padding and child max-width
old_mockup_block = """        {/* Hero Mockup */}
        <motion.div 
          id="dashboard-visual"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 50 }}
          className="mt-20 w-full max-w-5xl mx-auto relative z-20 scroll-mt-24 px-4 sm:px-12 md:px-20 lg:px-28"
        >"""

new_mockup_block = """        {/* Hero Mockup */}
        <motion.div 
          id="dashboard-visual"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 50 }}
          className="mt-20 w-full max-w-5xl mx-auto relative z-20 scroll-mt-24 px-4 sm:px-8 md:px-12 lg:px-16"
        >"""

content = content.replace(old_mockup_block, new_mockup_block)

# Replace inner mockup card width
content = content.replace(
    'className="max-w-[780px] mx-auto rounded-2xl border border-black/10 bg-white shadow-2xl shadow-slate-200/50',
    'className="max-w-[840px] mx-auto rounded-2xl border border-black/10 bg-white shadow-2xl shadow-slate-200/50'
)

# 2. Replace the Multi-View Calendar card (Card 1)
old_card_pattern = re.compile(
    r'{/\* Card 1 \*/}\s*<div className="bg-white rounded-3xl p-8 shadow-\[0_8px_30px_rgb\(0,0,0,0\.04\)\] border border-black/5 hover:border-\[#1D4D7A\]/30 transition-colors md:col-span-3 overflow-hidden flex flex-col group">.*?</div>\s*</div>\s*</div>\s*</div>',
    re.DOTALL
)

# Let's locate the Card 1 content precisely by substring matching to be safer than regex if regex is tricky.
# The card content goes from 'Grid' -> Card 1 -> Toggle Switcher -> Visual -> end of Card 1 (before Card 2).
start_card_str = '          {/* Card 1 */}\n          <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]'
end_card_str = '          {/* Card 2 : AI Copilot */}'

start_idx = content.find(start_card_str)
end_idx = content.find(end_card_str)

if start_idx != -1 and end_idx != -1:
    print(f"Found Card 1 at indices {start_idx} to {end_idx}")
    new_card_block = """          {/* Card 1 */}
          <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/5 hover:border-[#1D4D7A]/30 transition-colors md:col-span-3 overflow-hidden flex flex-col lg:grid lg:grid-cols-12 lg:gap-12 lg:items-center group">
            <div className="flex flex-col lg:col-span-5 z-10 w-full">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1D4D7A] flex items-center justify-center mb-6">
                <Calendar size={24} />
              </div>
              <h3 className="text-2xl md:text-3xl font-extrabold text-[#0B2A4A] mb-4">Multi-View Calendar</h3>
              <p className="text-slate-600 mb-8 leading-relaxed">
                {lang === 'id' 
                  ? 'Atur strategi besarmu dengan Board, Timeline, Tabel, atau Calendar view. Geser dan jatuhkan idemu seolah sedang bermain Lego.' 
                  : 'Manage your grand strategy with Board, Timeline, Table, or Calendar view. Drag and drop your ideas as if you were playing Lego.'}
              </p>
              
              {/* Toggle Switcher */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-black/[0.03] rounded-full self-start border border-black/[0.02] mb-6 lg:mb-0">
                {(['month', 'board', 'timeline', 'table'] as const).map((view) => (
                  <button
                    key={view}
                    onClick={() => setSelectedCalendarView(view)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                      selectedCalendarView === view
                        ? 'bg-[#1D4D7A] text-white shadow-sm'
                        : 'text-slate-600 hover:text-black hover:bg-black/[0.03]'
                    }`}
                  >
                    {view.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Column */}
            <div className="lg:col-span-7 w-full flex items-center justify-center">
              <div className="w-full max-w-[680px] bg-[#f8f9fa] rounded-2xl border border-black/5 overflow-hidden shadow-lg shadow-slate-100">
                <div className="w-full aspect-[16/10] relative">
                  <ImageWithFallback 
                    src={`/calendar-${selectedCalendarView}.png`} 
                    alt={`Calendar ${selectedCalendarView} View`} 
                    className="w-full h-full object-cover select-none pointer-events-none"
                  />
                </div>
              </div>
            </div>
          </div>

          """
    content = content[:start_idx] + new_card_block + content[end_idx:]
    print("Replaced successfully!")
else:
    print("Warning: Could not find Card 1 start or end!")

with open('src/LandingPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
