import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../store/userStore";

export function useRequireAuth(redirectTo: string) {
  const { user } = useUserStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true, state: { from: redirectTo } });
    }
  }, [user, navigate, redirectTo]);
}