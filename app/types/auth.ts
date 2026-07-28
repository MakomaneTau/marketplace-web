export type UserRole = "buyer" | "seller";

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
    firstName: string;
    lastName:string;
    email: string;
    password:string;
    confirmPassword: string;

    roel : UserRole;

    isStudent: boolean;

    university?: string;
    studentNumber?: string;
}