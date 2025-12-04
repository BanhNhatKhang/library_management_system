import { createContext, useEffect, useState, useContext } from "react";

type UserRole = "ADMIN" | "DOCGIA" | "NHANVIEN" | "THUTHU" | "QUANLY" | null;

interface AuthContextType {
  role: UserRole;
  name: string | null;
  setRole: (role: UserRole) => void;
  setName: (name: string | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  role: null,
  name: null,
  setRole: () => {},
  setName: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [role, setRoleState] = useState<UserRole>(null);
  const [name, setNameState] = useState<string | null>(null);

  useEffect(() => {
    const savedRole = localStorage.getItem("role");
    const savedName = localStorage.getItem("name");

    if (
      savedRole === "ADMIN" ||
      savedRole === "DOCGIA" ||
      savedRole === "NHANVIEN" ||
      savedRole === "THUTHU" ||
      savedRole === "QUANLY"
    ) {
      setRoleState(savedRole);
    }

    if (savedName) {
      setNameState(savedName);
    }
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (newRole) {
      localStorage.setItem("role", newRole);
    } else {
      localStorage.removeItem("role");
    }
  };

  const setName = (newName: string | null) => {
    setNameState(newName);
    if (newName) {
      localStorage.setItem("name", newName);
    } else {
      localStorage.removeItem("name");
    }
  };

  const logout = () => {
    setRoleState(null);
    setNameState(null);
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
  };

  return (
    <AuthContext.Provider value={{ role, name, setRole, setName, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
