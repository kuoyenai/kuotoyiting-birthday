"""Read back the two public sites and make only non-sending API probes.

Run from any working directory with Python 3. No email is sent by this script.
"""
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from hashlib import sha256
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import Request, urlopen
import json
import sys

ROOT = Path(__file__).resolve().parent.parent
SITES = ["https://kuotoyiting-birthday.vercel.app/", "https://kuoyenai.github.io/kuotoyiting-birthday/"]
FILES = ["index.html", "privacy.html", "privacy.css", "entry-notify.js", "cinema-intro.css", "fan-notice.css",
         "pwa.js", "sw.js", "inventory-current.json", "music-shell.html", "game.html", "gift.html",
         "movie.html", "novel-comic.html", "starlight.html", "explore-intro.html", "explore.html",
         "explore-test.html", "install.html", "materials.html"]
STAMP = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")


def request(url, method="GET", origin=None, data=None):
    headers = {"Accept-Encoding": "identity", "Cache-Control": "no-cache"}
    if origin:
        headers["Origin"] = origin
    if data is not None:
        headers["Content-Type"] = "application/json"
    try:
        response = urlopen(Request(url, data=data, headers=headers, method=method), timeout=25)
    except HTTPError as error:
        response = error
    with response:
        return response.status, response.headers, response.read()


def check_file(item):
    site, name = item
    expected = sha256((ROOT / name).read_bytes()).hexdigest()
    try:
        status, _, body = request(site + name + "?release-check=" + STAMP)
        actual = sha256(body).hexdigest()
        return {"site": site, "path": name, "status": status, "expectedSha256": expected,
                "actualSha256": actual, "matches": status == 200 and expected == actual}
    except Exception as error:
        return {"site": site, "path": name, "matches": False, "error": str(error)}


def check_api():
    endpoint = SITES[0] + "api/entry-notify?release-check=" + STAMP
    results = []
    for origin in ["https://kuotoyiting-birthday.vercel.app", "https://kuoyenai.github.io"]:
        # GET and OPTIONS return before the email-sending branch.
        for method, expected in [("GET", 405), ("OPTIONS", 204)]:
            try:
                status, headers, body = request(endpoint, method=method, origin=origin)
                matches = status == expected and headers.get("Access-Control-Allow-Origin") == origin
                if method == "GET":
                    matches = matches and json.loads(body).get("accepted") is False
                results.append({"origin": origin, "method": method, "status": status, "matches": matches})
            except Exception as error:
                results.append({"origin": origin, "method": method, "matches": False, "error": str(error)})
    # An invalid event must also be rejected before the email provider is called.
    try:
        status, _, body = request(endpoint, method="POST", origin=SITES[0].rstrip("/"), data=b'{"entry":"invalid-verification-event"}')
        results.append({"method": "POST invalid event only", "status": status,
                        "matches": status == 400 and json.loads(body).get("accepted") is False})
    except Exception as error:
        results.append({"method": "POST invalid event only", "matches": False, "error": str(error)})
    return results


def main():
    with ThreadPoolExecutor(max_workers=6) as pool:
        files = list(pool.map(check_file, [(site, name) for site in SITES for name in FILES]))
    # Do not issue even invalid POST probes until the deployed handler is present.
    api = check_api() if all(row["matches"] for row in files) else []
    passed = all(row["matches"] for row in files) and len(api) == 5 and all(row["matches"] for row in api)
    result = {"checkedAtUtc": STAMP, "passed": passed, "realEmailSent": False,
              "serviceAcceptanceVerified": False, "inboxDeliveryVerified": False, "files": files, "api": api}
    output = ROOT.parent / "material-review" / "entry-notify-deployment-results.json"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(("PASS" if passed else "PENDING") + f" production readback: {sum(row['matches'] for row in files)}/{len(files)} files, "
          + f"{sum(row['matches'] for row in api)}/{len(api)} non-sending API checks")
    for row in files + api:
        if not row["matches"]:
            print(json.dumps(row, ensure_ascii=False))
    print("No valid notification POST or real email was sent.")
    return 0 if passed else 1


if __name__ == "__main__":
    sys.exit(main())
