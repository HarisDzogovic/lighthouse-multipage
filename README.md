# Lighthouse Multipage

## Run the script
- Mobile emulation
```powershell
EMULATION=Mobile node main.js
```

- Desktop "emulation"
```powershell
EMULATION=Desktop node main.js
```


## Configuration

**Mobile Emulation**
```json
"screenEmulation": {"disabled": false},
"formFactor": "mobile",
"throttlingMethod": "simulate",
```
- Details:
    - Network throttling: 150 ms TCP RTT, 1,638.4 Kbps throughput
    - CPU/Memory Power: 1547
    - CPU throttling: 4x slowdown 

**Desktop Emulation**
```json
"screenEmulation": {"disabled": true},
"formFactor": "desktop",
"throttlingMethod": "provided",
```
- Details:
    - Network throttling: Provided by environment
    - CPU/Memory Power: 1552
    - CPU throttling: Provided by environment
