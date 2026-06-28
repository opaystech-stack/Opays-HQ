import { beforeAll, describe, expect, it } from "vitest";
import jwt from "jsonwebtoken";

// server/auth.ts reads JWT_SECRET from process.env at module load time
// (`const JWT_SECRET = process.env.JWT_SECRET as string`). The secret must be
// set to a valid value (>= 32 chars) BEFORE the module is imported, so we use a
// dynamic import inside beforeAll after assigning the env var.
const TEST_SECRET = "test-jwt-secret-value-1234567890-abcdef"; // 39 chars (>= 32)

type AuthModule = typeof import("../auth.js");

let authModule: AuthModule;

const sampleUser = {
  id: "user-123",
  email: "operator@opays.io",
  role_name: "admin",
  role_label: "Administrateur",
};

beforeAll(async () => {
  process.env.JWT_SECRET = TEST_SECRET;
  authModule = (await import("../auth.js")) as unknown as AuthModule;
});

describe("generateToken / token verification (Requirement 3.3)", () => {
  it("round-trips a generated token through verification", () => {
    const token = authModule.generateToken(sampleUser);
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(0);

    // Verifying with the same secret returns the encoded claims.
    const decoded = jwt.verify(token, TEST_SECRET) as Record<string, unknown>;
    expect(decoded.id).toBe(sampleUser.id);
    expect(decoded.email).toBe(sampleUser.email);
    expect(decoded.role_name).toBe(sampleUser.role_name);
    expect(decoded.role_label).toBe(sampleUser.role_label);
  });

  it("rejects a token whose payload has been tampered with", () => {
    const token = authModule.generateToken(sampleUser);

    // Tamper with the payload segment (middle part of the JWT).
    const [header, payload, signature] = token.split(".");
    const decodedPayload = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    );
    decodedPayload.role_name = "super-admin";
    const tamperedPayload = Buffer.from(
      JSON.stringify(decodedPayload)
    ).toString("base64url");
    const tamperedToken = `${header}.${tamperedPayload}.${signature}`;

    expect(() => jwt.verify(tamperedToken, TEST_SECRET)).toThrow();
  });

  it("rejects a token signed with a different secret", () => {
    const foreignToken = jwt.sign(sampleUser, "a-different-secret-value-1234567890");
    expect(() => jwt.verify(foreignToken, TEST_SECRET)).toThrow();
  });

  it("rejects a structurally invalid token string", () => {
    expect(() => jwt.verify("not-a-real-jwt", TEST_SECRET)).toThrow();
  });
});
