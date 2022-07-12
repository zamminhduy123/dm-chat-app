import { passwordStrength } from "check-password-strength";

export function StrengthChecker(password: string) {
  //const option = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{10,})/
  const result = passwordStrength(password);
  return result;
}
