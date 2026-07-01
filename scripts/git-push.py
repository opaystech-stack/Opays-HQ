#!/usr/bin/env python3
"""Push Opays-HQ to GitHub using age-encrypted token"""
import sys, os, subprocess
sys.path.insert(0, '/home/hermeswebui/.local/lib/python3.12/site-packages')
from age.keyloader import AgePrivateKey
from age.file import Decryptor
import io

home = '/home/hermeswebui'
key_file = os.path.join(home, '.hermes', 'key.txt')
encrypted_file = os.path.join(home, '.hermes', 'secrets', 'trading.env.age')

with open(key_file) as f:
    key_str = [l.strip() for l in f if not l.startswith('#') and l.strip()][0]
private_key = AgePrivateKey.from_private_string(key_str)

with open(encrypted_file, 'rb') as f:
    encrypted_data = f.read()

inp = io.BytesIO(encrypted_data)
dec = Decryptor([private_key], inp)
decrypted = dec.readall()
dec.close()

# Extract GITHUB_TOKEN
token = None
for line in decrypted.decode('utf-8').split('\n'):
    line = line.strip()
    if line.startswith('GITHUB_TOKEN='):
        token = line.split('=', 1)[1]
        break

if not token:
    print("ERROR: GITHUB_TOKEN not found in secrets")
    sys.exit(1)

os.chdir('/home/hermeswebui/projects/opays/opays-hq')

# Set remote with token
subprocess.run([
    'git', 'remote', 'set-url', 'origin',
    f'https://x-access-token:{token}@github.com/Lamsasiri/Opays-HQ.git'
], capture_output=True, text=True)

# Force push
result = subprocess.run(['git', 'push', '-u', 'origin', 'main', '--force'], capture_output=True, text=True, timeout=30)
print(result.stdout[-500:] if len(result.stdout) > 500 else result.stdout)
print(result.stderr[-500:] if len(result.stderr) > 500 else result.stderr)
print('exit:', result.returncode)
