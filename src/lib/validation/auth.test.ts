import { describe, expect, it } from "vitest";
import {
  authCredentialsSchema,
  feedbackPageTestimonialSchema,
  onboardingSchema,
  studentRegistrationSchema,
  testimonialSchema,
} from "./auth";

describe("authentication validation", () => {
  const completeRegistration = {
    email: "ada@example.com",
    password: "secure-password",
    firstName: "Ada",
    lastName: "Doe",
    username: "ada_doe",
    countryCode: "NG",
    phoneCountryCode: "+234",
    phoneNumber: "8012345678",
    studyStage: "step2ck" as const,
    signupSource: "google" as const,
    acceptedTerms: "on",
  };

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

  it.each([
    "username",
    "email",
    "firstName",
    "lastName",
    "phoneNumber",
  ] as const)("requires %s during student registration", (field) => {
    expect(
      studentRegistrationSchema.safeParse({
        ...completeRegistration,
        [field]: "",
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
      signupSource: "word_of_mouth",
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
      signupSource: "word_of_mouth",
    });
  });

  it("requires a supported signup source", () => {
    expect(
      studentRegistrationSchema.safeParse({
        ...completeRegistration,
        signupSource: "newspaper",
      }).success,
    ).toBe(false);
  });

  it("requires details when the signup source is other", () => {
    expect(
      studentRegistrationSchema.safeParse({
        ...completeRegistration,
        signupSource: "other",
      }).success,
    ).toBe(false);
    expect(
      studentRegistrationSchema.safeParse({
        ...completeRegistration,
        signupSource: "other",
        signupSourceOther: "University conference",
      }).success,
    ).toBe(true);
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

  it("accepts half-star testimonials and rejects other fractions", () => {
    const review = {
      fromStage: "step1",
      toStage: "step2ck",
      comment: "The question explanations helped me focus my review.",
      foundUseful: "yes",
      wouldRecommend: "yes",
    };

    expect(
      testimonialSchema.safeParse({ ...review, rating: "4.5" }).success,
    ).toBe(true);
    expect(
      testimonialSchema.safeParse({ ...review, rating: "4.2" }).success,
    ).toBe(false);
  });

  it("accepts feedback-page testimonials without a stage transition", () => {
    expect(
      feedbackPageTestimonialSchema.safeParse({
        comment: "Magna-Q has supported my preparation so far.",
        rating: "5",
        foundUseful: "yes",
        wouldRecommend: "yes",
      }).success,
    ).toBe(true);
  });
});
