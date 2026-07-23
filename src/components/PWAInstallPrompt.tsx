import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function PWAInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ios =
      /iphone|ipad|ipod/i.test(window.navigator.userAgent);

    setIsIOS(ios);

    const handler = (event: any) => {
      event.preventDefault();
      setInstallPrompt(event);
      setShow(true);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handler
    );

    // iOS does not support beforeinstallprompt.
    // Show manual install instructions.
    if (
      ios &&
      !window.matchMedia("(display-mode: standalone)").matches
    ) {
      setShow(true);
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handler
      );
    };
  }, []);

  async function installApp() {
    if (!installPrompt) return;

    installPrompt.prompt();

    await installPrompt.userChoice;

    setInstallPrompt(null);
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-5 left-5 right-5 z-50 rounded-xl border border-primary/30 bg-background/95 p-4 shadow-xl backdrop-blur-md">
      <p className="mb-3 font-mono text-sm text-white">
        {isIOS
          ? "Install XbarzForge: Tap Share → Add to Home Screen 🚀"
          : "Install XbarzForge as an app 🚀"}
      </p>

      {!isIOS && (
        <Button
          onClick={installApp}
          className="w-full bg-primary text-black"
        >
          Install XbarzForge
        </Button>
      )}
    </div>
  );
}