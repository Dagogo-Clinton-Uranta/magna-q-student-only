# ADR 0007: Bounded initial block sampling

Status: accepted (2026-07-21)

Eligibility uses indexed `EXISTS` predicates so many-to-many joins cannot multiply questions. Usage history is defined by absence, presence, or the latest `(answered_at, id)` attempt.

Block generation counts eligible IDs, chooses a random offset into their stable UUID ordering, limits work to a candidate pool of at least 200 or twenty times the requested size, and hashes only that bounded pool with a stored random seed. The selected membership, position and option order are committed atomically. This avoids an unbounded `ORDER BY random()` over the full bank while keeping the sampling implementation replaceable as the bank grows.
