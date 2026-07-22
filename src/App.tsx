import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, Show, useClerk } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { dark } from '@clerk/themes';
import { Switch, Route, useLocation, Router as WouterRouter, Redirect, Link } from 'wouter';
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Projects from "@/pages/projects/index";
import NewProject from "@/pages/projects/new";
import ProjectDetail from "@/pages/projects/detail";
import SearchPage from "@/pages/search";
import ProfilePage from "@/pages/profile";
import About from "@/pages/about";
import DemoPage from "@/pages/demo";
import AppShell from "@/components/layout/app-shell";
import { Terminal } from "lucide-react";

const queryClient = new QueryClient();

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

// Missing key — we render a setup screen instead of crashing.
const missingClerkKey = !clerkPubKey;

function MissingConfigScreen() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-6">
      <div className="max-w-lg w-full rounded-xl border border-border bg-card p-8 text-center space-y-4">
        <div className="flex justify-center">
          <Terminal className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-2xl font-bold font-mono text-foreground">XbarzForge</h1>
        <p className="text-muted-foreground">
          Authentication is not configured. Add{" "}
          <code className="bg-secondary px-1.5 py-0.5 rounded text-sm font-mono text-primary">
            VITE_CLERK_PUBLISHABLE_KEY
          </code>{" "}
          to your environment variables to enable login.
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          See <span className="text-primary">.env.example</span> for all required variables.
        </p>
      </div>
    </div>
  );
}

const clerkAppearance = {
  theme: dark,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "hsl(189 94% 43%)",
    colorForeground: "hsl(210 40% 98%)",
    colorMutedForeground: "hsl(215 20% 65%)",
    colorDanger: "hsl(0 62% 30%)",
    colorBackground: "hsl(228 15% 8%)",
    colorInput: "hsl(228 15% 15%)",
    colorInputForeground: "hsl(210 40% 98%)",
    colorNeutral: "hsl(228 15% 15%)",
    fontFamily: "'Outfit', sans-serif",
    borderRadius: "0.5rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-[#14151a] rounded-2xl w-[440px] max-w-full overflow-hidden border border-[#202126]",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-white font-semibold text-xl",
    headerSubtitle: "text-gray-400",
    socialButtonsBlockButtonText: "text-white",
    formFieldLabel: "text-gray-300",
    footerActionLink: "text-primary hover:text-primary/80",
    footerActionText: "text-gray-400",
    dividerText: "text-gray-500",
    identityPreviewEditButton: "text-primary",
    formFieldSuccessText: "text-green-400",
    alertText: "text-red-400",
    logoBox: "mb-6",
    logoImage: "w-10 h-10",
    socialButtonsBlockButton: "border-[#202126] hover:bg-[#202126] bg-transparent",
    formButtonPrimary: "bg-primary text-black hover:bg-primary/90 font-medium",
    formFieldInput: "bg-[#202126] border-[#202126] text-white focus:border-primary",
    footerAction: "bg-transparent",
    dividerLine: "bg-[#202126]",
    alert: "bg-red-900/20 border-red-900/50",
    otpCodeFieldInput: "bg-[#202126] border-[#202126] text-white",
    formFieldRow: "mb-4",
    main: "w-full gap-4 flex flex-col",
  },
};

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/dashboard" />
      </Show>
      <Show when="signed-out">
        <Landing />
      </Show>
    </>
  );
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType<any> }) {
  return (
    <>
      <Show when="signed-in">
        <AppShell>
          <Component />
        </AppShell>
      </Show>
      <Show when="signed-out">
        <Redirect to="/" />
      </Show>
    </>
  );
}

function AboutPageRoute() {
  return (
    <>
      <Show when="signed-in">
        <AppShell><About /></AppShell>
      </Show>
      <Show when="signed-out">
        <div className="min-h-[100dvh] bg-background flex flex-col">
          <header className="flex h-20 items-center px-6 md:px-12 border-b border-white/5 bg-background/50 backdrop-blur-md">
            <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80">
              <Terminal className="h-6 w-6" />
              <span className="font-mono font-bold text-xl tracking-tight text-white">XbarzForge</span>
            </Link>
          </header>
          <About />
          <footer className="shrink-0 border-t border-border/50 py-4 text-center text-xs text-muted-foreground font-mono">
            © 2026 XbarzForge | Built by Abdulrahman Adisa Amuda (RahmanXBarz) | Created for OpenAI Build Week 2026
          </footer>
        </div>
      </Show>
    </>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const queryClient = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        queryClient.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, queryClient]);

  return null;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ClerkQueryClientCacheInvalidator />
          <Switch>
            <Route path="/" component={HomeRedirect} />
            <Route path="/about" component={AboutPageRoute} />
            <Route path="/demo" component={DemoPage} />
            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />
            <Route path="/dashboard">
              {() => <ProtectedRoute component={Dashboard} />}
            </Route>
            <Route path="/projects">
              {() => <ProtectedRoute component={Projects} />}
            </Route>
            <Route path="/projects/new">
              {() => <ProtectedRoute component={NewProject} />}
            </Route>
            <Route path="/projects/:id">
              {() => <ProtectedRoute component={ProjectDetail} />}
            </Route>
            <Route path="/search">
              {() => <ProtectedRoute component={SearchPage} />}
            </Route>
            <Route path="/profile">
              {() => <ProtectedRoute component={ProfilePage} />}
            </Route>
            <Route>
              <div className="flex h-[100dvh] items-center justify-center bg-background text-foreground">
                <div className="text-center">
                  <h1 className="text-4xl font-bold tracking-tight text-primary font-mono">404</h1>
                  <p className="mt-2 text-muted-foreground font-mono">File not found.</p>
                </div>
              </div>
            </Route>
          </Switch>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  if (missingClerkKey) {
    return <MissingConfigScreen />;
  }

  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
