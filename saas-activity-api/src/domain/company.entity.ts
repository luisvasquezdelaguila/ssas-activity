// src/domain/company.entity.ts

export interface CompanySettings {
  timezone: string;
  workingHours: {
    start: string;
    end: string;
  };
  allowUserSelfRegistration: boolean;
}

export interface Company {
  id: string;
  name: string;
  domain: string;
  settings: CompanySettings;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}
