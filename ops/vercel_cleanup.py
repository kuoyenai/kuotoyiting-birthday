"""Bounded, owner-authorized cleanup. Default is offline review, never deletion.

An existing team-scoped VERCEL_TOKEN must be configured through secure settings.
No credentials are printed, read from files, or passed on command lines.
"""
import argparse
import json
import os
from pathlib import Path
from urllib.error import HTTPError
from urllib.parse import urlencode
from urllib.request import Request, HTTPRedirectHandler, build_opener

ROOT = Path(__file__).resolve().parent
PLAN = ROOT / 'vercel-cleanup-20261029.json'
TEAM = 'team_iYxYD3C4msZ7JMgJVVNwgggx'
PROJECT = 'prj_oXWIO27qp2CVi61ZXmdyxm2b4fKZ'
PROTECTED = {'dpl_CaDU925FHYTe6piurvbvdVjZ5zLk',
             'dpl_HEvPDWWME9snXVkL76ejXuPb21Fq',
             'dpl_E3ZkBrfTERCVA6maLusDg8xhdTPN'}


class SafetyError(RuntimeError):
    pass


def require(condition, message):
    if not condition:
        raise SafetyError(message)


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def validate(plan):
    require(plan['teamId'] == TEAM and plan['projectId'] == PROJECT, 'Wrong scope')
    require({x['id'] for x in plan['kept']} == PROTECTED, 'Protected set changed')
    ids = [x['id'] for x in plan['candidates']]
    require(len(ids) == len(set(ids)) == 21, 'Unexpected candidate set')
    require(not PROTECTED.intersection(ids), 'Protected deployment in candidates')
    require(all(x['state'] == 'READY' and x['target'] == 'production'
                and x['sha'] and x['id'].startswith('dpl_') for x in plan['candidates']), 'Invalid candidate state')


def api(method, path, token, query=None):
    params = {'teamId': TEAM, **(query or {})}
    request = Request('https://api.vercel.com' + path + '?' + urlencode(params),
                      method=method, headers={'Authorization': 'Bearer ' + token,
                                              'Accept': 'application/json'})
    try:
        with build_opener(NoRedirect()).open(request, timeout=20) as response:
            body = response.read()
            return response.status, json.loads(body) if body else {}
    except HTTPError as error:
        # Deliberately do not echo request headers, tokens, or remote bodies.
        return error.code, {}


def aliases(token):
    status, data = api('GET', '/v4/aliases', token,
                       {'projectId': PROJECT, 'limit': 100})
    require(status == 200, 'Alias read failed: HTTP' + str(status))
    require(not data.get('pagination', {}).get('next'), 'Alias list needs refresh')
    return {x['alias']: x.get('deploymentId') or x.get('deployment', {}).get('id')
            for x in data['aliases']}


def check_aliases(plan, token, deleting=None):
    live = aliases(token)
    require(live.get(plan['productionAlias']) == plan['productionId'], 'Production moved; refresh plan')
    require(deleting is None or deleting not in live.values(), 'Candidate has an active alias')


def check_deployment(item, token):
    status, data = api('GET', '/v13/deployments/' + item['id'], token)
    require(status == 200, 'Deployment read failed: HTTP' + str(status))
    require((data.get('projectId') or data.get('project', {}).get('id')) == PROJECT, 'Wrong project')
    require(data.get('id') == item['id'], 'Wrong deployment')
    require(data.get('meta', {}).get('githubCommitSha') == item['sha'], 'Commit mismatch')
    require(data.get('readyState', data.get('state')) == 'READY', 'Deployment state changed')


def execute(plan, token, journal):
    validate(plan)
    report = {'teamId': TEAM, 'projectId': PROJECT, 'deleted': [], 'status': 'running'}
    def save():
        journal.write_text(json.dumps(report, indent=2) + '\n')
    save()
    try:
        check_aliases(plan, token)
        for item in plan['kept']:
            check_deployment(item, token)
        for item in plan['candidates']:
            check_aliases(plan, token, item['id'])
            check_deployment(item, token)
            status, _ = api('DELETE', '/v13/deployments/' + item['id'], token)
            require(status in (200, 202, 204), 'Delete failed: HTTP' + str(status))
            report['lastDeleteRequested'] = item['id']
            save()
            status, data = api('GET', '/v13/deployments/' + item['id'], token)
            require(status in (404, 410) or (status == 200 and
                    (data.get('deletedAt') or data.get('readyState') == 'DELETED')), 'Deletion not confirmed; stop')
            report['deleted'].append(item['id'])
            save()
        check_aliases(plan, token)
        for item in plan['kept']:
            check_deployment(item, token)
        report['status'] = 'deletions_verified'
    except Exception as error:
        report['status'] = 'stopped'
        report['error'] = type(error).__name__ + ': ' + str(error)
        raise
    finally:
        save()
    return report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--execute', action='store_true')
    args = parser.parse_args()
    plan = json.loads(PLAN.read_text())
    validate(plan)
    if not args.execute:
        print('OFFLINE PLAN: keep3; candidates21; no network calls or deletions.')
        return 0
    token = os.environ.get('VERCEL_TOKEN', '')
    if not token:
        print('BLOCKED: VERCEL_TOKEN is not configured; no network calls or deletions.')
        return 2
    result = execute(plan, token, ROOT / 'vercel-cleanup-result.json')
    print('Confirmed deletions:', len(result['deleted']))
    print('Storage savings must be read separately; not inferred from deployment count.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
