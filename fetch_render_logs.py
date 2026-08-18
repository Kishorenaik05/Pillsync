import urllib.request, json, ssl

ctx = ssl.create_default_context()
headers = {
    'Authorization': 'Bearer rnd_Dxbn7wLVadPaCNb58FwfFfP6bGHE',
    'Accept': 'application/json'
}

req = urllib.request.Request(
    'https://api.render.com/v1/services/srv-da0u89h5efls73agps80/env-vars',
    headers=headers
)
with urllib.request.urlopen(req, context=ctx) as r:
    data = json.loads(r.read())

with open('render_envvars.txt', 'w') as f:
    for item in data:
        ev = item.get('envVar', item)
        key = ev.get('key', '')
        val = ev.get('value', '')
        if any(s in key.upper() for s in ['KEY', 'PASSWORD', 'SECRET']):
            masked = val[:4] + '****' if val else '(empty)'
        else:
            masked = val
        f.write(key + ' = ' + masked + '\n')

print(open('render_envvars.txt').read())
