import { describe, expect, it, vi } from "vitest";
import {
  issueSocketAuthentication,
  readSocketAuthentication,
  type SocketAuthStore,
} from "./socket-auth";

function memoryStore() {
  const values = new Map<string, string>();
  const store = {
    get: vi.fn(async (key: string) => values.get(key) ?? null),
    set: vi.fn(async (key: string, value: string) => {
      values.set(key, value);
      return "OK" as const;
    }),
  } as unknown as SocketAuthStore;
  return { store, values };
}

describe("chat socket authentication", () => {
  it("resolves an issued opaque ticket from the cache", async () => {
    const { store } = memoryStore();
    const user = {
      id: "user-1",
      name: "Ada Student",
      accessExpiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    };

    const ticket = await issueSocketAuthentication(user, store, 300);

    expect(ticket).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(await readSocketAuthentication(ticket, store)).toEqual(user);
    expect(store.set).toHaveBeenCalledWith(
      expect.stringMatching(/^chat:socket-auth:v1:[a-f0-9]{64}$/),
      expect.any(String),
      "EX",
      300,
    );
  });

  it("rejects missing, malformed, expired, and corrupt cached tickets", async () => {
    const { store, values } = memoryStore();
    expect(await readSocketAuthentication("not-a-ticket", store)).toBeNull();

    const expiredTicket = await issueSocketAuthentication(
      {
        id: "user-1",
        name: "Ada Student",
        accessExpiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      },
      store,
      -1,
    );
    expect(await readSocketAuthentication(expiredTicket, store)).toBeNull();

    const validTicket = await issueSocketAuthentication(
      {
        id: "user-2",
        name: "Tayo Student",
        accessExpiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      },
      store,
      300,
    );
    const key = [...values.keys()].find((candidate) =>
      values.get(candidate)?.includes("user-2"),
    );
    values.set(key!, "not-json");
    expect(await readSocketAuthentication(validTicket, store)).toBeNull();
  });
});
