import { describe, expect, it } from "vitest";
import {
  authCredentialsSchema,
  onboardingSchema,
  studentRegistrationSchema,
} from "./auth";

describe("authentication validation", () => {
  it("normalises an account email", () => {
    expect(
      authCredentialsSchema.parse({
        email: " doctor@example.com ",
        password: "secure-password",
      }).email,
    ).toBe("doctor@example.com");
  });
  it("requires a password of at least eight characters", () => {
    expect(
      authCredentialsSchema.safeParse({
        email: "doctor@example.com",
        password: "short",
      }).success,
    ).toBe(false);
  });
  it("requires complete student profile details and a supported country", () => {
    expect(
      onboardingSchema.safeParse({
        firstName: "Ada",
        lastName: "Doe",
        username: "ada_doe",
        countryCode: "Nigeria",
        phoneCountryCode: "+234",
        phoneNumber: "8012345678",
        studyStage: "step2ck",
      }).success,
    ).toBe(false);
  });

  it("accepts residency-interview registration and normalises the phone", () => {
    const registration = studentRegistrationSchema.parse({
      email: " ada@example.com ",
      password: "secure-password",
      firstName: " Ada ",
      lastName: " Doe ",
      username: "Ada_Doe",
      countryCode: "ng",
      phoneCountryCode: "+234",
      phoneNumber: "080 1234-5678",
      medicalSchool: "",
      trainingLevel: "Medical graduate",
      studyStage: "residency_interviews",
      acceptedTerms: "on",
    });

    expect(registration).toMatchObject({
      email: "ada@example.com",
      firstName: "Ada",
      lastName: "Doe",
      username: "ada_doe",
      countryCode: "NG",
      phoneNumber: "08012345678",
      studyStage: "residency_interviews",
    });
  });

  it("rejects usernames containing spaces or punctuation", () => {
    const result = onboardingSchema.safeParse({
      username: "Ada Doe!",
      firstName: "Ada",
      lastName: "Doe",
      countryCode: "NG",
      phoneCountryCode: "+234",
      phoneNumber: "8012345678",
      studyStage: "step2ck",
      acceptedTerms: "on",
    });

    expect(result.success).toBe(false);
  });
});
