import { createContext, useEffect, useState, useContext } from "react";

type UserRole = "ADMIN" | "DOCGIA" | null;

interface AuthContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType>({
  role: null,
  setRole: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [role, setRoleState] = useState<UserRole>(null);

  useEffect(() => {
    const savedRole = localStorage.getItem("role");
    if (savedRole === "ADMIN" || savedRole === "DOCGIA") {
      setRoleState(savedRole);
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

  return (
    <AuthContext.Provider value={{ role, setRole }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
