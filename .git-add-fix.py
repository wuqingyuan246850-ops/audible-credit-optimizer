
import subprocess, os
os.chdir(r'C:\Users\My Windows\Documents\亚马逊有声书')
# Try to remove the index.lock first
try:
    os.remove('.git/index.lock')
    print('Removed index.lock')
except:
    print('No index.lock to remove')
# Try to create index
subprocess.run(['git', 'add', '-A'], shell=True)
