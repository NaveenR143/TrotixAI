import sys
import os
os.chdir(r'C:\Naveen\Jobs\Source\TrotixAI')
sys.path.insert(0, r'C:\Naveen\Jobs\Source\TrotixAI')

from ai.Resume_Pipeline.document_analyzer import DocumentAnalyzer

pdf = r'C:\Naveen\Jobs\Source\TrotixAI\ai\Resume_Pipeline\sample_resume.pdf'
analyzer = DocumentAnalyzer(pdf)
result = analyzer.analyze()

# Display the analysis summary
print(f'=== Analysis Complete ===')
print(f'Tables found: {len(result.tables.tables)}')
print(f'Content sections: {len(result.content.sections)}')
print(f'Output file: {result.output_path}')
print()

# Show sections
print('Sections:')
for i, section in enumerate(result.content.sections[:10]):
    title = section.title or "NO TITLE"
    print(f'  {i+1}. {title:30s} ({len(section.content)} lines)')

# Check if output file was created
if result.output_path and os.path.exists(result.output_path):
    print(f'\nOutput file created successfully at: {result.output_path}')
else:
    print(f'\nWarning: Output file not created')
