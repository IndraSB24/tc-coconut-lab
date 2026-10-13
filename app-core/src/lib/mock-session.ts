export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarInitials: string;
}

export const SIMULATED_USER: MockUser = {
  id: 'user-simulated',
  name: 'Indra SB',
  email: 'indra@coconut.io',
  role: 'SIMULATED_USER',
  avatarInitials: 'IS',
};

export const MOCK_USERS: MockUser[] = [SIMULATED_USER];
export const DEFAULT_MOCK_USER = SIMULATED_USER;
