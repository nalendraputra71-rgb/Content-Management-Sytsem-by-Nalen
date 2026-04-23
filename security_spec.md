# Security Specification: Your Company CMS Workspace RBAC

## 1. Data Invariants
- A `Content` document cannot be created without a valid `workspaceId`.
- Access to a Workspace (and its contents) is strictly derived from the `members` subcollection.
- `username` in `/users` must be unique (checked via application logic + future constraints).
- `ownerId` in a Workspace is immutable except via specific "Transfer Ownership" logic.

## 2. The Dirty Dozen (Threat Vectors)
1. **User B** attempts to read **User A's** private workspace content.
2. **Viewer** attempts to edit (update) a post in the workspace.
3. **Editor** attempts to delete the workspace itself.
4. **Member** attempts to change their own role from `viewer` to `owner`.
5. **Authenticated User** attempts to create content in a workspace they aren't a member of.
6. **Malicious Actor** attempts to use a spoofed `userId` in a payload.
7. **Attacker** attempts to update `workspaceId` of an existing content to hijack it.
8. **Unauthorized user** attempts to read a user's private PII (email) via the username lookup.
9. **Editor** attempts to add another member to the workspace.
10. **Viewer** attempts to enable `publicLinkEnabled`.
11. **Malicious User** attempts to create a document with a 1MB junk ID.
12. **Member** attempts to skip `published` status directly from `draft` violating workflow (if enforced).

## 3. RBAC Logic
- `isOwner(wsId)`: `get(/workspaces/$(wsId)/members/$(request.auth.uid)).data.role == "owner"`
- `isEditor(wsId)`: `role in ["owner", "editor"]`
- `isMember(wsId)`: `exists(/workspaces/$(wsId)/members/$(request.auth.uid))`
