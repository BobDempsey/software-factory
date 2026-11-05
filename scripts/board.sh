#!/usr/bin/env bash
# Board operations for the factory. Every gh/GraphQL call the sync skill needs,
# wrapped so the skill can be allow-listed to this one script.
#
#   board.sh list                   every card: status, type, number, labels
#   board.sh ids                    the column name -> option id map
#   board.sh move <ITEM_ID> <COL>   set a card's Status
#   board.sh convert <ITEM_ID>      turn a draft card into a real issue
#   board.sh check                  verify board.json matches the live board
#   board.sh add <N>                put issue N on the board, No Status
#   board.sh file <TITLE> <BODYFILE> file a factory:triage issue and add it
set -euo pipefail

CFG="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/.factory/board.json"
[ -f "$CFG" ] || { echo "missing $CFG" >&2; exit 1; }
# python here is native Windows in this environment, so hand it a Windows path
CFGP="$CFG"
command -v cygpath >/dev/null 2>&1 && CFGP="$(cygpath -w "$CFG")"

jqc() { python -c "import json;print(json.load(open(r'''$CFGP''',encoding='utf-8'))$1)"; }

OWNER=$(jqc "['owner']")
NUMBER=$(jqc "['projectNumber']")
PROJECT_ID=$(jqc "['projectId']")
FIELD_ID=$(jqc "['statusFieldId']")
REPO=$(jqc "['repo']")

case "${1:-}" in

list)
  gh project item-list "$NUMBER" --owner "$OWNER" --format json | python -c '
import sys, json
d = json.load(sys.stdin)
if not d["items"]:
    print("board is empty")
for i in d["items"]:
    c = i.get("content", {}) or {}
    status = i.get("status") or "No Status"
    num = c.get("number")
    labels = ",".join(l["name"] for l in (c.get("labels") or [])) or "-"
    print("%s\t%s\t%s\t%s\t%s\t%s" % (
        i["id"], status, c.get("type", "DraftIssue"),
        ("#%s" % num) if num else "-", labels,
        (c.get("title") or i.get("title") or "")[:70]))
'
  ;;

ids)
  gh api graphql -f query="query{node(id:\"$FIELD_ID\"){... on ProjectV2SingleSelectField{options{id name}}}}" \
    | python -c '
import sys, json
for o in json.load(sys.stdin)["data"]["node"]["options"]:
    print("%s\t%s" % (o["name"], o["id"]))
'
  ;;

move)
  ITEM="${2:?item id}"; COL="${3:?column name}"
  OPT=$(gh api graphql -f query="query{node(id:\"$FIELD_ID\"){... on ProjectV2SingleSelectField{options{id name}}}}" \
    | python -c "
import sys, json
want = '''$COL'''.strip().lower()
hit = [o['id'] for o in json.load(sys.stdin)['data']['node']['options'] if o['name'].strip().lower() == want]
if not hit:
    sys.exit('no column named %r' % '''$COL''')
print(hit[0])
")
  gh project item-edit --id "$ITEM" --project-id "$PROJECT_ID" \
    --field-id "$FIELD_ID" --single-select-option-id "$OPT" >/dev/null
  echo "moved $ITEM -> $COL"
  ;;

convert)
  ITEM="${2:?item id}"
  RID=$(gh repo view "$REPO" --json id -q .id)
  gh api graphql -f query="
mutation{
  convertProjectV2DraftIssueItemToIssue(input:{
    itemId:\"$ITEM\", repositoryId:\"$RID\"})
  { item { content { ... on Issue { number url } } } }}" \
    | python -c '
import sys, json
c = json.load(sys.stdin)["data"]["convertProjectV2DraftIssueItemToIssue"]["item"]["content"]
print("converted to #%s  %s" % (c["number"], c["url"]))
'
  ;;

check)
  echo "config:"; cat "$CFG"; echo; echo "live columns:"; "$0" ids
  ;;

add)
  N="${2:?issue number}"
  URL=$(gh issue view "$N" --repo "$REPO" --json url -q .url)
  ITEM=$(gh project item-add "$NUMBER" --owner "$OWNER" --url "$URL" --format json -q .id)
  echo "added #$N as $ITEM, No Status"
  ;;

file)
  TITLE="${2:?title}"; BODY="${3:?body file}"
  URL=$(gh issue create --repo "$REPO" --title "$TITLE" --body-file "$BODY" --label "factory:triage")
  "$0" add "${URL##*/}"
  ;;

*)
  sed -n '2,12p' "${BASH_SOURCE[0]}"; exit 1
  ;;
esac
