'use server';

export type FormState = {
  message: string;
  errors?: {
    [key: string]: string[] | undefined;
  };
};
