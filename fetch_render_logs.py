import urllib.request, json, ssl

ctx = ssl.create_default_context()
headers = {
    'Authorization': 'Bearer rnd_Dxbn7wLVadPaCNb58FwfFfP6bGHE',
    'Accept': 'application/json'
}

# Get full service details to see branch / build command
req = urllib.request.Request('https://api.render.com/v1/services/srv-da0u89h5efls73agps80', headers=headers)
with urllib.request.urlopen(req, context=ctx) as r:
    data = json.loads(r.read())
    svc = data.get('service', data)  # handle both wrapper and flat
    print(json.dumps(data, indent=2))
