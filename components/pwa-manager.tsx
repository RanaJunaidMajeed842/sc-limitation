"use client";

import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  Download,
  Loader2,
  RefreshCw,
  Share2,
  Smartphone,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaManager() {
  const [installed, setInstalled] = useState(false);
  const [ios, setIos] = useState(false);
  const [offline, setOffline] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [secure, setSecure] = useState(true);
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(
    null,
  );
  const [installing, setInstalling] = useState(false);
  const [updateWorker, setUpdateWorker] = useState<ServiceWorker | null>(null);
  const [updating, setUpdating] = useState(false);
  const reloadOnUpdate = useRef(false);

  useEffect(() => {
    const display = window.matchMedia("(display-mode: standalone)");
    const appleNavigator = navigator as Navigator & { standalone?: boolean };
    const detectInstalled = () =>
      setInstalled(display.matches || appleNavigator.standalone === true);
    const detectConnection = () => setOffline(!navigator.onLine);
    detectInstalled();
    detectConnection();
    setSecure(window.isSecureContext);
    setIos(
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1),
    );
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as InstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener("online", detectConnection);
    window.addEventListener("offline", detectConnection);
    display.addEventListener("change", detectInstalled);

    let disposed = false;
    let registration: ServiceWorkerRegistration | undefined;
    let installingWorker: ServiceWorker | null = null;
    let checkTimer: ReturnType<typeof setInterval> | undefined;
    const onControllerChange = () => {
      if (reloadOnUpdate.current) window.location.reload();
      else setReady(true);
    };
    const onStateChange = () => {
      if (
        installingWorker?.state === "installed" &&
        navigator.serviceWorker.controller
      )
        setUpdateWorker(registration?.waiting ?? installingWorker);
      if (
        installingWorker?.state === "redundant" &&
        !navigator.serviceWorker.controller
      )
        setFailed(true);
    };
    const onUpdateFound = () => {
      installingWorker?.removeEventListener("statechange", onStateChange);
      installingWorker = registration?.installing ?? null;
      installingWorker?.addEventListener("statechange", onStateChange);
    };
    if (
      "serviceWorker" in navigator &&
      window.isSecureContext &&
      process.env.NODE_ENV === "production"
    ) {
      navigator.serviceWorker.addEventListener(
        "controllerchange",
        onControllerChange,
      );
      navigator.serviceWorker
        .register("/sw.js", { scope: "/", updateViaCache: "none" })
        .then(async (reg) => {
          if (disposed) return;
          registration = reg;
          if (reg.waiting) setUpdateWorker(reg.waiting);
          reg.addEventListener("updatefound", onUpdateFound);
          onUpdateFound();
          await navigator.serviceWorker.ready;
          if (disposed) return;
          setReady(true);
          checkTimer = setInterval(
            () => {
              if (navigator.onLine) void reg.update().catch(() => {});
            },
            60 * 60 * 1000,
          );
        })
        .catch(() => {
          if (!disposed) setFailed(true);
        });
    }
    return () => {
      disposed = true;
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("online", detectConnection);
      window.removeEventListener("offline", detectConnection);
      display.removeEventListener("change", detectInstalled);
      navigator.serviceWorker?.removeEventListener(
        "controllerchange",
        onControllerChange,
      );
      registration?.removeEventListener("updatefound", onUpdateFound);
      installingWorker?.removeEventListener("statechange", onStateChange);
      if (checkTimer) clearInterval(checkTimer);
    };
  }, []);

  async function install() {
    if (!promptEvent) return;
    setInstalling(true);
    try {
      await promptEvent.prompt();
      // Accepted prompts may still be installing. appinstalled confirms completion.
      await promptEvent.userChoice;
    } catch {
      // Browser menu instructions remain available if the native prompt fails.
    } finally {
      setPromptEvent(null);
      setInstalling(false);
    }
  }

  return (
    <div className="mb-6 space-y-3">
      <div className="flex flex-col gap-3 rounded-xl border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-primary-text">
            <Smartphone className="size-4" />
          </span>
          <div>
            <p className="text-sm font-semibold">
              {installed
                ? "Your calculator, ready to go"
                : "Keep Limitation on your home screen"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {ready
                ? "Calculations and PDF tickets are ready offline."
                : failed
                  ? "Offline setup failed. Reopen while online to try again."
                  : "Install for quick access. Offline setup completes on your first online visit."}
            </p>
          </div>
        </div>
        {!installed && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="shrink-0">
                <Download /> Install app
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle className="pr-7 text-xl font-semibold">
                Install Limitation
              </DialogTitle>
              <DialogDescription className="mt-2 text-sm leading-6 text-muted-foreground">
                Open the calculator from your home screen in its own app window.
                Free, with no account required.
              </DialogDescription>
              {promptEvent && (
                <Button
                  className="mt-5 w-full"
                  disabled={installing}
                  onClick={install}
                >
                  {installing ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Download />
                  )}{" "}
                  Install on this device
                </Button>
              )}
              <div className="mt-5 space-y-5 text-sm">
                <div className={ios ? "rounded-xl border bg-muted/50 p-4" : ""}>
                  <h3 className="mb-2 flex items-center gap-2 font-semibold">
                    <Share2 className="size-4 text-primary-text" /> iPhone & iPad
                  </h3>
                  <ol className="ml-4 list-decimal space-y-2 text-muted-foreground">
                    <li>Open this website in Safari.</li>
                    <li>
                      Tap the browser&apos;s{" "}
                      <strong className="text-foreground">Share</strong> button.
                    </li>
                    <li>
                      Choose{" "}
                      <strong className="text-foreground">
                        Add to Home Screen
                      </strong>
                      , then tap{" "}
                      <strong className="text-foreground">Add</strong>.
                    </li>
                  </ol>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">Android</h3>
                  <p className="leading-6 text-muted-foreground">
                    {promptEvent
                      ? "Use the install button above, or "
                      : "Open this website in Chrome, then "}
                    open the browser menu and choose{" "}
                    <strong className="text-foreground">Install app</strong> or{" "}
                    <strong className="text-foreground">
                      Add to Home screen
                    </strong>
                    .
                  </p>
                </div>
              </div>
              <p className="mt-5 rounded-lg bg-muted p-3 text-xs leading-5 text-muted-foreground">
                {!secure
                  ? "Installation requires a secure HTTPS website. Open the deployed HTTPS link on your phone."
                  : "If you opened this link inside WhatsApp or another app, open it in Safari or Chrome first. Stay online until the calculator says it is ready offline."}
              </p>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <div
        role="status"
        aria-live="polite"
        className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground"
      >
        {offline ? (
          <span className="flex items-center gap-1.5">
            <WifiOff className="size-3.5" />{" "}
            {ready
              ? "Offline — calculations and PDF export remain available. Sharing needs a connection."
              : "You are offline. Reconnect to finish preparing the app."}
          </span>
        ) : ready ? (
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-primary-text" /> Ready for offline
            use
          </span>
        ) : (
          <span />
        )}
        {updateWorker && (
          <Button
            variant="outline"
            size="sm"
            disabled={updating}
            onClick={() => {
              if (
                !window.confirm(
                  "Update the app now? The calculator will reload and clear any entered case details.",
                )
              )
                return;
              reloadOnUpdate.current = true;
              setUpdating(true);
              updateWorker.postMessage({ type: "SKIP_WAITING" });
            }}
          >
            <RefreshCw className={updating ? "animate-spin" : ""} />{" "}
            {updating ? "Updating…" : "Update available"}
          </Button>
        )}
      </div>
    </div>
  );
}
