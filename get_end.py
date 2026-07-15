with open('src/components/HubyTutorial.tsx', 'r') as f:
    lines = f.readlines()
for i in range(160, 270):
    if 'completedTour' in lines[i] or 'handleSkip' in lines[i] or 'confirmSkip' in lines[i] or 'finish' in lines[i]:
        print(f"{i+1}: {lines[i]}", end='')
