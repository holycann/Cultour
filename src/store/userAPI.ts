type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "penjelajah";
};

let userData: User[] = [];
let activeUser: User | null = null;

// POST Register user baru
export async function addUser({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) {
  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    password,
    role: "penjelajah" as const,
  };
  userData.push(newUser);
  return newUser;
}

// GET Semua user
export function getAllUsers(): User[] {
  return userData;
}

// POST Login user
export async function loginUser({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const user = userData.find(
    (u) => u.email === email && u.password === password
  );
  if (user) {
    activeUser = user;
    return user;
  }
  return null;
}

// GET user yang login
export function getActiveUser(): User | null {
  return activeUser;
}

// LOGOUT
export function logoutUser() {
  activeUser = null;
}
