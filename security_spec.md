# Firestore Security Specification & Invariants

This specification outlines the Zero-Trust security barriers for the Firestore database backing the developer portfolio application.

## 1. Data Invariants

- **Read-Only Public Configuration**: Public singletons (`hero`, `about`, `social`, `footer`, `pricing`, `availability`, `email`) and display collections (`skills`, `projects`, `counters`, `services`) are readable by anyone, but can ONLY be modified by verified system administrators.
- **Strict Keys enforcement**: Any update or creation must validate the layout properties strictly. No additional unmapped fields can be injected.
- **Write-Only/Public-Post for Contacts & Bookings**: Document creations for both `/messages/{id}` and `/bookings/{id}` are open to the public to support user submissions. However, the list and retrieval operations are restricted only to the administrator.
- **Immutable Fields**: Timestamps and relational IDs cannot be updated or modified after creation.
- **System-Generated fields**: Booking status field (`status`) is system-controlled (e.g. `Pending`, `Confirmed`, `Cancelled`) and cannot be manipulated arbitrarily.

---

## 2. The "Dirty Dozen" Payloads (Exploit Payloads)

Each of the following payloads must return `PERMISSION_DENIED` under all conditions:

1. **Payload #1: Orphan Skill Hack** - Injecting a skill with a super long ID to trigger denial of wallet.
2. **Payload #2: Shadow Admin Injection** - Attempting to register or override `/settings/admin` profile with custom values.
3. **Payload #3: Public Site Title Defacement** - Unauthenticated updating of the navigation site branding in`/settings/footer`.
4. **Payload #4: Public Booking Override** - Attempting to read booking lists `/bookings` as a guest.
5. **Payload #5: Booking Corruption** - Creating a booking document without required fields like `email`.
6. **Payload #6: Shadow Booking State Edit** - Attempting to update a booking's status to "Confirmed" on creation.
7. **Payload #7: Message Poisoning** - Transmitting a contact message containing a 10MB body payload to exhaust DB limits.
8. **Payload #8: Guest Message Read** - Trying to query another visitor's messages in `/messages`.
9. **Payload #9: Immutable Timestamp Hijack** - Overwriting `createdAt` time in a message during an update.
10. **Payload #10: Project State Bypass** - Appending un-whitelisted keys (e.g. `isVerified: true`) to a project payload.
11. **Payload #11: Invisible Counter Adjustment** - Public user attempting to increase counter statistics in `/counters`.
12. **Payload #12: Fake availability slots** - Overwriting calendar slot allocations without admin privileges in `/settings/availability`.

---

## 3. Secured Rules Architecture

We define strict validation rules enforcing the constraints to secure everything. The final production rules are housed in `firestore.rules`.
