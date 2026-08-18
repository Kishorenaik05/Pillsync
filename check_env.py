import urllib.request, json, ssl

ctx = ssl.create_default_context()
headers = {'Authorization': 'Bearer rnd_Dxbn7wLVadPaCNb58FwfFfP6bGHE', 'Accept': 'application/json'}

req = urllib.request.Request(
    'https://api.render.com/v1/services/srv-da0u89h5efls73agps80/deploys?limit=4',
    headers=headers
)
with urllib.request.urlopen(req, context=ctx) as r:
    deploys = json.loads(r.read())

for d in deploys:
    dep = d['deploy']
    commit = dep.get('commit', {})
    print('ID:', dep['id'])
    print('Status:', dep['status'])
    print('Commit:', commit.get('message', '')[:80])
    print('Created:', dep['createdAt'])
    started = dep.get('startedAt', '')
    finished = dep.get('finishedAt', '')
    print('Started:', started, '| Finished:', finished)
    print()
