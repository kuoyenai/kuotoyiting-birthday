"""Safety checks with API calls fully mocked. Never sends a DELETE request."""
import copy
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
import vercel_cleanup as cleanup


class Safety(unittest.TestCase):
    def setUp(self):
        self.plan = json.loads(cleanup.PLAN.read_text())

    def test_scope(self):
        changed = copy.deepcopy(self.plan)
        changed['projectId'] = 'other'
        with self.assertRaises(cleanup.SafetyError):
            cleanup.validate(changed)

    def test_protected_candidate(self):
        self.plan['candidates'][0] = self.plan['kept'][0]
        with self.assertRaises(cleanup.SafetyError):
            cleanup.validate(self.plan)

    def test_duplicate_candidate(self):
        self.plan['candidates'][0] = self.plan['candidates'][1]
        with self.assertRaises(cleanup.SafetyError):
            cleanup.validate(self.plan)

    def test_offline_default(self):
        with patch('sys.argv', ['cleanup']), patch.object(cleanup, 'api') as api:
            self.assertEqual(cleanup.main(), 0)
            api.assert_not_called()

    def test_missing_token(self):
        with patch('sys.argv', ['cleanup', '--execute']), patch.dict('os.environ', {}, clear=True), patch.object(cleanup, 'api') as api:
            self.assertEqual(cleanup.main(), 2)
            api.assert_not_called()

    def test_auth_failure_stops_before_delete(self):
        with tempfile.TemporaryDirectory() as folder, patch.object(cleanup, 'api', return_value=(403, {})) as api:
            with self.assertRaises(cleanup.SafetyError):
                cleanup.execute(self.plan, 'test-only', Path(folder) / 'result.json')
            self.assertEqual([c.args[0] for c in api.call_args_list], ['GET'])

    def test_production_moved(self):
        with patch.object(cleanup, 'aliases', return_value={self.plan['productionAlias']: 'new'}):
            with self.assertRaises(cleanup.SafetyError):
                cleanup.check_aliases(self.plan, 'test-only')

    def test_new_alias_protects_candidate(self):
        live = {self.plan['productionAlias']: self.plan['productionId'], 'preview.example': self.plan['candidates'][0]['id']}
        with patch.object(cleanup, 'aliases', return_value=live):
            with self.assertRaises(cleanup.SafetyError):
                cleanup.check_aliases(self.plan, 'test-only', self.plan['candidates'][0]['id'])


if __name__ == '__main__':
    unittest.main()
