import React, { createContext, useContext, useState, ReactNode } from 'react';

type SignupData = {
  fullName: string;
  dob: { month: string; year: string };
  gender: string;
  otp: string;
  email: string;             
  phone: string;             
  password: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zip: string;
  preferredTime: string;
  rating: number;
  profileImage: string | null;
};


type SignupContextType = {
  data: SignupData;
  updateData: (newData: Partial<SignupData>) => void;
};

const defaultData: SignupData = {
  fullName: '',
  dob: { month: '', year: '' },
  gender: '',
  otp: '',
  email: '',
  phone: '',
  password: '',
  address: '',
  city: '',
  state: '',
  country: '',
  zip: '',
  preferredTime: '',
  rating: 1,
  profileImage: null,
};

const SignupContext = createContext<SignupContextType | undefined>(undefined);

export const SignupProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<SignupData>(defaultData);

  const updateData = (newData: Partial<SignupData>) => {
    setData(prev => ({ ...prev, ...newData }));
  };

  return (
    <SignupContext.Provider value={{ data, updateData }}>
      {children}
    </SignupContext.Provider>
  );
};

export const useSignup = () => {
  const context = useContext(SignupContext);
  if (!context) throw new Error("useSignup must be used within SignupProvider");
  return context;
};