import { useSelector } from "react-redux";
import { RootState } from "@/store";

export const useAuth = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const authToken = useSelector((state: RootState) => state.auth.authToken);
  return { user, authToken };
};