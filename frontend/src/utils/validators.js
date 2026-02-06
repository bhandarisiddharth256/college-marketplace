// Thinking:
// Simple, readable validation
// We only care about college email domain for now

export const isCollegeEmail = (email) => {
  return email.endsWith('@college.edu');
};
