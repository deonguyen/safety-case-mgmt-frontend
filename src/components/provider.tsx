import { LayoutProvider } from "./context/useLayoutContext";
import { UserSettingProvider } from "./context/user-setting-context";
import { ThemeProvider } from "./theme/theme-provider";

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <UserSettingProvider>
      <LayoutProvider>
        {children}
      </LayoutProvider>
    </UserSettingProvider>
  );
}
